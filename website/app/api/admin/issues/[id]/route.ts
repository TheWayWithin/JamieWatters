import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ['in_progress', 'resolved', 'dismissed'],
  in_progress: ['resolved', 'dismissed'],
  resolved: [],
  dismissed: [],
};

// PATCH /api/admin/issues/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.issue.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const data: Record<string, unknown> = {};

    // Status transition validation
    if (body.status !== undefined) {
      const allowed = VALID_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid transition: ${existing.status} -> ${body.status}. Allowed: ${allowed.join(', ') || 'none'}` },
          { status: 400 }
        );
      }

      data.status = body.status;

      // Auto-set resolvedAt
      if (body.status === 'resolved' || body.status === 'dismissed') {
        data.resolvedAt = new Date();
      }

      // Resolution required for 'resolved'
      if (body.status === 'resolved' && !body.resolution && !existing.resolution) {
        return NextResponse.json(
          { error: 'Resolution description is required when resolving an issue' },
          { status: 400 }
        );
      }
    }

    if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo || null;
    if (body.resolution !== undefined) data.resolution = body.resolution || null;
    if (body.severity !== undefined) data.severity = body.severity;
    if (body.description !== undefined) data.description = body.description || null;

    const issue = await prisma.issue.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Failed to update issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
