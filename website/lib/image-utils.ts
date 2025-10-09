/**
 * Image optimization utilities for jamiewatters.work
 * Provides consistent image handling across the site
 */

export function getOptimizedImageProps(src: string, alt: string) {
  return {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  }
}

export function getProjectImageUrl(slug: string) {
  return `/images/projects/${slug}.webp`
}

export function getBlogImageUrl(slug: string) {
  return `/images/blog/${slug}.webp`
}

export function getProfileImageUrl() {
  return '/images/profile/jamie-south-st-seaport.webp'
}
