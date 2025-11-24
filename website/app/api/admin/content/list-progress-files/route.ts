/**
 * API Route: List Progress Report Files from GitHub
 *
 * Fetches progress files from the /progress/ directory in each
 * tracked project's GitHub repository.
 *
 * GET /api/admin/content/list-progress-files
 * Returns: { success: true, files: ProgressFileInfo[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseGitHubUrl, listDirectoryFromGitHub, fetchFileFromGitHub, GitHubConfig } from '@/lib/github';
import { parseProgressReport, extractDateFromFilename } from '@/lib/progress-parser';
import { decryptToken } from '@/lib/encryption';

// Force Node.js runtime for auth and encryption
export const runtime = 'nodejs';

export interface ProgressFileInfo {
  filename: string;
  date: string;
  projectId: string;
  projectName: string;
  taskCount: number;
  issueCount: number;
  // Path within the repo (e.g., "progress/2025-11-23.md")
  repoPath: string;
}

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

    // Fetch all projects that track progress and have GitHub configured
    const projects = await prisma.project.findMany({
      where: {
        trackProgress: true,
        githubUrl: { not: null },
      },
      select: {
        id: true,
        name: true,
        githubUrl: true,
        githubToken: true,
      },
    });

    if (projects.length === 0) {
      return NextResponse.json({
        success: true,
        files: [],
        total: 0,
        message: 'No projects configured for progress tracking. Enable "Track Progress" and add a GitHub URL in project settings.',
      });
    }

    // Collect all progress files from all projects
    const allFiles: ProgressFileInfo[] = [];

    for (const project of projects) {
      try {
        // Skip if no GitHub URL
        if (!project.githubUrl) continue;

        // Parse GitHub URL
        const parsed = parseGitHubUrl(project.githubUrl);
        if (!parsed) {
          console.warn(`Invalid GitHub URL for project ${project.name}`);
          continue;
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
            continue;
          }
        }

        // List files in /progress/ directory
        const entries = await listDirectoryFromGitHub(config, 'progress');

        // Filter to only .md files
        const mdFiles = entries.filter(
          entry => entry.type === 'file' && entry.name.endsWith('.md')
        );

        // Fetch and parse each file to get metadata
        for (const file of mdFiles) {
          try {
            // Fetch file content
            const content = await fetchFileFromGitHub(config, file.path);

            // Parse to extract metadata
            const parsed = parseProgressReport(content);

            // Get date from parsed content or filename
            let date = parsed.date;
            if (!date || date === new Date().toISOString().split('T')[0]) {
              const filenameDate = extractDateFromFilename(file.name);
              if (filenameDate) {
                date = filenameDate;
              }
            }

            allFiles.push({
              filename: file.name,
              date,
              projectId: project.id,
              projectName: project.name,
              taskCount: parsed.completedTasks.length,
              issueCount: parsed.issues.length,
              repoPath: file.path,
            });
          } catch (fileError) {
            console.warn(`Failed to parse progress file ${file.name} in ${project.name}:`, fileError);
            // Still include file with basic info
            allFiles.push({
              filename: file.name,
              date: extractDateFromFilename(file.name) || 'unknown',
              projectId: project.id,
              projectName: project.name,
              taskCount: 0,
              issueCount: 0,
              repoPath: file.path,
            });
          }
        }
      } catch (projectError) {
        // Log error but continue with other projects
        console.error(`Failed to fetch progress files for ${project.name}:`, projectError);
      }
    }

    // Sort by date descending (newest first)
    allFiles.sort((a, b) => {
      if (a.date === 'unknown') return 1;
      if (b.date === 'unknown') return -1;
      return b.date.localeCompare(a.date);
    });

    return NextResponse.json({
      success: true,
      files: allFiles,
      total: allFiles.length,
      projectsScanned: projects.length,
    });

  } catch (error) {
    console.error('Error listing progress files:', error);
    return NextResponse.json(
      {
        error: 'Failed to list progress files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
