/**
 * Structured Data Utilities
 *
 * JSON-LD schema.org structured data generation for SEO enhancement.
 * Enables Google Search rich results: breadcrumbs, articles, person profiles.
 *
 * @see https://schema.org
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */

import { Project, Post } from '@prisma/client';

const SITE_URL = 'https://jamiewatters.work';
const SITE_NAME = 'Jamie Watters';

/**
 * Person Schema - Jamie Watters' profile
 * Used on homepage for identity and personal branding
 *
 * @see https://schema.org/Person
 */
export function getPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jamie Watters',
    url: SITE_URL,
    jobTitle: 'Solopreneur',
    description: 'AI-powered solopreneur building a $1B portfolio by 2030. Building 10+ products simultaneously using AI orchestration.',
    image: `${SITE_URL}/images/jamie-profile.jpg`,
    sameAs: [
      'https://twitter.com/jamiewatters',
      'https://linkedin.com/in/jamiewatters',
      'https://github.com/TheWayWithin',
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Solopreneurship',
      'SaaS Development',
      'AI Orchestration',
      'Build in Public',
    ],
  };
}

/**
 * Website Schema - Site metadata
 * Used on homepage for site-wide identity
 *
 * @see https://schema.org/WebSite
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-powered solopreneur building 10+ products simultaneously. Follow the journey from zero to billion in public—real metrics, real challenges, real lessons.',
    author: {
      '@type': 'Person',
      name: 'Jamie Watters',
    },
    publisher: {
      '@type': 'Person',
      name: 'Jamie Watters',
    },
  };
}

/**
 * Project/Software Application Schema
 * Used on portfolio detail pages for individual projects
 *
 * @param project - Project from database
 * @see https://schema.org/SoftwareApplication
 */
export function getProjectSchema(project: Project) {
  // Determine if it's a software application or general creative work
  const isSoftwareProject =
    project.category === 'AI_TOOLS' ||
    project.category === 'FRAMEWORKS' ||
    project.category === 'MARKETPLACE';

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': isSoftwareProject ? 'SoftwareApplication' : 'CreativeWork',
    name: project.name,
    description: project.description,
    url: project.url,
    author: {
      '@type': 'Person',
      name: 'Jamie Watters',
      url: SITE_URL,
    },
    creator: {
      '@type': 'Person',
      name: 'Jamie Watters',
    },
  };

  // Add optional fields if available
  const optionalFields: Record<string, unknown> = {};

  if (project.launchedAt) {
    optionalFields.datePublished = project.launchedAt.toISOString();
  }

  if (project.screenshots && project.screenshots.length > 0) {
    optionalFields.image = project.screenshots[0];
  }

  if (isSoftwareProject) {
    optionalFields.applicationCategory = getCategoryName(project.category);
    optionalFields.operatingSystem = 'Web Browser';
  }

  return { ...baseSchema, ...optionalFields };
}

/**
 * Blog Post Schema - For journey entries
 * Used on journey detail pages
 *
 * @param post - Post from database
 * @param content - Full markdown content (optional, for articleBody)
 * @see https://schema.org/BlogPosting
 */
export function getBlogPostSchema(post: Post, content?: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/journey/${post.slug}`,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Jamie Watters',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Jamie Watters',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/journey/${post.slug}`,
    },
  };

  // Add keywords/tags if available
  if (post.tags && post.tags.length > 0) {
    schema.keywords = post.tags.join(', ');
  }

  // Add article body excerpt (first 500 chars to avoid bloat)
  if (content) {
    const plainText = content.replace(/[#*_`\[\]()]/g, '').trim();
    schema.articleBody = plainText.substring(0, 500) + (plainText.length > 500 ? '...' : '');
  }

  // Add reading time
  if (post.readTime) {
    schema.timeRequired = `PT${post.readTime}M`; // ISO 8601 duration format
  }

  return schema;
}

/**
 * Breadcrumb List Schema
 * Used on all pages for navigation breadcrumbs
 *
 * @param breadcrumbs - Array of breadcrumb items
 * @see https://schema.org/BreadcrumbList
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

/**
 * Utility: Render JSON-LD script tag
 * Helper to safely render structured data in Next.js pages
 *
 * @param schema - Schema object to render
 * @returns React script element with JSON-LD
 */
export function renderStructuredData(schema: Record<string, unknown>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0), // Minified for production
      }}
    />
  );
}

/**
 * Utility: Get human-readable category name
 * @param category - Project category enum
 */
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    AI_TOOLS: 'Business Application',
    FRAMEWORKS: 'Development Tool',
    EDUCATION: 'Educational',
    MARKETPLACE: 'Business Application',
    OTHER: 'Utility',
  };
  return categoryMap[category] || 'Utility';
}
