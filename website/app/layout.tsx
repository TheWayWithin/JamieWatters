import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getNonce } from '@/lib/nonce';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  preload: false, // Load on demand (code blocks only)
});

// Force dynamic rendering for CSP nonce support
// This is required for Next.js to automatically apply nonces to framework scripts
// Reference: https://nextjs.org/docs/app/guides/content-security-policy
// Trade-off: Disables static optimization, but required for strict CSP with nonces
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jamie Watters | Building in public at the AI frontier',
    template: '%s | Jamie Watters',
  },
  description:
    "I build with AI, test what's real, kill what isn't, and share the lot in public. Open code, real numbers, the failures before the wins.",
  keywords: [
    'AI',
    'build in public',
    'cognitive sovereignty',
    'open source',
    'field report',
  ],
  authors: [{ name: 'Jamie Watters' }],
  creator: 'Jamie Watters',
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Jamie Watters — The Journey' },
      ],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jamiewatters.work/',
    title: 'Jamie Watters | Building in public at the AI frontier',
    description:
      "I build with AI, test what's real, kill what isn't, and share the lot in public. Open code, real numbers, the failures before the wins.",
    siteName: 'Jamie Watters',
    images: [
      {
        url: 'https://jamiewatters.work/og',
        width: 1200,
        height: 630,
        alt: 'Jamie Watters - Building in public at the AI frontier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jamie Watters | Building in public at the AI frontier',
    description:
      "I build with AI, test what's real, kill what isn't, and share the lot in public. Open code, real numbers, the failures before the wins.",
    creator: '@Jamie_within',
    images: ['https://jamiewatters.work/og'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get nonce from middleware for CSP-compliant inline scripts
  const nonce = await getNonce();

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head />
      <body className="font-sans">
        {/* Plausible Analytics - using Next.js Script component for proper loading */}
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="jamiewatters.work"
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
