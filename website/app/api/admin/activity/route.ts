import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/admin/activity - Get agent activity from database
 * Data synced from memory files via agent sync script
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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const where = category ? { category } : {};

    const activities = await prisma.agentActivity.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: Math.min(limit, 100),
    });

    // Get category counts
    const categoryCounts = await prisma.agentActivity.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    const categoryMap: { [key: string]: number } = {};
    for (const cat of categoryCounts) {
      categoryMap[cat.category] = cat._count.category;
    }

    return NextResponse.json({
      activities: activities.map((a) => ({
        id: a.id,
        action: a.action,
        category: a.category,
        details: a.details,
        occurredAt: a.occurredAt.toISOString(),
        syncedAt: a.syncedAt.toISOString(),
      })),
      categories: categoryMap,
      total: activities.length,
    });

  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
