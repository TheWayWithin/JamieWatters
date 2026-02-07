import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/admin/tasks - Get tasks from database
 * Data synced from TASKS.md via agent sync script
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

    // Fetch from database (synced by agent)
    const tasks = await prisma.agentTask.findMany({
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });

    // Group by section
    const sections: { [key: string]: { content: string; completed: boolean }[] } = {};
    let latestSync: Date | null = null;

    for (const task of tasks) {
      if (!sections[task.section]) {
        sections[task.section] = [];
      }
      sections[task.section].push({
        content: task.content,
        completed: task.completed,
      });
      if (!latestSync || task.syncedAt > latestSync) {
        latestSync = task.syncedAt;
      }
    }

    // Convert to array format
    const sectionArray = Object.entries(sections).map(([title, items]) => ({
      title,
      tasks: items,
      total: items.length,
      completed: items.filter((t) => t.completed).length,
    }));

    return NextResponse.json({
      sections: sectionArray,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.completed).length,
      lastSynced: latestSync?.toISOString() || null,
    });

  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
