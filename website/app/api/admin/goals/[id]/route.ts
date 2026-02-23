import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function computeProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

function autoComputeStatus(
  currentValue: number,
  targetValue: number,
  deadline: Date | null
): string {
  if (currentValue >= targetValue) return 'achieved';
  const pct = computeProgressPercent(currentValue, targetValue);
  if (deadline) {
    const now = Date.now();
    const dl = deadline.getTime();
    const daysLeft = (dl - now) / (1000 * 60 * 60 * 24);
    if (daysLeft < 0 && pct < 50) return 'behind';
    if (daysLeft <= 7 && pct < 80) return 'at_risk';
  }
  return 'on_track';
}

// PATCH /api/admin/goals/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.goal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Build update data from provided fields
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.metric !== undefined) data.metric = body.metric;
    if (body.currentValue !== undefined) data.currentValue = Number(body.currentValue);
    if (body.targetValue !== undefined) data.targetValue = Number(body.targetValue);
    if (body.unit !== undefined) data.unit = body.unit;
    if (body.category !== undefined) data.category = body.category;
    if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.projectId !== undefined) data.projectId = body.projectId || null;

    // Auto-recalculate status if value fields changed
    const newCurrent = (data.currentValue as number) ?? existing.currentValue;
    const newTarget = (data.targetValue as number) ?? existing.targetValue;
    const newDeadline = data.deadline !== undefined
      ? (data.deadline as Date | null)
      : existing.deadline;

    if (body.status !== undefined) {
      // Explicit status override
      data.status = body.status;
    } else if (body.currentValue !== undefined || body.targetValue !== undefined) {
      // Auto-recalculate
      data.status = autoComputeStatus(newCurrent, newTarget, newDeadline);
    }

    const goal = await prisma.goal.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      ...goal,
      progressPercent: computeProgressPercent(goal.currentValue, goal.targetValue),
    });
  } catch (error) {
    console.error('Failed to update goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/goals/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.goal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    await prisma.goal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
