const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Build and lint are separate gates. `npm run lint` is the real lint check and
    // reports everything; it is not weakened by this. Decoupling keeps deploys from
    // breaking on the pre-existing backlog (JW-ISS-19) that surfaced when ESLint was
    // first configured here — before that, `next build` silently skipped linting.
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-4f2aa5e351b44f67ba6dd0bc32fe1bb2.r2.dev',
        pathname: '/**',
      },
      {
        // YouTube video thumbnails (T-395). Hotlinked from YouTube's own CDN and
        // deliberately NOT mirrored to R2: YouTube regenerates a thumbnail when
        // Jamie changes one, and a mirrored copy would silently go stale. The
        // feed hands us i2.ytimg.com URLs; i.ytimg.com and the other numbered
        // hosts serve the same objects, so the wildcard covers them all.
        protocol: 'https',
        hostname: '**.ytimg.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    // PRJ-18 Wave 3: the legacy filesystem /blog merged into /journey. Preserve
    // inbound links + SEO with permanent redirects (308). Slugs are unchanged,
    // so /blog/{slug} maps 1:1 to /journey/{slug}.
    return [
      { source: '/blog', destination: '/journey', permanent: true },
      { source: '/blog/:slug', destination: '/journey/:slug', permanent: true },
      // T-191: RSS moved from robots-blocked /api/rss to the standard /rss.xml.
      { source: '/api/rss', destination: '/rss.xml', permanent: true },
      // 2026-08-14: "Has this control ever fired?" was published on 14 Aug and
      // retired the same day. It retold the 13 Aug control audit, which is the
      // stronger piece and has since absorbed its best material. The post is
      // unpublished in the CMS; this forwards the live URL rather than 404ing it.
      {
        source: '/journey/has-this-control-ever-fired',
        destination: '/journey/audited-26-risk-controls',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Only cache headers - security headers handled by middleware.ts
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // OG image headers for social media crawlers (Twitter, Facebook, LinkedIn)
      {
        source: '/og-image.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
