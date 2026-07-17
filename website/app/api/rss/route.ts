/**
 * RSS 2.0 feed for the unified field-report feed (/journey).
 *
 * The /journey page advertises "Subscribe via RSS" pointing here. Serves the
 * same Neon-backed posts as the feed, newest first. Added in PRJ-18 Wave 3 (T5)
 * when the legacy /blog merged into /journey.
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
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
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
