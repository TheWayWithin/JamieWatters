import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/admin/agents
export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

    const agents = await prisma.agentStatus.findMany({
      orderBy: { lastActiveAt: 'desc' },
    });

    // Enrich each agent
    const enriched = agents.map((agent) => {
      const isOnline = agent.lastActiveAt >= fifteenMinAgo;
      let activityLevel: 'high' | 'medium' | 'low' = 'low';
      if (agent.tasksThisWeek > 10) activityLevel = 'high';
      else if (agent.tasksThisWeek > 3) activityLevel = 'medium';

      return {
        ...agent,
        lastActiveAt: agent.lastActiveAt.toISOString(),
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
        isOnline,
        activityLevel,
      };
    });

    // Fetch scheduled tasks for all agents
    const schedules = await prisma.agentSchedule.findMany({
      orderBy: { nextRunAt: 'asc' },
    });

    const activeAgents = enriched.filter((a) => a.isOnline).length;
    const totalTasksThisWeek = agents.reduce((sum, a) => sum + a.tasksThisWeek, 0);

    return NextResponse.json({
      agents: enriched,
      schedules: schedules.map((s) => ({
        jobId: s.jobId,
        name: s.name,
        schedule: s.schedule,
        timezone: s.timezone,
        nextRunAt: s.nextRunAt?.toISOString() || null,
        lastRunAt: s.lastRunAt?.toISOString() || null,
        lastStatus: s.lastStatus,
        enabled: s.enabled,
      })),
      stats: {
        totalAgents: agents.length,
        activeAgents,
        totalTasksThisWeek,
      },
    });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
