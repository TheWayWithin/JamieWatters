/**
 * API Route: Generate Blog Post from Progress Report (GitHub)
 *
 * Fetches a progress report file from a project's GitHub repository
 * and generates a blog-ready post with issues and learnings included.
 *
 * POST /api/admin/content/generate-from-progress
 * Body: { projectId: string, repoPath: string, format?: 'full' | 'summary' }
 * Returns: { success: true, preview: ProgressReportOutput }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseGitHubUrl, fetchFileFromGitHub, GitHubConfig } from '@/lib/github';
import { parseProgressReport } from '@/lib/progress-parser';
import { generateProgressBlogPost, generateProgressSummary } from '@/lib/progress-report-generator';
import { decryptToken } from '@/lib/encryption';
import { z } from 'zod';

// Force Node.js runtime for auth and encryption
export const runtime = 'nodejs';

// Request validation schema
const requestSchema = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  repoPath: z.string().min(1, 'repoPath is required'),
  format: z.enum(['full', 'summary']).optional().default('full'),
});

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
    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { projectId, repoPath, format } = validation.data;

    // Security: Validate repoPath doesn't contain directory traversal
    if (repoPath.includes('..') || !repoPath.startsWith('progress/')) {
      return NextResponse.json(
        { error: 'Invalid file path. Must be within progress directory.' },
        { status: 400 }
      );
    }

    // Ensure the file has .md extension
    if (!repoPath.endsWith('.md')) {
      return NextResponse.json(
        { error: 'Only .md files are allowed' },
        { status: 400 }
      );
    }

    // Fetch the project from database
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        githubUrl: true,
        githubToken: true,
        trackProgress: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.githubUrl) {
      return NextResponse.json(
        { error: 'Project does not have a GitHub URL configured' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(project.githubUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format for project' },
        { status: 400 }
      );
    }

    // Build GitHub config
    const config: GitHubConfig = {
      owner: parsed.owner,
      repo: parsed.repo,
    };

    // Decrypt token if exists
    if (project.githubToken) {
      try {
        config.token = decryptToken(project.githubToken);
      } catch (error) {
        console.error(`Failed to decrypt token for project ${project.name}`);
        return NextResponse.json(
          { error: 'Failed to decrypt GitHub token' },
          { status: 500 }
        );
      }
    }

    // Fetch the file from GitHub
    let fileContent: string;
    try {
      fileContent = await fetchFileFromGitHub(config, repoPath);
    } catch (fetchError) {
      console.error('Error fetching progress file from GitHub:', fetchError);

      // Handle specific GitHub errors
      if (fetchError && typeof fetchError === 'object' && 'status' in fetchError) {
        const status = (fetchError as { status: number }).status;
        if (status === 404) {
          return NextResponse.json(
            { error: 'Progress file not found in repository' },
            { status: 404 }
          );
        }
        if (status === 403) {
          return NextResponse.json(
            { error: 'Access denied. Check GitHub token permissions.' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to fetch progress file from GitHub' },
        { status: 500 }
      );
    }

    // Parse the progress report
    const parsedReport = parseProgressReport(fileContent);

    // Generate the blog post
    const preview = format === 'summary'
      ? generateProgressSummary(parsedReport)
      : generateProgressBlogPost(parsedReport);

    return NextResponse.json({
      success: true,
      preview,
      parsed: {
        projectId: project.id,
        projectName: project.name,
        date: parsedReport.date,
        taskCount: parsedReport.completedTasks.length,
        issueCount: parsedReport.issues.length,
        hasImpact: !!parsedReport.impactSummary,
        nextStepCount: parsedReport.nextSteps.length,
      },
    });

  } catch (error) {
    console.error('Error generating from progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate blog post from progress report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
