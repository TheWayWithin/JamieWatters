import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const VALID_TYPES = ['approval', 'blocker', 'error', 'warning', 'question'];
const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low'];
const SEVERITY_WEIGHT: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

// GET /api/admin/issues
export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const statusParam = searchParams.get('status') || 'open,in_progress';
    const projectId = searchParams.get('projectId') || undefined;
    const since = searchParams.get('since') || undefined;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (severity) {
      const sevArr = severity.split(',').map((s) => s.trim());
      where.severity = sevArr.length === 1 ? sevArr[0] : { in: sevArr };
    }
    if (statusParam !== 'all') {
      const statArr = statusParam.split(',').map((s) => s.trim());
      where.status = statArr.length === 1 ? statArr[0] : { in: statArr };
    }
    if (projectId) where.projectId = projectId;
    if (since) where.createdAt = { gte: new Date(since) };

    const issues = await prisma.issue.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    // Sort by severity weight then createdAt desc
    issues.sort((a, b) => {
      const sw = (SEVERITY_WEIGHT[a.severity] ?? 9) - (SEVERITY_WEIGHT[b.severity] ?? 9);
      if (sw !== 0) return sw;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Compute counts
    const allIssues = await prisma.issue.findMany({
      select: { type: true, severity: true, status: true },
    });

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let openCount = 0;

    for (const i of allIssues) {
      byType[i.type] = (byType[i.type] || 0) + 1;
      bySeverity[i.severity] = (bySeverity[i.severity] || 0) + 1;
      if (i.status === 'open' || i.status === 'in_progress') openCount++;
    }

    return NextResponse.json({
      issues,
      counts: {
        byType,
        bySeverity,
        total: allIssues.length,
        open: openCount,
      },
    });
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/issues
export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const { type, title, severity, description, source, projectId, assignedTo } = body;

    if (!type || !title || !severity) {
      return NextResponse.json({ error: 'Missing required fields: type, title, severity' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
    }
    if (!VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json({ error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}` }, { status: 400 });
    }

    const issue = await prisma.issue.create({
      data: {
        type,
        title,
        severity,
        description: description || null,
        source: source || 'manual',
        projectId: projectId || null,
        assignedTo: assignedTo || null,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error('Failed to create issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
