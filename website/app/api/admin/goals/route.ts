import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const STATUS_PRIORITY: Record<string, number> = {
  behind: 0,
  at_risk: 1,
  on_track: 2,
  achieved: 3,
};

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

// GET /api/admin/goals
export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    // Add computed fields and sort by status priority
    const enriched = goals
      .map((g) => ({
        ...g,
        progressPercent: computeProgressPercent(g.currentValue, g.targetValue),
      }))
      .sort((a, b) => {
        // deadline asc (nulls last), then status severity
        if (a.deadline && b.deadline) {
          const diff = a.deadline.getTime() - b.deadline.getTime();
          if (diff !== 0) return diff;
        } else if (a.deadline && !b.deadline) {
          return -1;
        } else if (!a.deadline && b.deadline) {
          return 1;
        }
        return (STATUS_PRIORITY[a.status] ?? 2) - (STATUS_PRIORITY[b.status] ?? 2);
      });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/goals
export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, metric, currentValue, targetValue, unit, category, description, deadline, projectId, status } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!name) missing.push('name');
    if (!metric) missing.push('metric');
    if (currentValue === undefined || currentValue === null) missing.push('currentValue');
    if (targetValue === undefined || targetValue === null) missing.push('targetValue');
    if (!unit) missing.push('unit');
    if (!category) missing.push('category');
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    if (targetValue <= 0) {
      return NextResponse.json({ error: 'targetValue must be greater than 0' }, { status: 400 });
    }
    if (currentValue < 0) {
      return NextResponse.json({ error: 'currentValue must be >= 0' }, { status: 400 });
    }

    const deadlineDate = deadline ? new Date(deadline) : null;
    const resolvedStatus = status || autoComputeStatus(currentValue, targetValue, deadlineDate);

    const goal = await prisma.goal.create({
      data: {
        name,
        description: description || null,
        metric,
        currentValue: Number(currentValue),
        targetValue: Number(targetValue),
        unit,
        category,
        status: resolvedStatus,
        deadline: deadlineDate,
        projectId: projectId || null,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      {
        ...goal,
        progressPercent: computeProgressPercent(goal.currentValue, goal.targetValue),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
