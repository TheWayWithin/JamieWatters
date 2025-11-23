/**
 * API Route: Generate Blog Post from Progress Report
 *
 * Reads a local progress report file and generates a blog-ready
 * post with issues and learnings included for authentic content.
 *
 * POST /api/admin/content/generate-from-progress
 * Body: { filePath: string, format?: 'full' | 'summary' }
 * Returns: { success: true, preview: ProgressReportOutput }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { parseProgressReport } from '@/lib/progress-parser';
import { generateProgressBlogPost, generateProgressSummary } from '@/lib/progress-report-generator';
import { z } from 'zod';

// Force Node.js runtime for auth and file operations
export const runtime = 'nodejs';

// Base directory for progress files (relative to project root)
const PROGRESS_DIR = process.env.PROGRESS_DIR || 'progress';

// Request validation schema
const requestSchema = z.object({
  filePath: z.string().min(1, 'filePath is required'),
  format: z.enum(['full', 'summary']).optional().default('full'),
});

export async function POST(req: NextRequest) {
  try {
    // Verify authentication (same pattern as generate-daily)
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

    const { filePath, format } = validation.data;

    // Security: Validate file path to prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Ensure the file has .md extension
    if (!normalizedPath.endsWith('.md')) {
      return NextResponse.json(
        { error: 'Only .md files are allowed' },
        { status: 400 }
      );
    }

    // Construct full file path
    const fullPath = path.join(process.cwd(), PROGRESS_DIR, normalizedPath);

    // Verify the file is within the progress directory
    const progressDirFull = path.join(process.cwd(), PROGRESS_DIR);
    if (!fullPath.startsWith(progressDirFull)) {
      return NextResponse.json(
        { error: 'File must be within progress directory' },
        { status: 400 }
      );
    }

    // Read the file
    let fileContent: string;
    try {
      fileContent = await fs.readFile(fullPath, 'utf-8');
    } catch (readError) {
      console.error('Error reading progress file:', readError);
      return NextResponse.json(
        { error: 'Progress file not found', details: `Could not read: ${normalizedPath}` },
        { status: 404 }
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
        projectName: parsedReport.projectName,
        date: parsedReport.date,
        taskCount: parsedReport.completedTasks.length,
        issueCount: parsedReport.issues.length,
        hasImpact: !!parsedReport.impactSummary,
        nextStepCount: parsedReport.nextSteps.length
      }
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
