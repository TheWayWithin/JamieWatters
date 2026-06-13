/**
 * Proof stats — verifiable, on-brand metrics for the /dashboard (Proof) page.
 *
 * Real data only: articles published (DB), GitHub stars (live API), and
 * product counts (DB). No MRR / vanity metrics. Every call is wrapped so a
 * failed DB or GitHub request degrades gracefully instead of breaking the build.
 */

import { prisma } from './prisma';
import { ProjectStatus } from '@prisma/client';
import { parseGitHubUrl } from './github';

export interface ProofStats {
  articles: number;
  githubStars: number;
  reposCounted: number;
  productsLive: number;
  productsTotal: number;
  /** Whether the GitHub star total is complete (all tracked repos responded). */
  starsComplete: boolean;
}

async function getArticleCount(): Promise<number> {
  try {
    return await prisma.post.count({ where: { published: true } });
  } catch (error) {
    console.error('Proof: failed to count articles:', error);
    return 0;
  }
}

interface ProductCounts {
  productsLive: number;
  productsTotal: number;
  repoSlugs: string[];
}

async function getProducts(): Promise<ProductCounts> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        url: { startsWith: 'http' },
        status: { not: ProjectStatus.ARCHIVED },
      },
      select: { status: true, url: true, githubUrl: true },
    });

    const productsLive = projects.filter((p) => p.status === ProjectStatus.LIVE).length;

    // Distinct repos across url + githubUrl, case-insensitive.
    const repos = new Map<string, string>();
    for (const p of projects) {
      for (const candidate of [p.githubUrl, p.url]) {
        if (!candidate || !candidate.includes('github.com')) continue;
        const parsed = parseGitHubUrl(candidate);
        if (parsed) repos.set(`${parsed.owner}/${parsed.repo}`.toLowerCase(), `${parsed.owner}/${parsed.repo}`);
      }
    }

    return {
      productsLive,
      productsTotal: projects.length,
      repoSlugs: [...repos.values()],
    };
  } catch (error) {
    console.error('Proof: failed to load products:', error);
    return { productsLive: 0, productsTotal: 0, repoSlugs: [] };
  }
}

async function fetchRepoStars(ownerRepo: string): Promise<number | null> {
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'JamieWatters-BuildInPublic/1.0',
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`https://api.github.com/repos/${ownerRepo}`, {
      headers,
      next: { revalidate: 3600 }, // refresh hourly
    });
    if (!res.ok) return null; // private/missing repo or rate-limited -> skip
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

/**
 * Aggregate proof stats. GitHub stars are summed across all tracked public
 * repos; any repo that doesn't respond is skipped and flagged via starsComplete.
 */
export async function getProofStats(): Promise<ProofStats> {
  const [articles, products] = await Promise.all([getArticleCount(), getProducts()]);

  const starResults = await Promise.all(products.repoSlugs.map(fetchRepoStars));
  const githubStars = starResults.reduce<number>((sum, s) => sum + (s ?? 0), 0);
  const reposCounted = starResults.filter((s) => s !== null).length;

  return {
    articles,
    githubStars,
    reposCounted,
    productsLive: products.productsLive,
    productsTotal: products.productsTotal,
    starsComplete: reposCounted === products.repoSlugs.length,
  };
}
