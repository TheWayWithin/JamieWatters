import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

// Force Node.js runtime for consistency
export const runtime = 'nodejs';

interface MemoryFile {
  name: string;
  modified: string;
  pinned?: boolean;
}

interface MemoryFilesResponse {
  files: MemoryFile[];
}

/**
 * GET /api/admin/memory - List memory files
 *
 * Security: Authentication required
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

    // Paths to check for memory files
    const workspaceRoot = '/home/ubuntu/clawd';
    const memoryDir = join(workspaceRoot, 'memory');
    const memoryMdPath = join(workspaceRoot, 'MEMORY.md');

    const files: MemoryFile[] = [];

    // Check for MEMORY.md (pinned)
    try {
      const memoryStats = await fs.stat(memoryMdPath);
      files.push({
        name: 'MEMORY.md',
        modified: memoryStats.mtime.toISOString(),
        pinned: true,
      });
    } catch (error) {
      // MEMORY.md doesn't exist, that's ok
    }

    // Check memory directory
    try {
      const memoryDirContents = await fs.readdir(memoryDir);
      
      // Filter for .md files and get their stats
      for (const filename of memoryDirContents) {
        if (filename.endsWith('.md')) {
          try {
            const filePath = join(memoryDir, filename);
            const fileStats = await fs.stat(filePath);
            
            files.push({
              name: filename,
              modified: fileStats.mtime.toISOString(),
            });
          } catch (fileError) {
            console.error(`Error reading memory file ${filename}:`, fileError);
          }
        }
      }
    } catch (dirError) {
      console.log('Memory directory not found, creating it...');
      // Memory directory doesn't exist, that's ok - we'll just return what we have
    }

    // Sort files: MEMORY.md first (pinned), then by date (newest first)
    files.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Both are pinned or both are not pinned, sort by date
      return new Date(b.modified).getTime() - new Date(a.modified).getTime();
    });

    const response: MemoryFilesResponse = {
      files,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Memory files API error:', error);
    return NextResponse.json({ error: 'Failed to fetch memory files' }, { status: 500 });
  }
}