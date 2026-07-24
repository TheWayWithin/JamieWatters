/**
 * SEO metadata utilities for jamiewatters.work
 *
 * Single metadata path for all public pages. Every page passes its own
 * site-relative path so the canonical URL and og:url are correct per page.
 * Titles are plain here; the root layout's title template appends
 * "| Jamie Watters".
 */

import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jamiewatters.work';

export interface SEOImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface SEOMetadataOptions {
  title: string;
  description: string;
  /** Site-relative path for this page, e.g. '/' or '/journey/my-post'. */
  path: string;
  type?: 'website' | 'article';
  /** Override the default OG image (absolute URL string or full image object). */
  image?: string | SEOImage;
  /** Article-only: ISO date string. Ignored unless type is 'article'. */
  publishedTime?: string;
  /** Article-only: ISO date string for last modification. Ignored unless type is 'article'. */
  modifiedTime?: string;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function getSEOMetadata(page: SEOMetadataOptions): Metadata {
  const url = absoluteUrl(page.path);

  const image: SEOImage =
    typeof page.image === 'string'
      ? { url: page.image, width: 1200, height: 630, alt: page.title }
      : (page.image ?? { url: `${SITE_URL}/og`, width: 1200, height: 630, alt: page.title });

  const article =
    page.type === 'article'
      ? {
          type: 'article' as const,
          publishedTime: page.publishedTime,
          modifiedTime: page.modifiedTime,
          authors: ['Jamie Watters'],
        }
      : { type: 'website' as const };

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      ...article,
      title: page.title,
      description: page.description,
      url,
      siteName: 'Jamie Watters',
      locale: 'en_US',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [image.url],
    },
  };
}
