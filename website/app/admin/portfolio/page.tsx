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

interface ProgramGroup {
  name: string;
  projects: ProjectRow[];
  healthSummary: { green: number; amber: number; red: number; unknown: number };
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
  const [viewMode, setViewMode] = useState<'program' | 'flat'>('program');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [collapsedPrograms, setCollapsedPrograms] = useState<Set<string>>(new Set());

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
    .filter((p) => !filterHealth || p.health === filterHealth);

  // Group by program
  const programGroups: ProgramGroup[] = (() => {
    const map = new Map<string, ProjectRow[]>();
    for (const p of filtered) {
      const prog = p.program || 'Ungrouped';
      if (!map.has(prog)) map.set(prog, []);
      map.get(prog)!.push(p);
    }
    const groups: ProgramGroup[] = [];
    for (const [name, projs] of map) {
      const healthSummary = { green: 0, amber: 0, red: 0, unknown: 0 };
      for (const p of projs) {
        if (p.health === 'green') healthSummary.green++;
        else if (p.health === 'amber') healthSummary.amber++;
        else if (p.health === 'red') healthSummary.red++;
        else healthSummary.unknown++;
      }
      // Sort projects within program: NOW > NEXT > LATER
      const tierOrder: Record<string, number> = { NOW: 0, NEXT: 1, LATER: 2 };
      projs.sort((a, b) => (tierOrder[a.tier || ''] ?? 9) - (tierOrder[b.tier || ''] ?? 9));
      groups.push({ name, projects: projs, healthSummary });
    }
    // Sort programs: put Ungrouped last
    groups.sort((a, b) => {
      if (a.name === 'Ungrouped') return 1;
      if (b.name === 'Ungrouped') return -1;
      return a.name.localeCompare(b.name);
    });
    return groups;
  })();

