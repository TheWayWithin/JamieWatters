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
    const { searchParams } = new URL(req.url);
    const actor = searchParams.get('actor');
    const entity = searchParams.get('entity');
    const since = searchParams.get('since');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};
    if (actor) where.actor = actor;
    if (entity) where.entity = entity;
    if (since) where.timestamp = { gte: new Date(since) };

    const [events, total] = await Promise.all([
      prisma.eventLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.eventLog.count({ where }),
    ]);

    return NextResponse.json({ events, total, limit, offset });
  } catch (error) {
    console.error('Event log error:', error);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
