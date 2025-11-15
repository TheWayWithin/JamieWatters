import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { generateDailyUpdate, ProjectData } from '@/lib/daily-update-generator';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force Node.js runtime for auth and encryption
export const runtime = 'nodejs';

/**
 * POST /api/admin/content/generate-daily - Generate daily update preview
 *
 * Security:
 * - Authentication required
 * - Fetches projects from database
 * - Decrypts GitHub tokens only when needed
 * - Does NOT save to database (preview only)
 *
 * Request body:
 * {
 *   projectIds: string[];
 *   date?: string; // ISO date, default: today
 * }
 *
 * Response:
 * {
 *   success: true;
 *   preview: DailyUpdateOutput;
 * }
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

    // Parse request body
    const body = await req.json();

    // Validate input
    const schema = z.object({
      projectIds: z.array(z.string()).min(1, 'At least one project required'),
      date: z.string().optional(),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { projectIds, date: dateString } = validation.data;

    // Parse date if provided
    const date = dateString ? new Date(dateString) : new Date();

    // Fetch projects from database
    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
      },
      select: {
        id: true,
        name: true,
        githubUrl: true,
        githubToken: true,
        trackProgress: true,
      },
    });

    // Verify all requested projects exist
    if (projects.length !== projectIds.length) {
      const foundIds = projects.map(p => p.id);
      const missingIds = projectIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: 'Some projects not found', missingIds },
        { status: 404 }
      );
    }

    // Verify all projects are tracked
    const untrackedProjects = projects.filter(p => !p.trackProgress);
    if (untrackedProjects.length > 0) {
      return NextResponse.json(
        {
          error: 'Some projects are not set to track progress',
          untrackedProjects: untrackedProjects.map(p => ({ id: p.id, name: p.name })),
        },
        { status: 400 }
      );
    }

    // Convert to ProjectData format (required by generator)
    const projectData: ProjectData[] = projects.map(p => ({
      id: p.id,
      name: p.name,
      githubUrl: p.githubUrl,
      githubToken: p.githubToken,
      trackProgress: p.trackProgress,
    }));

    // Generate daily update
    const preview = await generateDailyUpdate(
      {
        projectIds,
        date,
      },
      projectData
    );

    return NextResponse.json({
      success: true,
      preview,
    });

  } catch (error) {
    console.error('Daily update generation error:', error);

    // Return user-friendly error message
    return NextResponse.json(
      {
        error: 'Failed to generate daily update',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
