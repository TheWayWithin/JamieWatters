import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/admin/overview - Aggregated metrics for Mission Control dashboard
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

    // Run all aggregate queries in parallel for efficiency
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

    const [
      totalTasks,
      completedTasks,
      backlogCount,
      inProgressCount,
      reviewCount,
      totalProjects,
      activeProjects,
      recentActivityCount,
      scheduledTaskCount,
      topPriorities,
      recentActivity,
      openIssueCount,
      criticalIssues,
      issuesByTypeRaw,
      totalGoals,
      goalsOnTrack,
      goalsAtRisk,
      goalsAchieved,
      totalAgents,
      activeAgents,
    ] = await Promise.all([
      // Total tasks
      prisma.agentTask.count(),

      // Completed tasks
      prisma.agentTask.count({
        where: { completed: true },
      }),

      // Backlog: tasks not in 'Active Sprint', not completed
      prisma.agentTask.count({
        where: {
          section: { not: 'Active Sprint' },
          completed: false,
        },
      }),

      // In Progress: tasks in 'Active Sprint', not completed
      prisma.agentTask.count({
        where: {
          section: 'Active Sprint',
          completed: false,
        },
      }),

      // Review: tasks in sections containing 'Review', not completed
      prisma.agentTask.count({
        where: {
          section: { contains: 'Review' },
          completed: false,
        },
      }),

      // Total projects
      prisma.project.count(),

      // Active projects (LIVE, BUILD, MVP)
      prisma.project.count({
        where: {
          status: { in: ['LIVE', 'BUILD', 'MVP'] },
        },
      }),

      // Recent activity count (last 24h)
      prisma.agentActivity.count({
        where: {
          occurredAt: { gte: twentyFourHoursAgo },
        },
      }),

      // Scheduled task count
      prisma.agentSchedule.count(),

      // Top 5 non-completed tasks by sort order
      prisma.agentTask.findMany({
        where: { completed: false },
        orderBy: [{ sortOrder: 'asc' }, { syncedAt: 'desc' }],
        take: 5,
        select: {
          id: true,
          content: true,
          section: true,
          completed: true,
          sortOrder: true,
        },
      }),

      // Last 10 activities
      prisma.agentActivity.findMany({
        orderBy: { occurredAt: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          category: true,
          details: true,
          occurredAt: true,
        },
      }),

      // Open issues count
      prisma.issue.count({
        where: { status: { in: ['open', 'in_progress'] } },
      }),

      // Critical issues (open)
      prisma.issue.findMany({
        where: {
          severity: 'critical',
          status: { in: ['open', 'in_progress'] },
        },
        select: { id: true, title: true, type: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Issues by type (open only)
      prisma.issue.groupBy({
        by: ['type'],
        where: { status: { in: ['open', 'in_progress'] } },
        _count: true,
      }),

      // Goals: total
      prisma.goal.count(),

      // Goals: on track
      prisma.goal.count({
        where: { status: 'on_track' },
      }),

      // Goals: at risk or behind
      prisma.goal.count({
        where: { status: { in: ['at_risk', 'behind'] } },
      }),

      // Goals: achieved
      prisma.goal.count({
        where: { status: 'achieved' },
      }),

      // Agents: total registered
      prisma.agentStatus.count(),

      // Agents: active (seen in last 15 min)
      prisma.agentStatus.count({
        where: { lastActiveAt: { gte: fifteenMinAgo } },
      }),
    ]);

    // Build issuesByType map
    const issuesByType: Record<string, number> = {};
    for (const row of issuesByTypeRaw) {
      issuesByType[row.type] = row._count;
    }

    return NextResponse.json({
      totalTasks,
      completedTasks,
      tasksByStatus: {
        backlog: backlogCount,
        in_progress: inProgressCount,
        review: reviewCount,
        done: completedTasks,
      },
      totalProjects,
      activeProjects,
      recentActivityCount,
      scheduledTaskCount,
      topPriorities,
      recentActivity: recentActivity.map((a) => ({
        ...a,
        occurredAt: a.occurredAt.toISOString(),
      })),
      openIssueCount,
      criticalIssueCount: criticalIssues.length,
      criticalIssues,
      issuesByType,
      goalsSummary: {
        total: totalGoals,
        onTrack: goalsOnTrack,
        atRisk: goalsAtRisk,
        achieved: goalsAchieved,
      },
      agentsSummary: {
        total: totalAgents,
        active: activeAgents,
      },
    });
  } catch (error) {
    console.error('Failed to fetch overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
