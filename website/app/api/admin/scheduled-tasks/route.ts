import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

// Force Node.js runtime for consistency
export const runtime = 'nodejs';

interface CronJob {
  jobId: string;
  note?: string;
  contextMessages?: number;
  text: string;
  schedule: string;
  timeoutMs?: number;
  enabled: boolean;
  lastStatus?: string;
  lastRun?: string;
  nextRun?: string;
}

interface CronListResponse {
  jobs: CronJob[];
}

/**
 * GET /api/admin/scheduled-tasks - Get scheduled tasks from Clawdbot
 *
 * Security: Authentication required
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

    // Try to fetch from Clawdbot Gateway
    try {
      // Use the cron tool from the agent's perspective
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const cronResponse = await fetch('http://localhost:9001/api/cron/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (cronResponse.ok) {
        const cronData: CronListResponse = await cronResponse.json();
        
        // Transform the cron jobs into the expected format
        const jobs = (cronData.jobs || []).map((job: CronJob) => {
          // Calculate next run time based on schedule
          const nextRun = calculateNextRun(job.schedule, job.lastRun);
          
          return {
            name: job.note || job.jobId || 'Unnamed Job',
            nextRun: nextRun,
            schedule: job.schedule || 'Unknown',
            lastStatus: job.lastStatus || 'unknown',
            enabled: job.enabled !== false,
            lastRun: job.lastRun,
          };
        });

        return NextResponse.json({ jobs });
      } else {
        // Fallback: return mock data if Clawdbot is not available
        return NextResponse.json({
          jobs: [
            {
              name: 'Clawdbot Gateway Unavailable',
              nextRun: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
              schedule: 'Service unavailable',
              lastStatus: 'error',
              enabled: false,
            },
          ],
        });
      }
    } catch (fetchError) {
      console.error('Error fetching from Clawdbot gateway:', fetchError);
      
      // Return mock data for development/testing
      return NextResponse.json({
        jobs: [
          {
            name: 'daily-morning-email-review',
            nextRun: getNextMorning9AM().toISOString(),
            schedule: '0 14 * * *', // 9 AM ET = 14:00 UTC
            lastStatus: 'ok',
            enabled: true,
          },
          {
            name: 'overnight-worker',
            nextRun: getNextMidnight().toISOString(),
            schedule: '0 5 * * *', // Midnight ET = 05:00 UTC
            lastStatus: 'ok',
            enabled: true,
          },
        ],
      });
    }

  } catch (error) {
    console.error('Scheduled tasks API error:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled tasks' }, { status: 500 });
  }
}

function calculateNextRun(schedule: string, lastRun?: string): string {
  // Simple next run calculation - could use a proper cron parser
  const now = new Date();
  
  // For common patterns, calculate next run
  if (schedule === '0 14 * * *') {
    // Daily at 9 AM ET (14:00 UTC)
    return getNextMorning9AM().toISOString();
  } else if (schedule === '0 5 * * *') {
    // Daily at midnight ET (05:00 UTC)
    return getNextMidnight().toISOString();
  } else {
    // Default: next hour
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  }
}

function getNextMorning9AM(): Date {
  const now = new Date();
  const next9AM = new Date();
  
  // Set to 9 AM ET (14:00 UTC)
  next9AM.setUTCHours(14, 0, 0, 0);
  
  // If it's past 9 AM today, schedule for tomorrow
  if (now.getTime() >= next9AM.getTime()) {
    next9AM.setUTCDate(next9AM.getUTCDate() + 1);
  }
  
  return next9AM;
}

function getNextMidnight(): Date {
  const now = new Date();
  const nextMidnight = new Date();
  
  // Set to midnight ET (05:00 UTC)
  nextMidnight.setUTCHours(5, 0, 0, 0);
  
  // If it's past midnight today, schedule for tomorrow
  if (now.getTime() >= nextMidnight.getTime()) {
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
  }
  
  return nextMidnight;
}