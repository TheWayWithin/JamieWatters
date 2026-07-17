/**
 * Regression check for PRJ-18 Wave 3 (content IA — one unified field-report feed).
 *
 * Verifies: legacy /blog and /blog/{slug} permanently redirect into /journey,
 * the 7 topic hub pages resolve (and a bogus one 404s), the type filter narrows
 * the feed, the sitemap covers the migrated posts + topic pages and no longer
 * lists /blog, the RSS feed serves the unified stream, "Blog" is gone from the
 * nav, and (Wave 2 regression) /api/admin/* still self-enforces auth.
 *
 * Run from website/: npx tsx scripts/verify-wave3.ts
 * Against production: BASE_URL=https://jamiewatters.work npx tsx scripts/verify-wave3.ts
 */

import { TOPICS } from '../lib/taxonomy';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures += 1;
}

async function status(path: string): Promise<number> {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
  return res.status;
}

async function text(path: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.text();
}

/** Count rendered post cards on a feed page (each card has one "Read More" link pair). */
function cardSignal(html: string): number {
  return (html.match(/Read More/g) || []).length;
}

async function main() {
  // 1. Legacy /blog permanently redirects into /journey (301 or 308).
  const blog = await fetch(`${BASE_URL}/blog`, { redirect: 'manual' });
  check(
    '/blog permanently redirects to /journey',
    [301, 308].includes(blog.status) && (blog.headers.get('location') || '').endsWith('/journey'),
    `${blog.status} -> ${blog.headers.get('location')}`
  );
  const blogSlug = await fetch(`${BASE_URL}/blog/ai-cofounder`, { redirect: 'manual' });
  check(
    '/blog/{slug} redirects to /journey/{slug}',
    [301, 308].includes(blogSlug.status) &&
      (blogSlug.headers.get('location') || '').endsWith('/journey/ai-cofounder'),
    `${blogSlug.status} -> ${blogSlug.headers.get('location')}`
  );

  // 2. The 7 topic hub pages resolve; a bogus topic 404s.
  for (const topic of TOPICS) {
    check(`/journey/topic/${topic} resolves (200)`, (await status(`/journey/topic/${topic}`)) === 200);
  }
  check('/journey/topic/bogus is 404', (await status('/journey/topic/bogus')) === 404);

  // 3. Type filter narrows the feed (essays are a strict subset of everything).
  const fullCards = cardSignal(await text('/journey'));
  const essayCards = cardSignal(await text('/journey?type=essay'));
  check('feed renders posts', fullCards > 0, `${fullCards} signal`);
  check('type=essay narrows the feed', essayCards > 0 && essayCards < fullCards, `essay ${essayCards} < full ${fullCards}`);

  // 4. Migrated post now lives under /journey and renders.
  check('/journey/ai-cofounder renders (200)', (await status('/journey/ai-cofounder')) === 200);

  // 5. Sitemap covers the migrated post + topic pages, and drops /blog.
  const sitemap = await text('/sitemap.xml');
  check('sitemap includes /journey/ai-cofounder', sitemap.includes('/journey/ai-cofounder'));
  check('sitemap includes all 7 topic pages', TOPICS.every((t) => sitemap.includes(`/journey/topic/${t}`)));
  check('sitemap no longer lists /blog', !/<loc>[^<]*\/blog<\/loc>/.test(sitemap));

  // 6. RSS serves the unified feed.
  const rss = await fetch(`${BASE_URL}/api/rss`);
  const rssBody = await rss.text();
  check(
    '/api/rss serves a non-empty RSS feed',
    rss.status === 200 &&
      (rss.headers.get('content-type') || '').includes('rss') &&
      rssBody.includes('<item>'),
    `${rss.status}, ${(rssBody.match(/<item>/g) || []).length} items`
  );

  // 7. "Blog" removed from the nav.
  const journey = await text('/journey');
  check('nav no longer shows a Blog link', !/>Blog<\/a>/.test(journey) && !journey.includes('href="/blog"'));

  // 8. Wave 2 regression: admin API still self-enforces auth.
  check('/api/admin/overview still requires auth (401)', (await status('/api/admin/overview')) === 401);

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
