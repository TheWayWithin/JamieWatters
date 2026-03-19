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
    const ops = await prisma.recurringOp.findMany({
      orderBy: { nextDue: 'asc' },
    });
    return NextResponse.json(ops);
  } catch (error) {
    console.error('Recurring ops error:', error);
    return NextResponse.json({ error: 'Failed to load recurring ops' }, { status: 500 });
  }
}
