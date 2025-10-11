/**
 * Database Query Functions for JamieWatters.work
 * 
 * Provides Prisma-based replacements for placeholder-data.ts functions
 * Follows Critical Software Development Principles:
 * - Security-first with input validation
 * - Proper error handling and logging
 * - Performance-optimized queries
 */

import { prisma } from './prisma';
import { Project, Post, ProjectStatus } from '@prisma/client';

// Types that match the frontend expectations
export interface DatabaseMetrics {
  totalMRR: number;
  totalUsers: number;
  activeProjects: number;
  portfolioValue: number;
}

export interface ProjectWithMetrics extends Project {
  // Additional computed fields can be added here
}

export interface PostWithMetadata extends Post {
  // Additional computed fields can be added here
}

/**
 * Get all projects with proper ordering
 */
export async function getAllProjects(): Promise<ProjectWithMetrics[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
    });
    return projects;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    
    // Fallback during build - return empty array to allow build to complete
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Database not available during build - returning empty projects array');
      return [];
    }
    
    throw new Error('Failed to fetch projects');
  }
}

/**
 * Get featured projects for homepage
 */
export async function getFeaturedProjects(): Promise<ProjectWithMetrics[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    return projects;
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    throw new Error('Failed to fetch featured projects');
  }
}

/**
 * Get active projects only
 */
export async function getActiveProjects(): Promise<ProjectWithMetrics[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { status: ProjectStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
    return projects;
  } catch (error) {
    console.error('Error fetching active projects:', error);
    throw new Error('Failed to fetch active projects');
  }
}

/**
 * Get project by slug
 */
export async function getProjectBySlug(slug: string): Promise<ProjectWithMetrics | null> {
  try {
    // Input validation
    if (!slug || typeof slug !== 'string' || slug.length > 100) {
      throw new Error('Invalid slug parameter');
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        metricsHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 10, // Last 10 metrics entries for charts
        },
      },
    });
    return project;
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
}

/**
 * Get all blog posts with proper ordering
 */
export async function getAllPosts(): Promise<PostWithMetadata[]> {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching all posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

/**
 * Get recent posts with limit
 */
export async function getRecentPosts(limit: number = 3): Promise<PostWithMetadata[]> {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return posts;
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    throw new Error('Failed to fetch recent posts');
  }
}

/**
 * Get post by slug
 */
export async function getPostBySlug(slug: string): Promise<PostWithMetadata | null> {
  try {
    // Input validation
    if (!slug || typeof slug !== 'string' || slug.length > 100) {
      throw new Error('Invalid slug parameter');
    }

    const post = await prisma.post.findUnique({
      where: { slug },
    });
    return post;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

/**
 * Get aggregate metrics for dashboard
 */
export async function getMetrics(): Promise<DatabaseMetrics> {
  try {
    const [projects, activeProjectsResult] = await Promise.all([
      prisma.project.findMany({
        select: {
          mrr: true,
          users: true,
          status: true,
        },
      }),
      prisma.project.count({
        where: { status: ProjectStatus.ACTIVE },
      }),
    ]);

    // Calculate aggregates
    const totalMRR = projects.reduce((sum, p) => sum + Number(p.mrr), 0);
    const totalUsers = projects.reduce((sum, p) => sum + p.users, 0);
    const portfolioValue = totalMRR * 36; // 3-year revenue multiple

    return {
      totalMRR,
      totalUsers,
      activeProjects: activeProjectsResult,
      portfolioValue,
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    throw new Error('Failed to calculate metrics');
  }
}

/**
 * Update project metrics (for admin API)
 */
export async function updateProjectMetrics(
  projectId: string,
  metrics: {
    mrr: number;
    users: number;
    status: ProjectStatus;
  }
): Promise<ProjectWithMetrics> {
  try {
    // Input validation
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid project ID');
    }

    // Update project in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the project
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          mrr: metrics.mrr,
          users: metrics.users,
          status: metrics.status,
          updatedAt: new Date(),
        },
      });

      // Record metrics history for future charts
      await tx.metricsHistory.create({
        data: {
          projectId: projectId,
          mrr: metrics.mrr,
          users: metrics.users,
          recordedAt: new Date(),
        },
      });

      return updatedProject;
    });

    console.log('Project metrics updated:', { projectId, metrics });
    return result;
  } catch (error) {
    console.error('Error updating project metrics:', error);
    throw new Error('Failed to update project metrics');
  }
}

/**
 * Get all project slugs for static generation
 */
export async function getProjectSlugs(): Promise<string[]> {
  try {
    const projects = await prisma.project.findMany({
      select: { slug: true },
    });
    return projects.map(p => p.slug);
  } catch (error) {
    console.error('Error fetching project slugs:', error);
    return [];
  }
}

/**
 * Get all post slugs for static generation
 */
export async function getPostSlugs(): Promise<string[]> {
  try {
    const posts = await prisma.post.findMany({
      select: { slug: true },
    });
    return posts.map(p => p.slug);
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}