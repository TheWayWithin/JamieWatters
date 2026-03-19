'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  projectId: string | null;
  program: string | null;
  keyResult: string | null;
  tier: string | null;
  health: string | null;
  killDate: string | null;
  nextProofPoint: string | null;
  progress: string | null;
  blocker: string | null;
  mrr: number;
  currentPhase: string | null;
}

function healthDot(h: string | null): string {
  if (h === 'green') return 'bg-green-500';
  if (h === 'amber') return 'bg-amber-500';
  if (h === 'red') return 'bg-red-500';
  return 'bg-gray-500';
}

function killDateStyle(kd: string | null): { text: string; className: string } {
  if (!kd) return { text: '—', className: 'text-text-secondary' };
  const days = Math.ceil((new Date(kd).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: 'text-red-400 font-bold' };
  if (days < 7) return { text: `${days}d`, className: 'text-red-400' };
  if (days < 30) return { text: `${days}d`, className: 'text-amber-400' };
  return { text: `${days}d`, className: 'text-text-secondary' };
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState('');
  const [filterHealth, setFilterHealth] = useState('');
  const [sortField, setSortField] = useState<'name' | 'tier' | 'killDate'>('tier');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/projects');
      if (!res.ok) return;
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = projects
    .filter((p) => !filterTier || p.tier === filterTier)
    .filter((p) => !filterHealth || p.health === filterHealth)
    .sort((a, b) => {
      const tierOrder: Record<string, number> = { NOW: 0, NEXT: 1, LATER: 2 };
      if (sortField === 'tier') return (tierOrder[a.tier || ''] ?? 9) - (tierOrder[b.tier || ''] ?? 9);
      if (sortField === 'killDate') {
        const aDate = a.killDate ? new Date(a.killDate).getTime() : Infinity;
        const bDate = b.killDate ? new Date(b.killDate).getTime() : Infinity;
        return aDate - bDate;
      }
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-text-secondary">Loading portfolio...</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <h1 className="text-display-sm font-bold text-text-primary">Portfolio</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1">
          {['', 'NOW', 'NEXT', 'LATER'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1.5 text-body-sm rounded-md ${
                filterTier === t ? 'bg-brand-primary text-white' : 'bg-bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {t || 'All'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['', 'green', 'amber', 'red'].map((h) => (
            <button
              key={h}
              onClick={() => setFilterHealth(h)}
              className={`px-3 py-1.5 text-body-sm rounded-md flex items-center gap-1.5 ${
                filterHealth === h ? 'bg-bg-surface ring-1 ring-brand-primary text-text-primary' : 'bg-bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {h && <span className={`w-2 h-2 rounded-full ${healthDot(h)}`} />}
              {h || 'All'}
            </button>
          ))}
        </div>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as 'name' | 'tier' | 'killDate')}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary"
        >
          <option value="tier">Sort: Tier</option>
          <option value="killDate">Sort: Kill date</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-bg-surface border border-border-default rounded-lg p-8 text-center">
          <p className="text-text-secondary">No projects match filters. Awaiting first sync.</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary text-left">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Tier</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Health</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Stage</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Progress</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Kill Date</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Blocker</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const kd = killDateStyle(p.killDate);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border-subtle hover:bg-bg-primary cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${healthDot(p.health)}`} />
                          <span className="text-text-primary font-medium">{p.name}</span>
                        </div>
                        {/* Mobile inline info */}
                        <div className="sm:hidden flex gap-2 mt-1 text-[11px] text-text-secondary">
                          {p.tier && <span>{p.tier}</span>}
                          {p.currentPhase && <span>• {p.currentPhase}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-[11px] font-bold ${
                          p.tier === 'NOW' ? 'text-green-400' : p.tier === 'NEXT' ? 'text-amber-400' : 'text-text-secondary'
                        }`}>{p.tier || '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`w-2 h-2 rounded-full inline-block ${healthDot(p.health)}`} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-secondary capitalize">{p.currentPhase || p.status || '—'}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{p.progress || '—'}</td>
                      <td className={`px-4 py-3 hidden lg:table-cell ${kd.className}`}>{kd.text}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-text-secondary">{p.blocker || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded row detail */}
          {expanded && (() => {
            const p = filtered.find((pr) => pr.id === expanded);
            if (!p) return null;
            const kd = killDateStyle(p.killDate);
            return (
              <div className="px-4 py-4 border-t border-border-subtle bg-bg-primary">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-body-sm">
                  <div><span className="text-text-secondary block text-[11px]">Program</span>{p.program || '—'}</div>
                  <div><span className="text-text-secondary block text-[11px]">Key Result</span>{p.keyResult || '—'}</div>
                  <div><span className="text-text-secondary block text-[11px]">Next Proof Point</span>{p.nextProofPoint || '—'}</div>
                  <div><span className="text-text-secondary block text-[11px]">Kill Date</span><span className={kd.className}>{kd.text}</span></div>
                  {p.blocker && (
                    <div className="col-span-2 sm:col-span-4">
                      <span className="text-text-secondary block text-[11px]">Blocker</span>
                      <span className="text-red-400">{p.blocker}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
