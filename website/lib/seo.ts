/**
 * SEO metadata utilities for jamiewatters.work
 * Provides consistent metadata across all pages
 */

export interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  type?: string;
}

export function getSEOMetadata(page: SEOMetadata) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jamiewatters.work';
  const defaultImage = `${baseUrl}/og`;

  return {
    title: `${page.title} | Jamie Watters`,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: baseUrl,
      siteName: 'Jamie Watters',
      images: [
        {
          url: page.image || defaultImage,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: page.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [page.image || defaultImage],
    },
  };
}
