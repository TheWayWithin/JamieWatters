'use client';

import MetricCard from './MetricCard';
import AgentCard from './AgentCard';
import CronScheduleGrid from './CronScheduleGrid';
import LiveIndicator from './LiveIndicator';
import { usePolling } from './hooks/usePolling';
import type { AgentsResponse } from './types';

async function fetchAgents(): Promise<AgentsResponse> {
  const res = await fetch('/api/admin/agents', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function AgentsTab() {
  const { data, loading, error, lastUpdated, refresh, fetching } = usePolling<AgentsResponse>({
    fetchFn: fetchAgents,
    interval: 15_000,
  });

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-error">Failed to load agents: {error}</p>
        <button
          onClick={refresh}
          className="mt-3 rounded-md bg-brand-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-end">
        <LiveIndicator lastUpdated={lastUpdated} fetching={fetching} onRefresh={refresh} />
      </div>

      {/* Summary MetricCards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          title="Total Agents"
          value={data?.stats.totalAgents ?? 0}
          icon={<span>{'\uD83E\uDD16'}</span>}
          loading={loading}
        />
        <MetricCard
          title="Active Now"
          value={data?.stats.activeAgents ?? 0}
          icon={<span>{'\uD83D\uDFE2'}</span>}
          loading={loading}
          className={data?.stats.activeAgents ? 'border-green-500/30' : ''}
        />
        <MetricCard
          title="Tasks This Week"
          value={data?.stats.totalTasksThisWeek ?? 0}
          icon={<span>{'\u26A1'}</span>}
          loading={loading}
        />
      </div>

      {/* Agent Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border-default bg-bg-surface" />
          ))}
        </div>
      ) : (data?.agents.length ?? 0) === 0 ? (
        <div className="py-12 text-center text-body-sm text-text-tertiary">
          No agents registered yet. Agents appear when they run tasks.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data!.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Cron Schedule */}
      <div className="rounded-lg border border-border-default bg-bg-surface p-4">
        <h3 className="text-title-sm font-semibold text-text-primary">
          Scheduled Tasks
        </h3>
        <div className="mt-3">
          <CronScheduleGrid
            schedules={data?.schedules ?? []}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
