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
    const status = searchParams.get('status') || 'open';
    const priority = searchParams.get('priority');

    const where: Record<string, string> = { status };
    if (priority) where.priority = priority;

    const items = await prisma.hitlItem.findMany({
      where,
      orderBy: [{ waitingSince: 'asc' }],
    });

    // Sort P0 first, then P1, P2 — Prisma can't sort by custom order
    const order: Record<string, number> = { P0: 0, P1: 1, P2: 2 };
    items.sort((a, b) => {
      const diff = (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
      if (diff !== 0) return diff;
      return a.waitingSince.getTime() - b.waitingSince.getTime();
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('HITL list error:', error);
    return NextResponse.json({ error: 'Failed to load HITL items' }, { status: 500 });
  }
}
