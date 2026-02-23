import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// PATCH /api/admin/tasks/[id] - Update task (status, section, completed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.agentTask.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const data: Record<string, unknown> = { syncedAt: new Date() };

    // Map Kanban column to section/completed
    if (body.column !== undefined) {
      switch (body.column) {
        case 'done':
          data.completed = true;
          break;
        case 'in_progress':
          data.section = 'Active Sprint';
          data.completed = false;
          break;
        case 'review':
          data.section = 'Review';
          data.completed = false;
          break;
        case 'backlog':
          data.section = 'Backlog';
          data.completed = false;
          break;
      }
    }

    if (body.section !== undefined) data.section = body.section;
    if (body.completed !== undefined) data.completed = body.completed;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

    const task = await prisma.agentTask.update({
      where: { id },
      data,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
