/**
 * API Route: List Progress Report Files
 *
 * Scans the progress directory for .md files and returns
 * a sorted list with metadata extracted from each file.
 *
 * GET /api/admin/content/list-progress-files
 * Returns: { success: true, files: ProgressFileInfo[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { parseProgressReport, extractDateFromFilename, extractProjectName } from '@/lib/progress-parser';

// Force Node.js runtime for auth and file operations
export const runtime = 'nodejs';

// Base directory for progress files (relative to project root)
const PROGRESS_DIR = process.env.PROGRESS_DIR || 'progress';

export interface ProgressFileInfo {
  filename: string;
  date: string;
  projectName: string;
  taskCount: number;
  issueCount: number;
  relativePath: string;
}

async function scanDirectory(dirPath: string, basePath: string = ''): Promise<ProgressFileInfo[]> {
  const files: ProgressFileInfo[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(entryPath, relativePath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          // Read and parse the file to extract metadata
          const content = await fs.readFile(entryPath, 'utf-8');
          const parsed = parseProgressReport(content);

          // Try to get date from parsed content, fallback to filename
          let date = parsed.date;
          if (!date || date === new Date().toISOString().split('T')[0]) {
            const filenameDate = extractDateFromFilename(entry.name);
            if (filenameDate) {
              date = filenameDate;
            }
          }

          files.push({
            filename: entry.name,
            date,
            projectName: parsed.projectName !== 'Unknown Project'
              ? parsed.projectName
              : extractProjectName(content, entry.name),
            taskCount: parsed.completedTasks.length,
            issueCount: parsed.issues.length,
            relativePath
          });
        } catch (parseError) {
          console.warn(`Warning: Could not parse ${entryPath}:`, parseError);
          // Still include the file with basic info
          files.push({
            filename: entry.name,
            date: extractDateFromFilename(entry.name) || 'unknown',
            projectName: 'Unknown',
            taskCount: 0,
            issueCount: 0,
            relativePath
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return files;
}

export async function GET(req: NextRequest) {
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

    // Construct full path to progress directory
    const progressDirFull = path.join(process.cwd(), PROGRESS_DIR);

    // Check if directory exists
    try {
      await fs.access(progressDirFull);
    } catch {
      // Directory doesn't exist - return empty list with helpful message
      return NextResponse.json({
        success: true,
        files: [],
        total: 0,
        progressDir: PROGRESS_DIR,
        message: `Progress directory not found. Create a '${PROGRESS_DIR}' directory in your project root and add .md progress files.`
      });
    }

    // Scan for progress files
    const files = await scanDirectory(progressDirFull);

    // Sort by date descending (newest first)
    files.sort((a, b) => {
      if (a.date === 'unknown') return 1;
      if (b.date === 'unknown') return -1;
      return b.date.localeCompare(a.date);
    });

    return NextResponse.json({
      success: true,
      files,
      total: files.length,
      progressDir: PROGRESS_DIR
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
