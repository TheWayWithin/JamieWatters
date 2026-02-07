import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

// Force Node.js runtime for consistency
export const runtime = 'nodejs';

interface MemoryFileResponse {
  content: string;
  filename: string;
  lastModified: string;
}

/**
 * GET /api/admin/memory/[filename] - Get specific memory file content
 *
 * Security: Authentication required
 * Path validation: Only allow .md files in memory directory or MEMORY.md
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
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

    const params = await context.params;
    const filename = params.filename;

    // Validate filename for security
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Only allow .md files
    if (!filename.endsWith('.md')) {
      return NextResponse.json({ error: 'Only markdown files are allowed' }, { status: 400 });
    }

    // Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename characters' }, { status: 400 });
    }

    const workspaceRoot = '/home/ubuntu/clawd';
    let filePath: string;

    // Special case for MEMORY.md (in workspace root)
    if (filename === 'MEMORY.md') {
      filePath = join(workspaceRoot, 'MEMORY.md');
    } else {
      // Regular memory files (in memory/ subdirectory)
      filePath = join(workspaceRoot, 'memory', filename);
    }

    try {
      // Read file content and stats
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);

      const response: MemoryFileResponse = {
        content,
        filename,
        lastModified: stats.mtime.toISOString(),
      };

      return NextResponse.json(response);

    } catch (fileError) {
      console.error(`Error reading memory file ${filename}:`, fileError);
      
      if ((fileError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }

  } catch (error) {
    console.error('Memory file API error:', error);
    return NextResponse.json({ error: 'Failed to fetch memory file' }, { status: 500 });
  }
}