'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface CommandData {
  quarterlyKRs: Array<{
    id: string; goalId: string | null; name: string;
    currentValue: number; targetValue: number; unit: string;
    status: string; dueDate: string | null; category: string;
  }>;
  todaysCompletions: Array<{
    id: string; tid: string | null; content: string; owner: string | null;
  }>;
  hitlCount: number;
  hitlP0: Array<{
    id: string; tid: string | null; description: string;
    waitingSince: string; blocks: string | null; requestingAgent: string | null;
  }>;
  projectActivity: Array<{
    id: string; name: string; slug: string; status: string;
    health: string | null; tier: string | null;
    progress: number | null; blocker: string | null;
    updatedAt: string; activeTasks: number;
  }>;
  weeklyScore: Array<{
    id: string; group: string; name: string;
    current: string | null; target: string | null; status: string | null;
  }>;
  blockedCount: number;
  topBlockers: Array<{
    id: string; tid: string | null; content: string;
    blockedBy: string | null; ageDays: number;
  }>;
}

function statusColor(status: string): string {
  switch (status) {
    case 'on_track': case 'ok': case 'healthy': case 'green': return 'text-green-400';
    case 'at_risk': case 'needs_attention': case 'amber': return 'text-amber-400';
    case 'behind': case 'below': case 'red': case 'blocked': return 'text-red-400';
    default: return 'text-text-secondary';
  }
}

