import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MC_SYNC_DIR = join(homedir(), 'mc-sync');
const PENDING_CHANGES_PATH = join(MC_SYNC_DIR, 'pending-changes.json');

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { outcome, notes } = body;

    if (!outcome) {
      return NextResponse.json({ error: 'outcome is required' }, { status: 400 });
    }

    const validOutcomes = ['approved', 'approved_with_changes', 'rework_requested', 'deferred', 'rejected'];
    if (!validOutcomes.includes(outcome)) {
      return NextResponse.json({ error: `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}` }, { status: 400 });
    }

    const updated = await prisma.hitlItem.update({
      where: { id },
      data: {
        status: 'resolved',
        outcome,
        resolvedNotes: notes || null,
        resolvedAt: new Date(),
      },
    });

    // Write to pending-changes.json for Mini sync script to pick up
    try {
      mkdirSync(MC_SYNC_DIR, { recursive: true });
      let pending: Array<Record<string, unknown>> = [];
      try {
        const existing = readFileSync(PENDING_CHANGES_PATH, 'utf8');
        pending = JSON.parse(existing);
      } catch { /* file doesn't exist yet */ }
      pending.push({
        type: 'hitl_resolved',
        hitlId: id,
        tid: updated.tid,
        outcome,
        notes: notes || null,
        resolvedAt: updated.resolvedAt?.toISOString(),
      });
      writeFileSync(PENDING_CHANGES_PATH, JSON.stringify(pending, null, 2), 'utf8');
    } catch (syncErr) {
      console.error('Failed to write pending-changes.json:', syncErr);
      // Non-blocking — DB update already succeeded
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('HITL resolve error:', error);
    return NextResponse.json({ error: 'Failed to resolve HITL item' }, { status: 500 });
  }
}
