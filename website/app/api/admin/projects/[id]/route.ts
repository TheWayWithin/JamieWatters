import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { updateProjectSchema, generateSlug } from '@/lib/validations/project';
import { encryptToken, decryptToken } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Force Node.js runtime for consistency with auth system
export const runtime = 'nodejs';

/**
 * GET /api/admin/projects/[id] - Get single project
 *
 * Security: Authentication required
 * Returns: Project with all fields EXCEPT githubToken (security)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // Fetch project
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        longDescription: true,
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
        problemStatement: true,
        solutionApproach: true,
        lessonsLearned: true,
        screenshots: true,
        launchedAt: true,
        createdAt: true,
        updatedAt: true,
        // NEVER return githubToken in API responses
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Convert Decimal to number for JSON serialization
    return NextResponse.json({
      success: true,
      data: {
        ...project,
        mrr: Number(project.mrr),
      },
    });
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/projects/[id] - Update project
 *
 * Security:
 * - Authentication required
 * - Partial updates supported
 * - GitHub tokens encrypted before storage
 * - NEVER return encrypted tokens in response
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate input using Zod schema (partial updates allowed)
    const validationResult = updateProjectSchema.safeParse(body);
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

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existingProject.slug) {
      const slugConflict = await prisma.project.findUnique({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A project with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Handle GitHub token encryption
    let githubTokenUpdate: string | null | undefined = undefined;
    if (data.githubToken !== undefined) {
      if (data.githubToken === null || data.githubToken === '') {
        // User wants to remove the token
        githubTokenUpdate = null;
      } else {
        // User is updating the token - encrypt it
        try {
          githubTokenUpdate = encryptToken(data.githubToken.trim());
        } catch (error) {
          console.error('Token encryption failed:', error);
          return NextResponse.json({ error: 'Failed to encrypt GitHub token' }, { status: 500 });
        }
      }
    }

    // Prepare update data
    const updateData: Prisma.ProjectUpdateInput = {};

    // Only include fields that were provided in the request
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.longDescription !== undefined) updateData.longDescription = data.longDescription;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.techStack !== undefined) updateData.techStack = data.techStack;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.mrr !== undefined) updateData.mrr = data.mrr;
    if (data.users !== undefined) updateData.users = data.users;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl || null;
    if (githubTokenUpdate !== undefined) updateData.githubToken = githubTokenUpdate;
    if (data.trackProgress !== undefined) updateData.trackProgress = data.trackProgress;
    if (data.problemStatement !== undefined) updateData.problemStatement = data.problemStatement;
    if (data.solutionApproach !== undefined) updateData.solutionApproach = data.solutionApproach;
    if (data.lessonsLearned !== undefined) updateData.lessonsLearned = data.lessonsLearned;
    if (data.screenshots !== undefined) updateData.screenshots = data.screenshots;
    if (data.launchedAt !== undefined)
      updateData.launchedAt = data.launchedAt ? new Date(data.launchedAt) : null;

    // Update project in database
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
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
    console.log('Project updated:', {
      timestamp: new Date().toISOString(),
      projectId: updatedProject.id,
      projectName: updatedProject.name,
      updatedFields: Object.keys(data),
      tokenUpdated: githubTokenUpdate !== undefined,
    });

    // Revalidate affected pages
    revalidatePath('/');
    revalidatePath('/portfolio');
    revalidatePath(`/portfolio/${updatedProject.slug}`);
    revalidatePath('/admin/projects');

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        ...updatedProject,
        mrr: Number(updatedProject.mrr),
      },
    });
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/projects/[id] - Delete project
 *
 * Security:
 * - Authentication required
 * - Cascading deletes handled by Prisma
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete project (cascading deletes handled by Prisma)
    await prisma.project.delete({
      where: { id },
    });

    // Audit log
    console.log('Project deleted:', {
      timestamp: new Date().toISOString(),
      projectId: project.id,
      projectName: project.name,
    });

    // Revalidate affected pages
    revalidatePath('/');
    revalidatePath('/portfolio');
    revalidatePath('/admin/projects');

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Project deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
