/**
 * Regression check for PRJ-18 Wave 1 (funnel + SEO quick fixes).
 *
 * Verifies: the homepage Subscribe CTA reaches the on-page signup instead of
 * /journey, every key public page carries the correct absolute canonical and
 * og:url (including one portfolio slug and one journey slug), the stale
 * '/api/auth/login' middleware entry is gone, and /api/metrics is deleted (Wave 2).
 * Run from website/: npx tsx scripts/verify-wave1.ts
 * Against production instead: BASE_URL=https://jamiewatters.work npx tsx scripts/verify-wave1.ts
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SITE_URL = process.env.SITE_URL || 'https://jamiewatters.work';

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures += 1;
}

function extract(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1] : null;
}

function canonicalOf(html: string): string | null {
  return (
    extract(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/) ??
    extract(html, /<link[^>]+href="([^"]+)"[^>]+rel="canonical"/)
  );
}

function ogUrlOf(html: string): string | null {
  return (
    extract(html, /<meta[^>]+property="og:url"[^>]+content="([^"]+)"/) ??
    extract(html, /<meta[^>]+content="([^"]+)"[^>]+property="og:url"/)
  );
}

async function fetchHtml(pagePath: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${pagePath}`);
  if (!res.ok) throw new Error(`${pagePath} returned ${res.status}`);
  return res.text();
}

/** Fetch a page and assert its canonical + og:url both equal SITE_URL + path. */
async function checkHead(pagePath: string): Promise<string> {
  const html = await fetchHtml(pagePath);
  // Next.js normalises the root canonical to the bare origin (no trailing slash).
  const expected = pagePath === '/' ? SITE_URL : `${SITE_URL}${pagePath}`;
  const canonical = canonicalOf(html);
  const ogUrl = ogUrlOf(html);
  check(`${pagePath} canonical is ${expected}`, canonical === expected, `got ${canonical}`);
  check(`${pagePath} og:url is ${expected}`, ogUrl === expected, `got ${ogUrl}`);
  return html;
}

function firstSlug(html: string, prefix: string): string | null {
  const m = html.match(new RegExp(`href="${prefix}/([A-Za-z0-9-]+)"`));
  return m ? m[1] : null;
}

async function main() {
  // 1. Funnel: hero Subscribe reaches the on-page signup, not the /journey list.
  const home = await checkHead('/');
  check('hero Subscribe links to #subscribe', home.includes('href="#subscribe"'));
  check(
    'no Subscribe CTA points at /journey',
    !/<a[^>]*href="\/journey"[^>]*>Subscribe</.test(home)
  );
  check('homepage renders the signup section', home.includes('id="subscribe"'));

  // 2. Canonical + og:url on every key public page.
  for (const pagePath of ['/about', '/portfolio', '/journey', '/blog', '/dashboard']) {
    await checkHead(pagePath);
  }

  const projectSlug = firstSlug(await fetchHtml('/portfolio'), '/portfolio');
  check('found a portfolio slug to test', !!projectSlug, projectSlug ?? 'none');
  if (projectSlug) await checkHead(`/portfolio/${projectSlug}`);

  const postSlug = firstSlug(await fetchHtml('/journey'), '/journey');
  check('found a journey slug to test', !!postSlug, postSlug ?? 'none');
  if (postSlug) await checkHead(`/journey/${postSlug}`);

  // 3. Middleware: stale entry gone from source, admin API still protected.
  const middleware = fs.readFileSync(path.join(__dirname, '..', 'middleware.ts'), 'utf8');
  check("middleware.ts no longer lists '/api/auth/login'", !middleware.includes('/api/auth/login'));
  // Wave 2 deleted /api/metrics and its middleware guard, so it now 404s.
  const metrics = await fetch(`${BASE_URL}/api/metrics`);
  check('/api/metrics is gone (404)', metrics.status === 404, String(metrics.status));

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
