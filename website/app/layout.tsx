import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getNonce } from '@/lib/nonce';
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
  title: {
    default: 'Jamie Watters | Side Gig to Financial Freedom — Built in Public',
    template: '%s | Jamie Watters',
  },
  description:
    'Real metrics, real failures. Follow the journey of a practitioner building AI-powered tools for solopreneurs.',
  keywords: [
    'solopreneur',
    'AI',
    'build in public',
    'portfolio',
    'entrepreneurship',
  ],
  authors: [{ name: 'Jamie Watters' }],
  creator: 'Jamie Watters',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jamiewatters.work/',
    title: 'Jamie Watters | Side Gig to Financial Freedom — Built in Public',
    description:
      'Real metrics, real failures. Follow the journey of a practitioner building AI-powered tools for solopreneurs.',
    siteName: 'Jamie Watters',
    images: [
      {
        url: 'https://jamiewatters.work/api/og',
        width: 1200,
        height: 630,
        alt: 'Jamie Watters - Side Gig to Financial Freedom — Built in Public',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jamie Watters | Side Gig to Financial Freedom — Built in Public',
    description:
      'Real metrics, real failures. Follow the journey of a practitioner building AI-powered tools for solopreneurs.',
    creator: '@jamiewatters',
    images: ['https://jamiewatters.work/api/og'],
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
        {/* Analytics with CSP nonce support - currently disabled but ready for production */}
        {/* <Analytics nonce={nonce} /> */}
      </body>
    </html>
  );
}
