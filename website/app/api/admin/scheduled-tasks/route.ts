import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

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
 * GET /api/admin/scheduled-tasks - Get scheduled tasks from database
 * Data synced from Clawdbot agent via sync script
 */
export async function GET(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch from database (synced by agent)
    const schedules = await prisma.agentSchedule.findMany({
      orderBy: { nextRunAt: 'asc' },
    });

    const jobs = schedules.map((s) => ({
      jobId: s.jobId,
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

/**
 * POST /api/admin/scheduled-tasks - Queue a cron job to run
 * The sync script picks up pending triggers and executes them
 */
export async function POST(req: NextRequest) {
  try {
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, jobName, action } = body;

    if (action === 'trigger') {
      if (!jobId || !jobName) {
        return NextResponse.json({ error: 'Missing jobId or jobName' }, { status: 400 });
      }

      // Create a pending trigger
      const trigger = await prisma.agentCronTrigger.create({
        data: {
          jobId,
          jobName,
          status: 'pending',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Job "${jobName}" queued for execution`,
        triggerId: trigger.id,
      });
    }

    if (action === 'toggle') {
      // Toggle enabled status
      const schedule = await prisma.agentSchedule.findFirst({
        where: { jobId },
      });

      if (!schedule) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      await prisma.agentSchedule.update({
        where: { id: schedule.id },
        data: { enabled: !schedule.enabled },
      });

      return NextResponse.json({
        success: true,
        enabled: !schedule.enabled,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Scheduled tasks POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
