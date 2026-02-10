import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/admin/memory - Get memory files from database
 * Data synced from memory/*.md via agent sync script
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

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    // If specific file requested, return its content
    if (filename) {
      const memory = await prisma.agentMemory.findUnique({
        where: { filename },
      });

      if (!memory) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      return NextResponse.json({
        filename: memory.filename,
        content: memory.content,
        fileDate: memory.fileDate?.toISOString() || null,
        syncedAt: memory.syncedAt.toISOString(),
      });
    }

    // Otherwise return list of all files
    const memories = await prisma.agentMemory.findMany({
      orderBy: { fileDate: 'desc' },
      select: {
        filename: true,
        fileDate: true,
        syncedAt: true,
      },
    });

    // Put MEMORY.md at top if it exists
    const sortedFiles = memories.sort((a, b) => {
      if (a.filename === 'MEMORY.md') return -1;
      if (b.filename === 'MEMORY.md') return 1;
      return 0;
    });

    return NextResponse.json({
      files: sortedFiles.map((m) => ({
        name: m.filename,
        modified: m.fileDate?.toISOString() || m.syncedAt.toISOString(),
        pinned: m.filename === 'MEMORY.md',
      })),
    });

  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 });
  }
}
