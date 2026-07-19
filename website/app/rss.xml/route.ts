/**
 * RSS 2.0 feed for the unified field-report feed (/journey), at the standard
 * discoverable path /rss.xml.
 *
 * Moved here from /api/rss (T-191): /api/* is disallowed in robots.ts, which
 * told aggregators to stay away. This path is crawlable and is advertised via a
 * <link rel="alternate" type="application/rss+xml"> in the root layout so feed
 * readers and Buttondown (PRJ-20 RSS-to-email) can autodiscover it. /api/rss
 * 308-redirects here for any subscriber who saved the old URL.
 */

import { getAllPosts } from '@/lib/database';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600; // 1 hour

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getAllPosts();
  const published = posts.filter((p) => p.published !== false);

  const items = published
    .map((p) => {
      const url = `${SITE_URL}/journey/${p.slug}`;
      const date = (p.publishedAt || p.createdAt) ?? new Date();
      const categories = (p.topics ?? [])
        .map((t) => `<category>${escapeXml(t)}</category>`)
        .join('');
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
      ${categories}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jamie Watters — The Journey</title>
    <link>${SITE_URL}/journey</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Field reports from building with AI in public. What's working, what isn't, and what it cost.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
