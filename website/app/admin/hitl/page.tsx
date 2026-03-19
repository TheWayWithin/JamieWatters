'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface HitlItem {
  id: string;
  tid: string | null;
  description: string;
  type: string;
  priority: string;
  requestingAgent: string | null;
  project: string | null;
  waitingSince: string;
  blocks: string | null;
  status: string;
  outcome: string | null;
  resolvedAt: string | null;
  resolvedNotes: string | null;
}

function formatWaitTime(since: string): string {
  const ms = Date.now() - new Date(since).getTime();
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return `${days}d ${remainingHours}h`;
  return `${hours}h`;
}

function waitTimeColor(since: string): string {
  const hours = (Date.now() - new Date(since).getTime()) / 3_600_000;
  if (hours > 120) return 'text-red-400'; // >5d
  if (hours > 48) return 'text-amber-400'; // >48h
  return 'text-text-secondary';
}

function priorityBorder(p: string): string {
  if (p === 'P0') return 'border-l-4 border-red-500';
  if (p === 'P1') return 'border-l-4 border-amber-500';
  return 'border-l-4 border-border-subtle';
}

const OUTCOMES = [
  { value: 'approved', label: 'Approved' },
  { value: 'approved_with_changes', label: 'Approved with changes' },
  { value: 'rework_requested', label: 'Rework requested' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'rejected', label: 'Rejected' },
];

export default function HITLQueuePage() {
  const [items, setItems] = useState<HitlItem[]>([]);
  const [resolved, setResolved] = useState<HitlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveOutcome, setResolveOutcome] = useState('approved');
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const [openRes, resolvedRes] = await Promise.all([
        fetch('/api/admin/hitl?status=open'),
        fetch('/api/admin/hitl?status=resolved'),
      ]);
      if (!openRes.ok) throw new Error('Failed to load');
      const openData = await openRes.json();
      const resolvedData = resolvedRes.ok ? await resolvedRes.json() : [];

      setItems(Array.isArray(openData) ? openData : []);

      // Show only today's resolved
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayResolved = (Array.isArray(resolvedData) ? resolvedData : []).filter(
        (r: HitlItem) => r.resolvedAt && new Date(r.resolvedAt) >= todayStart
      );
      setResolved(todayResolved);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 30_000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  const handleResolve = async () => {
    if (!resolveId) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/admin/hitl/${resolveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: resolveOutcome, notes: resolveNotes }),
      });
      if (!res.ok) throw new Error('Failed to resolve');
      setResolveId(null);
      setResolveOutcome('approved');
      setResolveNotes('');
      fetchItems();
    } catch {
      setError('Failed to resolve item');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-text-secondary">Loading HITL queue...</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-display-sm font-bold text-text-primary">HITL Queue</h1>
          {items.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white min-w-[22px]">
              {items.length}
            </span>
          )}
        </div>
        <button onClick={fetchItems} className="text-body-sm text-text-secondary hover:text-text-primary">Refresh</button>
      </div>

      {error && <p className="text-red-400 text-body-sm">{error}</p>}

      {/* Open Items */}
      {items.length === 0 ? (
        <div className="bg-bg-surface border border-border-default rounded-lg p-8 text-center">
          <p className="text-text-secondary">Nothing waiting on Jamie. All clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`bg-bg-surface border border-border-default rounded-lg p-4 ${priorityBorder(item.priority)}`}>
              {/* Desktop layout */}
              <div className="hidden sm:flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold ${item.priority === 'P0' ? 'text-red-400' : item.priority === 'P1' ? 'text-amber-400' : 'text-text-secondary'}`}>
                      {item.priority}
                    </span>
                    {item.tid && <span className="text-body-sm font-mono text-text-secondary">{item.tid}</span>}
                    <span className="text-body text-text-primary">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-text-secondary flex-wrap">
                    <span className="capitalize">{item.type.replace(/_/g, ' ')}</span>
                    {item.requestingAgent && <span>From: {item.requestingAgent}</span>}
                    {item.project && <span>Project: {item.project}</span>}
                    {item.blocks && <span className="text-red-400">Blocks: {item.blocks}</span>}
                    <span className={waitTimeColor(item.waitingSince)}>
                      Waiting: {formatWaitTime(item.waitingSince)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setResolveId(item.id); setResolveOutcome('approved'); setResolveNotes(''); }}
                  className="shrink-0 px-4 py-2 bg-brand-primary text-white text-body-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  Resolve
                </button>
              </div>

              {/* Mobile layout */}
              <div className="sm:hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold ${item.priority === 'P0' ? 'text-red-400' : item.priority === 'P1' ? 'text-amber-400' : 'text-text-secondary'}`}>
                    {item.priority}
                  </span>
                  {item.tid && <span className="text-body-sm font-mono text-text-secondary">{item.tid}</span>}
                  <span className={`ml-auto ${waitTimeColor(item.waitingSince)} text-[11px]`}>
                    {formatWaitTime(item.waitingSince)}
                  </span>
                </div>
                <p className="text-body-sm text-text-primary mb-2">{item.description}</p>
                <div className="flex items-center gap-2 text-[11px] text-text-secondary flex-wrap mb-3">
                  <span className="capitalize">{item.type.replace(/_/g, ' ')}</span>
                  {item.requestingAgent && <span>• {item.requestingAgent}</span>}
                  {item.project && <span>• {item.project}</span>}
                </div>
                <button
                  onClick={() => { setResolveId(item.id); setResolveOutcome('approved'); setResolveNotes(''); }}
                  className="w-full py-3 bg-brand-primary text-white text-body-sm font-medium rounded-md hover:opacity-90"
                  style={{ minHeight: '44px' }}
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Dialog */}
      {resolveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-bg-surface border border-border-default rounded-lg p-6 w-full max-w-md">
            <h3 className="text-body font-semibold text-text-primary mb-4">Resolve HITL Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-1">Outcome</label>
                <select
                  value={resolveOutcome}
                  onChange={(e) => setResolveOutcome(e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary"
                >
                  {OUTCOMES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-1">Notes (optional)</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary resize-none"
                  placeholder="Any notes about this resolution..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setResolveId(null)}
                  className="flex-1 py-2 text-body-sm text-text-secondary border border-border-default rounded-md hover:bg-bg-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolving}
                  className="flex-1 py-2 text-body-sm text-white bg-brand-primary rounded-md hover:opacity-90 disabled:opacity-50"
                  style={{ minHeight: '44px' }}
                >
                  {resolving ? 'Resolving...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Today */}
      {resolved.length > 0 && (
        <section className="bg-bg-surface border border-border-default rounded-lg p-5">
          <h2 className="text-body font-semibold text-text-primary mb-4">Resolved Today</h2>
          <div className="space-y-2">
            {resolved.map((item) => (
              <div key={item.id} className="flex items-start gap-3 bg-bg-primary rounded-md p-3 opacity-70">
                <span className="text-green-400 mt-0.5">✓</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {item.tid && <span className="text-body-sm font-mono text-text-secondary">{item.tid}</span>}
                    <span className="text-body-sm text-text-primary">{item.description}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {item.outcome?.replace(/_/g, ' ')} {item.resolvedNotes && `— ${item.resolvedNotes}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
