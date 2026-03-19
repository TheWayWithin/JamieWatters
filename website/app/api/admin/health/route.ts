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
    const records = await prisma.systemHealth.findMany({
      orderBy: { system: 'asc' },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error('System health error:', error);
    return NextResponse.json({ error: 'Failed to load system health' }, { status: 500 });
  }
}
