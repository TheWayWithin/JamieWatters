'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface Agent {
  id: string;
  name: string;
  machine: string;
  status: string;
  currentTask: string | null;
  tasksCompleted: number;
  tasksThisWeek: number;
  role: string | null;
  queueSize: number;
  exceptions: number;
  mcDuties: string | null;
  lastActiveAt: string;
}

interface HealthCheck {
  id: string;
  system: string;
  owner: string;
  status: string;
  lastSuccess: string | null;
  expectedInterval: string | null;
}

interface RecurringOp {
  id: string;
  rid: string;
  operation: string;
  owner: string;
  cadence: string;
  lastCompleted: string | null;
  nextDue: string | null;
  status: string;
}

function statusDot(s: string): string {
  switch (s) {
    case 'healthy': case 'green': return 'bg-green-500';
    case 'busy': case 'amber': return 'bg-amber-500';
    case 'error': case 'stalled': case 'red': return 'bg-red-500';
    case 'idle': return 'bg-gray-400';
    default: return 'bg-gray-500';
  }
}

function isOverdue(nextDue: string | null): boolean {
  if (!nextDue) return false;
  return new Date(nextDue) < new Date();
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [health, setHealth] = useState<HealthCheck[]>([]);
  const [recurring, setRecurring] = useState<RecurringOp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [agentRes, healthRes, recurRes] = await Promise.all([
        fetch('/api/admin/agents'),
        fetch('/api/admin/health'),
        fetch('/api/admin/recurring'),
      ]);
      if (agentRes.ok) {
        const data = await agentRes.json();
        setAgents(Array.isArray(data) ? data : data.agents || []);
      }
      if (healthRes.ok) setHealth(await healthRes.json());
      if (recurRes.ok) setRecurring(await recurRes.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-text-secondary">Loading agent operations...</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-text-primary">Agent Operations</h1>
        <button onClick={fetchAll} className="text-body-sm text-text-secondary hover:text-text-primary">Refresh</button>
      </div>

      {/* Agent Cards */}
      {agents.length === 0 ? (
        <div className="bg-bg-surface border border-border-default rounded-lg p-8 text-center">
          <p className="text-text-secondary">No agents registered. Awaiting first sync.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-bg-surface border border-border-default rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-3 h-3 rounded-full ${statusDot(agent.status)}`} />
                <span className="text-body font-semibold text-text-primary">{agent.name}</span>
              </div>
              <div className="space-y-1 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Machine</span>
                  <span className="text-text-primary">{agent.machine}</span>
                </div>
                {agent.role && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Role</span>
                    <span className="text-text-primary">{agent.role}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className="text-text-primary capitalize">{agent.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Current task</span>
                  <span className="text-text-primary truncate ml-2 max-w-[60%] text-right">{agent.currentTask || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Queue</span>
                  <span className="text-text-primary">{agent.queueSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">This week</span>
                  <span className="text-text-primary">{agent.tasksThisWeek} done</span>
                </div>
                {agent.exceptions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Exceptions</span>
                    <span className="text-red-400 font-bold">{agent.exceptions}</span>
                  </div>
                )}
              </div>
              {agent.mcDuties && (
                <p className="text-[11px] text-text-secondary mt-3 border-t border-border-subtle pt-2">{agent.mcDuties}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* System Health */}
      {health.length > 0 && (
        <section className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle">
            <h2 className="text-body font-semibold text-text-primary">System Health</h2>
          </div>
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary text-left">
                <th className="px-4 py-2 font-medium">System</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium hidden sm:table-cell">Owner</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Last Success</th>
              </tr>
            </thead>
            <tbody>
              {health.map((h) => (
                <tr key={h.id} className="border-b border-border-subtle">
                  <td className="px-4 py-2 text-text-primary">{h.system}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1.5 ${
                      h.status === 'green' ? 'text-green-400' :
                      h.status === 'amber' ? 'text-amber-400' :
                      h.status === 'red' ? 'text-red-400' : 'text-text-secondary'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${statusDot(h.status)}`} />
                      {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-text-secondary hidden sm:table-cell">{h.owner}</td>
                  <td className="px-4 py-2 text-text-secondary hidden md:table-cell">
                    {h.lastSuccess ? new Date(h.lastSuccess).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Recurring Ops */}
      {recurring.length > 0 && (
        <section className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle">
            <h2 className="text-body font-semibold text-text-primary">Recurring Operations</h2>
          </div>
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary text-left">
                <th className="px-4 py-2 font-medium">Operation</th>
                <th className="px-4 py-2 font-medium">Owner</th>
                <th className="px-4 py-2 font-medium hidden sm:table-cell">Cadence</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Next Due</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recurring.map((op) => {
                const overdue = isOverdue(op.nextDue);
                return (
                  <tr key={op.id} className={`border-b border-border-subtle ${overdue ? 'bg-red-500/5' : ''}`}>
                    <td className="px-4 py-2 text-text-primary">{op.operation}</td>
                    <td className="px-4 py-2 text-text-secondary">{op.owner}</td>
                    <td className="px-4 py-2 text-text-secondary hidden sm:table-cell">{op.cadence}</td>
                    <td className={`px-4 py-2 hidden md:table-cell ${overdue ? 'text-red-400 font-bold' : 'text-text-secondary'}`}>
                      {op.nextDue ? new Date(op.nextDue).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={overdue ? 'text-red-400' : 'text-text-secondary'}>{overdue ? 'overdue' : op.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
