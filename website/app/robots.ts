/**
 * Dynamic Robots.txt Generation for JamieWatters.work
 * Next.js 15 App Router Implementation
 * 
 * Follows Critical Software Development Principles:
 * - Using Next.js native metadata API for reliable deployment
 * - Security-first with explicit disallow rules for sensitive routes
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI crawlers explicitly allowed — deliberate policy (PRJ-25 / T-244, 2026-07-23):
      // AI visibility is a goal of this site, so retrieval bots AND training bots
      // (including Google-Extended) are welcome. Revisit in the monthly re-score.
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'OAI-SearchBot',
        ],
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: 'https://jamiewatters.work/sitemap.xml',
  }
}