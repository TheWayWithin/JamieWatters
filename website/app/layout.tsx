import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
