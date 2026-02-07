import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/admin/scheduled-tasks/triggers - Get pending triggers
 */
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

    const triggers = await prisma.agentCronTrigger.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ triggers });
  } catch (error) {
    console.error('Triggers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch triggers' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/scheduled-tasks/triggers - Update trigger status
 */
export async function PATCH(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { triggerId, status, result } = body;

    if (!triggerId || !status) {
      return NextResponse.json({ error: 'Missing triggerId or status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    
    if (status === 'running') {
      updateData.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
      if (result) updateData.result = result;
    }

    await prisma.agentCronTrigger.update({
      where: { id: triggerId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Triggers PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update trigger' }, { status: 500 });
  }
}
