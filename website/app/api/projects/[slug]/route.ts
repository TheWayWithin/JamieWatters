import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public API endpoint for fetching a single project by slug
 * No authentication required - displays public portfolio data
 *
 * Returns detailed project information including:
 * - Basic project info
 * - Timeline events
 * - Lessons learned
 * - Related posts
 * - Tech stack details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      );
    }

    // Fetch project with related data, excluding sensitive fields
    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        longDescription: true,
        url: true,
        techStack: true,
        techStackDetails: true,
        category: true,
        status: true,
        currentPhase: true,
        mrr: true,
        users: true,
        featured: true,
        customMetrics: true,
        problemStatement: true,
        solutionApproach: true,
        lessonsLearned: true,
        timelineEvents: true,
        screenshots: true,
        launchedAt: true,
        createdAt: true,
        updatedAt: true,
        // Include related posts (published only)
        posts: {
          where: { published: true },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            tags: true,
            readTime: true,
            publishedAt: true,
            contentPillar: true,
            postTypeEnum: true,
            phase: true,
          },
        },
        // Count total posts (including unpublished for metrics)
        _count: {
          select: {
            posts: true,
          },
        },
        // SECURITY: Explicitly exclude sensitive fields
        // githubToken: false (not selected)
        // githubUrl: false (not selected)
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Transform response
    const response = {
      ...project,
      postCount: project._count.posts,
      relatedPosts: project.posts,
    };

    // Remove internal fields from response
    const { _count, posts, ...cleanProject } = response;

    return NextResponse.json(
      {
        project: {
          ...cleanProject,
          postCount: response.postCount,
          relatedPosts: response.relatedPosts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