  const toggleProgram = (name: string) => {
    setCollapsedPrograms((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-text-secondary">Loading portfolio...</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-display-sm font-bold text-text-primary">Portfolio</h1>
        <div className="flex gap-2">
          <button onClick={() => setViewMode(viewMode === 'program' ? 'flat' : 'program')}
            className="text-body-sm text-text-secondary hover:text-text-primary px-3 py-1.5 rounded border border-border-default">
            {viewMode === 'program' ? 'Flat view' : 'Group by program'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1">
          {['', 'NOW', 'NEXT', 'LATER'].map((t) => (
            <button key={t} onClick={() => setFilterTier(t)}
              className={`px-3 py-1.5 text-body-sm rounded-md ${
                filterTier === t ? 'bg-brand-primary text-white' : 'bg-bg-surface text-text-secondary hover:text-text-primary'
              }`}>
              {t || 'All'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['', 'green', 'amber', 'red'].map((h) => (
            <button key={h} onClick={() => setFilterHealth(h)}
              className={`px-3 py-1.5 text-body-sm rounded-md flex items-center gap-1.5 ${
                filterHealth === h ? 'bg-bg-surface ring-1 ring-brand-primary text-text-primary' : 'bg-bg-surface text-text-secondary hover:text-text-primary'
              }`}>
              {h && <span className={`w-2 h-2 rounded-full ${healthDot(h)}`} />}
              {h || 'All'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-bg-surface border border-border-default rounded-lg p-8 text-center">
          <p className="text-text-secondary">No projects match filters.</p>
        </div>
      ) : viewMode === 'program' ? (
        /* ==================== PROGRAM VIEW ==================== */
        <div className="space-y-4">
          {programGroups.map((group) => {
            const isCollapsed = collapsedPrograms.has(group.name);
            return (
              <section key={group.name} className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
                {/* Program header */}
                <button onClick={() => toggleProgram(group.name)}
                  className="w-full px-5 py-3 border-b border-border-subtle flex items-center justify-between hover:bg-bg-primary transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-body font-semibold text-text-primary">{group.name}</span>
                    <span className="text-[11px] text-text-secondary">{group.projects.length} project{group.projects.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Health summary dots */}
                    <div className="flex gap-1.5">
                      {group.healthSummary.green > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-green-400">
                          <span className="w-2 h-2 rounded-full bg-green-500" />{group.healthSummary.green}
                        </span>
                      )}
                      {group.healthSummary.amber > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />{group.healthSummary.amber}
                        </span>
                      )}
                      {group.healthSummary.red > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500" />{group.healthSummary.red}
                        </span>
                      )}
                    </div>
                    <span className="text-text-secondary text-sm transition-transform" style={{
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    }}>&#9660;</span>
                  </div>
                </button>

                {/* Projects within program */}
                {!isCollapsed && (
                  <div className="divide-y divide-border-subtle">
                    {group.projects.map((p) => {
                      const kd = killDateStyle(p.killDate);
                      const isExpanded = expanded === p.id;
                      return (
                        <div key={p.id}>
                          <div className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-bg-primary cursor-pointer transition-colors"
                            onClick={() => setExpanded(isExpanded ? null : p.id)}>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${healthDot(p.health)}`} />
                              <span className="text-body-sm font-medium text-text-primary truncate">{p.name}</span>
                              {p.tier && (
                                <span className={`text-[10px] font-bold shrink-0 ${
                                  p.tier === 'NOW' ? 'text-green-400' : p.tier === 'NEXT' ? 'text-amber-400' : 'text-text-secondary'
                                }`}>{p.tier}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 shrink-0 text-body-sm">
                              <span className="text-text-secondary hidden sm:inline">{p.currentPhase || p.status || '—'}</span>
                              <span className="text-text-secondary hidden md:inline">{p.progress || '—'}</span>
                              <span className={`hidden lg:inline ${kd.className}`}>{kd.text}</span>
                              {p.blocker && <span className="text-red-400 text-[10px] hidden lg:inline">blocked</span>}
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-5 py-4 bg-bg-primary border-t border-border-subtle">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-body-sm">
                                <div><span className="text-text-secondary block text-[11px]">Key Result</span>{p.keyResult || '—'}</div>
                                <div><span className="text-text-secondary block text-[11px]">Next Proof Point</span>{p.nextProofPoint || '—'}</div>
                                <div><span className="text-text-secondary block text-[11px]">Stage</span><span className="capitalize">{p.currentPhase || p.status || '—'}</span></div>
                                <div><span className="text-text-secondary block text-[11px]">Kill Date</span><span className={kd.className}>{kd.text}</span></div>
                                {p.blocker && (
                                  <div className="col-span-2 sm:col-span-4">
                                    <span className="text-text-secondary block text-[11px]">Blocker</span>
                                    <span className="text-red-400">{p.blocker}</span>
                                  </div>
                                )}
                                <div className="col-span-2 sm:col-span-4">
                                  <span className="text-text-secondary block text-[11px]">Description</span>
                                  <span className="text-text-primary">{p.description}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        /* ==================== FLAT VIEW ==================== */
        <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary text-left">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Program</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Tier</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Stage</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Progress</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Kill Date</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Blocker</th>
                </tr>
              </thead>
              <tbody>
                {filtered.sort((a, b) => {
                  const tierOrder: Record<string, number> = { NOW: 0, NEXT: 1, LATER: 2 };
                  return (tierOrder[a.tier || ''] ?? 9) - (tierOrder[b.tier || ''] ?? 9);
                }).map((p) => {
                  const kd = killDateStyle(p.killDate);
                  return (
                    <tr key={p.id}
                      className="border-b border-border-subtle hover:bg-bg-primary cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${healthDot(p.health)}`} />
                          <span className="text-text-primary font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-text-secondary">{p.program || '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-[11px] font-bold ${
                          p.tier === 'NOW' ? 'text-green-400' : p.tier === 'NEXT' ? 'text-amber-400' : 'text-text-secondary'
                        }`}>{p.tier || '—'}</span>
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

          {/* Expanded detail */}
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
