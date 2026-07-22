/**
 * JW-ISS-8: prune junk product rows from the projects table.
 *
 * Policy (decided 2026-07-21):
 *   - DELETE rows with no http(s) url — placeholder imports (p-1..p-8,
 *     "🎯 Mission", portfolio-overview, product-details, ...). Any linked
 *     posts get projectId nulled first (field is nullable).
 *   - DELETE the ARCHIVED `aimpact-scanner` duplicate after reassigning its
 *     posts to the live `aimpactscanner` row (same product, two rows).
 *   - KEEP real retired products (seo-agent, solomarket, asmge): ARCHIVED
 *     with real URLs is product history, not junk. Already hidden on-site.
 *
 * Dry-run by default. Run with --apply to delete.
 * Usage:  npx tsx scripts/prune-junk-projects.ts [--apply]
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const DUP_SLUG = 'aimpact-scanner'; // duplicate row
const DUP_TARGET_SLUG = 'aimpactscanner'; // live row its posts move to

async function main() {
  const all = await prisma.project.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      url: true,
      status: true,
      _count: { select: { posts: true, metricsHistory: true } },
    },
    orderBy: { id: 'asc' },
  });

  const noUrl = all.filter((p) => !p.url?.startsWith('http'));
  const dup = all.find((p) => p.slug === DUP_SLUG);
  const dupTarget = all.find((p) => p.slug === DUP_TARGET_SLUG);
  const toDelete = [...noUrl, ...(dup ? [dup] : [])];
  const keep = all.filter((p) => !toDelete.includes(p));

  console.log(`\n=== KEEP (${keep.length}) ===`);
  for (const p of keep) console.log(`  ${p.slug} | ${p.status} | ${p.url}`);

  console.log(`\n=== DELETE (${toDelete.length}) ===`);
  for (const p of toDelete) {
    const action =
      p.slug === DUP_SLUG
        ? `posts=${p._count.posts} -> reassign to ${DUP_TARGET_SLUG}`
        : p._count.posts > 0
          ? `posts=${p._count.posts} -> unlink (projectId=null)`
          : 'no posts';
    console.log(`  ${p.slug} | '${p.name}' | ${p.status} | url='${p.url}' | ${action}`);
  }

  if (dup && !dupTarget) {
    throw new Error(`Duplicate ${DUP_SLUG} present but target ${DUP_TARGET_SLUG} not found — aborting.`);
  }

  if (!APPLY) {
    console.log(`\nDry run. Re-run with --apply to execute.`);
    return;
  }

  for (const p of toDelete) {
    if (p.slug === DUP_SLUG && dupTarget) {
      const moved = await prisma.post.updateMany({
        where: { projectId: p.id },
        data: { projectId: dupTarget.id },
      });
      console.log(`reassigned ${moved.count} post(s) ${p.slug} -> ${dupTarget.slug}`);
    } else if (p._count.posts > 0) {
      const unlinked = await prisma.post.updateMany({
        where: { projectId: p.id },
        data: { projectId: null },
      });
      console.log(`unlinked ${unlinked.count} post(s) from ${p.slug}`);
    }
    await prisma.metricsHistory.deleteMany({ where: { projectId: p.id } });
    await prisma.project.delete({ where: { id: p.id } });
    console.log(`deleted ${p.slug}`);
  }

  const remaining = await prisma.project.count();
  const orphanPosts = await prisma.post.count({ where: { projectId: null } });
  console.log(`\nDone. ${toDelete.length} deleted, ${remaining} projects remain, ${orphanPosts} posts without a project link.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
