import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/admin/scheduled-tasks - Get scheduled tasks from database
 * Data synced from Clawdbot agent via sync script
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
    const schedules = await prisma.agentSchedule.findMany({
      orderBy: { nextRunAt: 'asc' },
    });

    const jobs = schedules.map((s) => ({
      name: s.name,
      nextRun: s.nextRunAt?.toISOString() || null,
      schedule: s.schedule,
      timezone: s.timezone,
      lastStatus: s.lastStatus || 'unknown',
      lastRun: s.lastRunAt?.toISOString() || null,
      enabled: s.enabled,
      syncedAt: s.syncedAt.toISOString(),
    }));

    return NextResponse.json({ jobs });

  } catch (error) {
    console.error('Scheduled tasks API error:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled tasks' }, { status: 500 });
  }
}
