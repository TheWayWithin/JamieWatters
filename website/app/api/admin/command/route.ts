import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      quarterlyKRs,
      todaysCompletions,
      hitlOpen,
      hitlP0,
      agentSummary,
      weeklyScore,
      blockedTasks,
    ] = await Promise.all([
      prisma.goal.findMany({
        where: {
          OR: [
            { horizon: 'quarterly' },
            { category: { in: ['Revenue', 'Growth', 'Product', 'Infrastructure'] } },
          ],
        },
        select: {
          id: true, goalId: true, name: true, currentValue: true,
          targetValue: true, unit: true, status: true, dueDate: true, category: true,
        },
      }),
      prisma.agentTask.findMany({
        where: { taskStatus: 'done', syncedAt: { gte: todayStart } },
        select: { id: true, tid: true, content: true, owner: true },
      }),
      prisma.hitlItem.count({ where: { status: 'open' } }),
      prisma.hitlItem.findMany({
        where: { status: 'open', priority: 'P0' },
        orderBy: { waitingSince: 'asc' },
        select: {
          id: true, tid: true, description: true,
          waitingSince: true, blocks: true, requestingAgent: true,
        },
      }),
      prisma.project.findMany({
        select: {
          id: true, name: true, slug: true, status: true,
          health: true, tier: true, progress: true, blocker: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.mcMetric.findMany({ where: { group: 'execution' } }),
      prisma.agentTask.findMany({
        where: { taskStatus: 'blocked' },
        select: {
          id: true, tid: true, content: true, blockedBy: true, syncedAt: true,
        },
        orderBy: { syncedAt: 'asc' },
        take: 10,
      }),
    ]);

    const now = Date.now();
    const topBlockers = blockedTasks.map((t) => ({
      ...t,
      ageDays: Math.floor((now - t.syncedAt.getTime()) / 86_400_000),
    }));

    // Count active tasks per project for dev activity
    const tasksByProject = await prisma.agentTask.groupBy({
      by: ['project'],
      where: { taskStatus: { notIn: ['done', 'cancelled', 'parked'] } },
      _count: true,
    });
    const taskCountMap: Record<string, number> = {};
    for (const t of tasksByProject) {
      if (t.project) taskCountMap[t.project] = t._count;
    }

    // Enrich projects with task counts
    const projectActivity = agentSummary.map((p) => ({
      ...p,
      activeTasks: taskCountMap[p.name] || taskCountMap[p.slug] || 0,
    }));

    return NextResponse.json({
      quarterlyKRs,
      todaysCompletions,
      hitlCount: hitlOpen,
      hitlP0,
      projectActivity,
      weeklyScore,
      blockedCount: blockedTasks.length,
      topBlockers,
    });
  } catch (error) {
    console.error('Command view error:', error);
    return NextResponse.json({ error: 'Failed to load command view' }, { status: 500 });
  }
}
