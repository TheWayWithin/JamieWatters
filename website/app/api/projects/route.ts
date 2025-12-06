import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProjectStatus, Prisma } from '@prisma/client';

/**
 * Public API endpoint for fetching portfolio projects
 * No authentication required - displays public portfolio data
 *
 * Query Parameters:
 * - status: Filter by ProjectStatus (PLANNING, IN_PROGRESS, LIVE, etc.)
 * - featured: Filter to only featured projects (true/false)
 * - sort: Sort order ('recent' | 'launched' | 'name')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const featuredParam = searchParams.get('featured');
    const sortParam = searchParams.get('sort') || 'recent';

    // Build where clause for filtering
    const where: Prisma.ProjectWhereInput = {};

    // Filter by status if provided
    if (statusParam) {
      // Validate status is a valid ProjectStatus enum value
      if (Object.values(ProjectStatus).includes(statusParam as ProjectStatus)) {
        where.status = statusParam as ProjectStatus;
      } else {
        return NextResponse.json(
          { error: 'Invalid status parameter' },
          { status: 400 }
        );
      }
    }

    // Filter by featured flag if provided
    if (featuredParam !== null) {
      where.featured = featuredParam === 'true';
    }

    // Determine sort order
    let orderBy: Prisma.ProjectOrderByWithRelationInput;
    switch (sortParam) {
      case 'launched':
        orderBy = { launchedAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'recent':
      default:
        orderBy = { updatedAt: 'desc' };
        break;
    }

    // Fetch projects with explicit field selection to prevent sensitive data leaks
    const projects = await prisma.project.findMany({
      where,
      orderBy,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        url: true,
        techStack: true,
        category: true,
        status: true,
        currentPhase: true,
        mrr: true,
        users: true,
        featured: true,
        launchedAt: true,
        lessonsLearned: true,
        createdAt: true,
        updatedAt: true,
        // Count related posts
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

    // Transform response to include post count at top level
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      name: project.name,
      description: project.description,
      url: project.url,
      techStack: project.techStack,
      category: project.category,
      status: project.status,
      currentPhase: project.currentPhase,
      mrr: project.mrr,
      users: project.users,
      featured: project.featured,
      launchedAt: project.launchedAt,
      lessonsLearned: project.lessonsLearned,
      postCount: project._count.posts,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    return NextResponse.json(
      {
        projects: transformedProjects,
        total: transformedProjects.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
