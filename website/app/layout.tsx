import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
    default: 'Jamie Watters | Building $1B Solo by 2030',
    template: '%s | Jamie Watters',
  },
  description:
    'AI-powered solopreneur building 10+ products simultaneously. Follow the journey from zero to billion in public.',
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
    url: 'https://jamiewatters.work',
    title: 'Jamie Watters | Building $1B Solo by 2030',
    description:
      'AI-powered solopreneur building 10+ products simultaneously. Follow the journey from zero to billion in public.',
    siteName: 'Jamie Watters',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jamie Watters | Building $1B Solo by 2030',
    description:
      'AI-powered solopreneur building 10+ products simultaneously. Follow the journey from zero to billion in public.',
    creator: '@jamiewatters',
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
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
        {/* Analytics with CSP nonce support - currently disabled but ready for production */}
        {/* <Analytics nonce={nonce} /> */}
      </body>
    </html>
  );
}
