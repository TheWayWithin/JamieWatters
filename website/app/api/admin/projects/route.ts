import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { createProjectSchema, projectQuerySchema, generateSlug } from '@/lib/validations/project';
import { encryptToken } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Force Node.js runtime for consistency with auth system
export const runtime = 'nodejs';

/**
 * GET /api/admin/projects - List all projects
 *
 * Security: Authentication required
 * Query params: category, status, featured, trackProgress
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const queryParams = {
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      trackProgress: searchParams.get('trackProgress') === 'true' ? true : undefined,
    };

    // Validate query params
    const validatedQuery = projectQuerySchema.safeParse(queryParams);
    const filters = validatedQuery.success ? validatedQuery.data : {};

    // Build Prisma where clause
    const where: Prisma.ProjectWhereInput = {};
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.featured !== undefined) where.featured = filters.featured;
    if (filters.trackProgress !== undefined) where.trackProgress = filters.trackProgress;

    // Fetch projects
    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        url: true,
        techStack: true,
        category: true,
        status: true,
        featured: true,
        mrr: true,
        users: true,
        githubUrl: true,
        trackProgress: true,
        lastSynced: true,
        createdAt: true,
        updatedAt: true,
        // NEVER return githubToken in API responses
      },
    });

    // Convert Decimal to number for JSON serialization
    const formattedProjects = projects.map((project) => ({
      ...project,
      mrr: Number(project.mrr),
    }));

    return NextResponse.json({
      success: true,
      data: formattedProjects,
      count: formattedProjects.length,
    });
  } catch (error) {
    console.error('Projects list error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/**
 * POST /api/admin/projects - Create new project
 *
 * Security:
 * - Authentication required
 * - Input validation with Zod
 * - GitHub tokens encrypted before storage
 * - NEVER return encrypted tokens in response
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate input using Zod schema
    const validationResult = createProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Auto-generate slug if not provided
    const slug = data.slug || generateSlug(data.name);

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists. Please use a different name.' },
        { status: 409 }
      );
    }

    // Encrypt GitHub token if provided
    let encryptedToken: string | null = null;
    if (data.githubToken && data.githubToken.trim()) {
      try {
        encryptedToken = encryptToken(data.githubToken.trim());
      } catch (error) {
        console.error('Token encryption failed:', error);
        return NextResponse.json({ error: 'Failed to encrypt GitHub token' }, { status: 500 });
      }
    }

    // Prepare data for database
    const projectData: Prisma.ProjectCreateInput = {
      id: crypto.randomUUID(),
      slug,
      name: data.name,
      description: data.description,
      longDescription: data.longDescription || null,
      url: data.url,
      techStack: data.techStack,
      category: data.category,
      status: data.status || 'ACTIVE',
      featured: data.featured || false,
      mrr: data.mrr || 0,
      users: data.users || 0,
      githubUrl: data.githubUrl || null,
      githubToken: encryptedToken,
      trackProgress: data.trackProgress || false,
      problemStatement: data.problemStatement || null,
      solutionApproach: data.solutionApproach || null,
      lessonsLearned: data.lessonsLearned || null,
      screenshots: data.screenshots || [],
      launchedAt: data.launchedAt ? new Date(data.launchedAt) : null,
      updatedAt: new Date(),
    };

    // Create project in database
    const project = await prisma.project.create({
      data: projectData,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        url: true,
        techStack: true,
        category: true,
        status: true,
        featured: true,
        mrr: true,
        users: true,
        githubUrl: true,
        trackProgress: true,
        lastSynced: true,
        createdAt: true,
        updatedAt: true,
        // NEVER return githubToken
      },
    });

    // Audit log
    console.log('Project created:', {
      timestamp: new Date().toISOString(),
      projectId: project.id,
      projectName: project.name,
      hasGitHubToken: !!encryptedToken,
      trackProgress: project.trackProgress,
    });

    // Revalidate affected pages
    revalidatePath('/');
    revalidatePath('/portfolio');
    revalidatePath('/admin/projects');

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: {
          ...project,
          mrr: Number(project.mrr),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
