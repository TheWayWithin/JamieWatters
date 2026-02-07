import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

const CLAWD_DIR = '/home/ubuntu/clawd';

/**
 * Helper to verify admin auth
 */
function verifyAdmin(req: NextRequest) {
  const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

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

/**
 * PATCH /api/admin/tasks - Toggle task completion
 * Updates both database AND TASKS.md file
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { section, content, completed } = body;

    if (!section || !content || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Missing section, content, or completed' }, { status: 400 });
    }

    // Update database
    const task = await prisma.agentTask.findFirst({
      where: { section, content },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.agentTask.update({
      where: { id: task.id },
      data: { completed, syncedAt: new Date() },
    });

    // Update TASKS.md file
    try {
      const tasksPath = join(CLAWD_DIR, 'TASKS.md');
      let tasksContent = readFileSync(tasksPath, 'utf8');
      
      // Escape special regex characters in content
      const escapedContent = content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Find and replace the task line
      const oldPattern = completed 
        ? new RegExp(`^([-*]\\s+\\[)[ ](\\]\\s+${escapedContent})`, 'm')
        : new RegExp(`^([-*]\\s+\\[)[xX](\\]\\s+${escapedContent})`, 'm');
      
      const newMark = completed ? 'x' : ' ';
      tasksContent = tasksContent.replace(oldPattern, `$1${newMark}$2`);
      
      writeFileSync(tasksPath, tasksContent, 'utf8');
    } catch (fileError) {
      console.error('Error updating TASKS.md:', fileError);
      // Don't fail the request - DB is updated, file sync can happen later
    }

    return NextResponse.json({ 
      success: true, 
      task: { section, content, completed } 
    });

  } catch (error) {
    console.error('Tasks PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
