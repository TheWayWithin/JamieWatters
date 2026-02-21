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
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/']
    },
    sitemap: 'https://jamiewatters.work/sitemap.xml',
  }
}