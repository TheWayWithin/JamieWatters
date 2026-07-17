/**
 * PRJ-18 Wave 3 T3 — migrate the filesystem /blog posts into Neon.
 *
 * Reads content/blog/*.md through the SAME parser the site uses (lib/blog.ts),
 * so only real dated posts with frontmatter are considered (the two trader-7
 * spec/draft files are skipped by the parser — they are not posts). Upserts each
 * into the Post table by slug, so re-runs are idempotent and safe.
 *
 * SAFE BY DEFAULT: dry-run prints the plan and writes NOTHING. `--apply` writes.
 *   npx tsx scripts/migrate-blog-to-neon.ts          # dry-run
 *   npx tsx scripts/migrate-blog-to-neon.ts --apply   # write
 *
 * Images: these 5 posts use committed relative paths under public/images/blog/,
 * which keep resolving after migration (see CLAUDE.md "Blog Hero Images"). No R2
 * upload needed here.
 *
 * Topics/type are pre-assigned per post below (reviewed against the T2 vocab).
 * Editorial type defaults to build-log; the two essay-leaning posts are noted in
 * the summary for Jamie to flip in the admin editor (T6) if he wants.
 */

import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { getAllBlogPosts, getBlogPostBySlug } from '../lib/blog';
import { type Topic, type EditorialType, normalizeTopics } from '../lib/taxonomy';

const APPLY = process.argv.includes('--apply');

/** Reviewed facet assignments for the 5 legacy posts (T2 priority, cap 2). */
const FACETS: Record<string, { topics: Topic[]; editorialType: EditorialType }> = {
  'ai-cofounder': { topics: ['ai', 'building'], editorialType: 'build-log' },
  'graphify-six-ais': { topics: ['ai', 'building'], editorialType: 'build-log' },
  'the-three-options-trap': { topics: ['thinking', 'ai'], editorialType: 'build-log' },
  'i-ran-graphify': { topics: ['ai', 'building'], editorialType: 'build-log' },
  'same-tool-two-ways': { topics: ['ai', 'building'], editorialType: 'build-log' },
};

async function main() {
  const metas = getAllBlogPosts();
  console.log(`\n=== Wave 3 T3 blog→Neon ${APPLY ? '(APPLYING)' : '(DRY RUN — no writes)'} ===`);
  console.log(`filesystem posts found by parser: ${metas.length}`);

  let written = 0;
  let skipped = 0;

  for (const meta of metas) {
    const post = getBlogPostBySlug(meta.slug);
    if (!post) {
      console.log(`  SKIP  ${meta.slug} (parser returned no body)`);
      skipped += 1;
      continue;
    }

    const facet = FACETS[post.slug] ?? { topics: [], editorialType: 'build-log' as EditorialType };
    const topics = normalizeTopics(facet.topics);
    const publishedAt = new Date(`${post.date}T00:00:00Z`);

    const existing = await prisma.post.findUnique({ where: { slug: post.slug }, select: { id: true } });
    console.log(
      `  ${existing ? 'UPSERT(exists)' : 'INSERT'}  ${post.slug}  ` +
        `[${topics.join(', ') || 'no-topics'} | ${facet.editorialType}] ` +
        `img=${post.image ?? 'none'}`
    );

    if (APPLY) {
      const common = {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        readTime: post.readTime,
        postType: 'manual',
        topics,
        editorialType: facet.editorialType,
        published: !post.draft,
        publishedAt,
        image: post.image ?? null,
        imageAlt: post.imageAlt ?? null,
        projectId: null,
        updatedAt: new Date(),
      };
      await prisma.post.upsert({
        where: { slug: post.slug },
        update: common,
        create: { id: crypto.randomUUID(), slug: post.slug, createdAt: publishedAt, ...common },
      });
    }
    written += 1;
  }

  console.log(`\nposts to migrate: ${written}${skipped ? `  (skipped ${skipped})` : ''}`);
  console.log(
    `note: ai-cofounder and the-three-options-trap read as essays; left as ` +
      `build-log for consistency — flip in the admin editor (T6) if wanted.`
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
