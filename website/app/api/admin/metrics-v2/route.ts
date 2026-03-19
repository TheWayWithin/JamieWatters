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
    const metrics = await prisma.mcMetric.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });

    const grouped: Record<string, typeof metrics> = {};
    for (const m of metrics) {
      if (!grouped[m.group]) grouped[m.group] = [];
      grouped[m.group].push(m);
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Metrics v2 error:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
