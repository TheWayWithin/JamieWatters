/**
 * Featured-products reshuffle (2026-07-19).
 *
 * Primary lineup = ai-search-arena, aisearchmastery, executor-file.
 * Promote executor-file; demote modeloptix + plebtest (both BUILD / pre-launch).
 *
 * SAFE BY DEFAULT: dry-run prints the plan and writes NOTHING. `--apply` writes.
 *   npx tsx scripts/set-featured-products.ts          # dry-run
 *   npx tsx scripts/set-featured-products.ts --apply   # write
 *
 * Idempotent: sets featured to an explicit true/false per slug, so re-runs are safe.
 */
import { prisma } from '../lib/prisma';

const APPLY = process.argv.includes('--apply');

const FEATURED_TRUE = ['ai-search-arena', 'aisearchmastery', 'executor-file'];
const FEATURED_FALSE = ['modeloptix', 'plebtest'];

async function withRetry<T>(fn: () => Promise<T>, tries = 6): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { last = e; await new Promise((r) => setTimeout(r, 3000)); }
  }
  throw last;
}

async function main() {
  console.log(`\n=== featured reshuffle ${APPLY ? '(APPLYING)' : '(DRY RUN — no writes)'} ===`);

  const before = await withRetry(() =>
    prisma.project.findMany({
      where: { slug: { in: [...FEATURED_TRUE, ...FEATURED_FALSE] } },
      select: { slug: true, featured: true, status: true },
    })
  );
  const map = new Map(before.map((p) => [p.slug, p]));

  for (const slug of [...FEATURED_TRUE, ...FEATURED_FALSE]) {
    const want = FEATURED_TRUE.includes(slug);
    const row = map.get(slug);
    if (!row) { console.log(`  ⚠ MISSING  ${slug} — no such row, skipping`); continue; }
    const change = row.featured === want ? '(no change)' : `${row.featured} -> ${want}`;
    console.log(`  ${want ? '★' : ' '} ${slug.padEnd(20)} ${String(row.status).padEnd(8)} ${change}`);
    if (APPLY && row.featured !== want) {
      await withRetry(() =>
        prisma.project.update({ where: { slug }, data: { featured: want, updatedAt: new Date() } })
      );
    }
  }

  const featured = await withRetry(() =>
    prisma.project.findMany({
      where: { featured: true, url: { startsWith: 'http' }, status: { not: 'ARCHIVED' } },
      select: { slug: true },
      orderBy: { name: 'asc' },
    })
  );
  console.log(`\nHomepage featured set (${featured.length}): ${featured.map((f) => f.slug).join(', ')}`);
  await prisma.$disconnect();
}
main();