function statusDot(status: string): string {
  switch (status) {
    case 'healthy': case 'online': case 'green': return 'bg-green-500';
    case 'busy': case 'waiting_approval': case 'amber': return 'bg-amber-500';
    case 'error': case 'stalled': case 'red': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export default function CommandPage() {
  const [data, setData] = useState<CommandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/command');
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-text-secondary">Loading command view...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-red-400">Error: {error || 'No data'}</p>
        <button onClick={fetchData} className="mt-2 text-brand-primary hover:underline text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-text-primary">Command View</h1>
        <button onClick={fetchData} className="text-body-sm text-text-secondary hover:text-text-primary transition-colors">
          Refresh
        </button>
      </div>

      {/* North Star */}
      <section className="bg-gradient-to-r from-purple-900/20 to-bg-surface border border-purple-500/20 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-purple-400 uppercase tracking-wider mb-1">Guiding Star</p>
            <p className="text-body font-semibold text-text-primary italic">&quot;Truth is the Currency of the Future.&quot;</p>
          </div>
          <div className="flex items-center gap-6 text-body-sm">
            <div className="text-right">
              <p className="text-[11px] text-text-secondary">BHAG 2030</p>
              <p className="text-text-primary font-bold">$10M ARR</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-text-secondary">Q2 2026 Focus</p>
              <p className="text-text-primary font-medium">First $1 Revenue</p>
            </div>
          </div>
        </div>
      </section>

      {/* Q2 Key Results */}
      <section className="bg-bg-surface border border-border-default rounded-lg p-5">
        <h2 className="text-body font-semibold text-text-primary mb-4">Q2 Key Results</h2>
        {data.quarterlyKRs.length === 0 ? (
          <p className="text-body-sm text-text-secondary">No quarterly key results found. Awaiting first sync.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.quarterlyKRs.map((kr) => {
              const pct = kr.targetValue > 0 ? Math.round((kr.currentValue / kr.targetValue) * 100) : 0;
              return (
                <div key={kr.id} className="bg-bg-primary rounded-md p-4 border border-border-subtle">
                  <p className="text-body-sm text-text-secondary truncate">{kr.goalId || kr.category}</p>
                  <p className="text-body font-medium text-text-primary mt-1 truncate">{kr.name}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-body-sm">
                      <span className={statusColor(kr.status)}>{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                      <span className="text-text-secondary">{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 bg-bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          kr.status === 'on_track' ? 'bg-green-500' :
                          kr.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Two-column: HITL + Completions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting on Jamie */}
        <section className="bg-bg-surface border border-border-default rounded-lg p-5 order-first">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-body font-semibold text-text-primary">Waiting on Jamie</h2>
            {data.hitlCount > 0 && (
              <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white min-w-[22px] ${
                data.hitlP0.length > 0 ? 'bg-red-600' : 'bg-amber-600'
              }`}>
                {data.hitlCount}
              </span>
            )}
          </div>
          {data.hitlCount === 0 ? (
            <p className="text-body-sm text-text-secondary">Nothing waiting. All clear.</p>
          ) : (
            <div className="space-y-2">
              {data.hitlP0.map((item) => (
                <a
                  key={item.id}
                  href="/admin/hitl"
                  className="block bg-bg-primary rounded-md p-3 border-l-4 border-red-500 hover:bg-bg-primary/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {item.tid && <span className="text-body-sm font-mono text-text-secondary mr-2">{item.tid}</span>}
                      <span className="text-body-sm text-text-primary">{item.description}</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-400 shrink-0">P0</span>
                  </div>
                  {item.blocks && (
                    <p className="text-[11px] text-red-400 mt-1">Blocks: {item.blocks}</p>
                  )}
                </a>
              ))}
              {data.hitlCount > data.hitlP0.length && (
                <a href="/admin/hitl" className="block text-body-sm text-brand-primary hover:underline">
                  + {data.hitlCount - data.hitlP0.length} more items →
                </a>
              )}
            </div>
          )}
        </section>

        {/* Completed Today */}
        <section className="bg-bg-surface border border-border-default rounded-lg p-5">
          <h2 className="text-body font-semibold text-text-primary mb-4">Completed Today</h2>
          {data.todaysCompletions.length === 0 ? (
            <p className="text-body-sm text-text-secondary">No completions yet today.</p>
          ) : (
            <div className="space-y-2">
              {data.todaysCompletions.map((item) => (
                <div key={item.id} className="flex items-start gap-3 bg-bg-primary rounded-md p-3">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.tid && <span className="text-body-sm font-mono text-text-secondary">{item.tid}</span>}
                      <span className="text-body-sm text-text-primary truncate">{item.content}</span>
                    </div>
                    {item.owner && <p className="text-[11px] text-text-secondary mt-0.5">{item.owner}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Two-column: Agents + Weekly Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AGENT-11 Dev Activity */}
        <section className="bg-bg-surface border border-border-default rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-body font-semibold text-text-primary">AGENT-11</h2>
            </div>
            <span className="text-[11px] text-text-secondary">Claude Code on MacBook</span>
          </div>
          {data.projectActivity.length === 0 ? (
            <p className="text-body-sm text-text-secondary">No projects found. Awaiting first sync.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.projectActivity.map((project) => {
                const healthColor = project.health === 'green' ? 'bg-green-500' :
                  project.health === 'amber' ? 'bg-amber-500' :
                  project.health === 'red' ? 'bg-red-500' : 'bg-gray-500';
                const daysAgo = Math.floor((Date.now() - new Date(project.updatedAt).getTime()) / 86_400_000);
                return (
                  <div key={project.id} className="bg-bg-primary rounded-md p-3 border border-border-subtle">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${healthColor}`} />
                        <span className="text-body-sm font-medium text-text-primary truncate">{project.name}</span>
                      </div>
                      {project.tier && (
                        <span className={`text-[10px] font-bold shrink-0 ${
                          project.tier === 'NOW' ? 'text-green-400' :
                          project.tier === 'NEXT' ? 'text-amber-400' : 'text-text-secondary'
                        }`}>{project.tier}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-1">
                      {project.activeTasks > 0 && (
                        <span>{project.activeTasks} active task{project.activeTasks !== 1 ? 's' : ''}</span>
                      )}
                      {project.progress != null && project.progress > 0 && (
                        <span>{project.progress}%</span>
                      )}
                      <span className={daysAgo > 7 ? 'text-amber-400' : ''}>
                        {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                      </span>
                    </div>
                    {project.blocker && (
                      <p className="text-[10px] text-red-400 mt-1 truncate">Blocked: {project.blocker}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Weekly Scorecard */}
        <section className="bg-bg-surface border border-border-default rounded-lg p-5">
          <h2 className="text-body font-semibold text-text-primary mb-4">Weekly Scorecard</h2>
          {data.weeklyScore.length === 0 ? (
            <p className="text-body-sm text-text-secondary">No metrics data. Awaiting first sync.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {data.weeklyScore.map((metric) => (
                <div key={metric.id} className="bg-bg-primary rounded-md p-3 border border-border-subtle">
                  <p className="text-[11px] text-text-secondary truncate">{metric.name}</p>
                  <p className={`text-lg font-bold mt-1 ${statusColor(metric.status || '')}`}>
                    {metric.current || '—'}
                  </p>
                  {metric.target && (
                    <p className="text-[10px] text-text-secondary">Target: {metric.target}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Blockers */}
      <section className="bg-bg-surface border border-border-default rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-body font-semibold text-text-primary">Blockers</h2>
          {data.blockedCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white min-w-[22px]">
              {data.blockedCount}
            </span>
          )}
        </div>
        {data.blockedCount === 0 ? (
          <p className="text-body-sm text-text-secondary">No blocked tasks. All clear.</p>
        ) : (
          <div className="space-y-2">
            {data.topBlockers.map((item) => (
              <div key={item.id} className="flex items-start justify-between bg-bg-primary rounded-md p-3 border-l-4 border-red-500">
                <div className="min-w-0">
                  {item.tid && <span className="text-body-sm font-mono text-text-secondary mr-2">{item.tid}</span>}
                  <span className="text-body-sm text-text-primary">{item.content}</span>
                  {item.blockedBy && (
                    <p className="text-[11px] text-text-secondary mt-1">Blocked by: {item.blockedBy}</p>
                  )}
                </div>
                <span className={`text-[11px] font-medium shrink-0 ml-2 ${
                  item.ageDays >= 5 ? 'text-red-400' : item.ageDays >= 3 ? 'text-amber-400' : 'text-text-secondary'
                }`}>
                  {item.ageDays}d
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
