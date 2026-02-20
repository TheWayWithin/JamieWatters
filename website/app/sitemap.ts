/**
 * Dynamic Sitemap Generation for JamieWatters.work
 * Next.js 15 App Router Implementation
 * 
 * Follows Critical Software Development Principles:
 * - Proper error handling with fallbacks during build
 * - Security-first with input validation
 * - Performance-optimized with selective data fetching
 */

import { MetadataRoute } from 'next'
import { getAllProjects, getAllPosts } from '@/lib/database'

const SITE_URL = 'https://jamiewatters.work'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Static routes with their priorities and change frequencies
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/portfolio`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/journey`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/my-story`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ]

    // Dynamic project routes
    let projectRoutes: MetadataRoute.Sitemap = []
    try {
      const projects = await getAllProjects()
      projectRoutes = projects.map((project) => ({
        url: `${SITE_URL}/portfolio/${project.slug}`,
        lastModified: project.updatedAt || project.createdAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    } catch (error) {
      console.warn('Could not fetch projects for sitemap during build:', error)
      // Continue without project routes during build failures
    }

    // Dynamic blog post routes
    let postRoutes: MetadataRoute.Sitemap = []
    try {
      const posts = await getAllPosts()
      postRoutes = posts.map((post) => ({
        url: `${SITE_URL}/journey/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || post.createdAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    } catch (error) {
      console.warn('Could not fetch posts for sitemap during build:', error)
      // Continue without post routes during build failures
    }

    const allRoutes = [...staticRoutes, ...projectRoutes, ...postRoutes]

    console.log(`Generated sitemap with ${allRoutes.length} routes`)
    return allRoutes

  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback to static routes only during build failures
    const fallbackRoutes: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/portfolio`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/journey`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/my-story`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ]

    console.log('Using fallback sitemap with static routes only')
    return fallbackRoutes
  }
}