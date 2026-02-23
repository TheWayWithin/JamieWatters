'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MetricCard from './MetricCard';
import PriorityList from './PriorityList';
import LiveIndicator from './LiveIndicator';
import { usePolling } from './hooks/usePolling';
import type { OverviewMetrics, ActivityItem } from './types';

const CATEGORY_ICONS: Record<string, string> = {
  task: '\uD83D\uDCCB',
  sync: '\uD83D\uDD04',
  deploy: '\uD83D\uDE80',
  build: '\uD83D\uDD28',
  error: '\u274C',
  schedule: '\u23F0',
  system: '\u2699\uFE0F',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-text-tertiary' },
  in_progress: { label: 'In Progress', color: 'bg-brand-primary' },
  review: { label: 'Review', color: 'bg-warning' },
  done: { label: 'Done', color: 'bg-success' },
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

async function fetchOverview(): Promise<OverviewMetrics> {
  const res = await fetch('/api/admin/overview', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function OverviewTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { data: metrics, loading, error, lastUpdated, refresh, fetching } = usePolling<OverviewMetrics>({
    fetchFn: fetchOverview,
    interval: 60_000,
  });

  const hasCritical = (metrics?.criticalIssueCount ?? 0) > 0;

  const switchToIssuesTab = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'issues');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  if (error && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-error">Failed to load overview: {error}</p>
        <button
          onClick={refresh}
          className="mt-3 rounded-md bg-brand-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalStatusTasks = metrics
    ? metrics.tasksByStatus.backlog +
      metrics.tasksByStatus.in_progress +
      metrics.tasksByStatus.review +
      metrics.tasksByStatus.done
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header with live indicator */}
      <div className="flex items-center justify-end">
        <LiveIndicator lastUpdated={lastUpdated} fetching={fetching} onRefresh={refresh} />
      </div>

      {/* Critical issues alert */}
      {hasCritical && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <span className="mt-0.5 text-lg">{'\uD83D\uDEA8'}</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-body-sm font-semibold text-red-500">
              {metrics!.criticalIssueCount} Critical Issue{metrics!.criticalIssueCount !== 1 ? 's' : ''}
            </h4>
            <ul className="mt-1 space-y-0.5">
              {metrics!.criticalIssues?.map((issue) => (
                <li key={issue.id} className="text-body-xs text-red-400">{issue.title}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={switchToIssuesTab}
            className="shrink-0 rounded-md bg-red-500 px-3 py-1.5 text-body-xs font-medium text-white hover:bg-red-600"
          >
            View Issues
          </button>
        </div>
      )}

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={metrics?.totalTasks ?? 0}
          icon={<span>{'\uD83D\uDCCB'}</span>}
          subtitle={`${metrics?.completedTasks ?? 0} completed`}
          loading={loading}
        />
        <MetricCard
          title="Active Projects"
          value={metrics?.activeProjects ?? 0}
          icon={<span>{'\uD83D\uDCE6'}</span>}
          subtitle={`${metrics?.totalProjects ?? 0} total`}
          loading={loading}
        />
        <MetricCard
          title="Open Issues"
          value={metrics?.openIssueCount ?? 0}
          icon={<span>{'\u26A0\uFE0F'}</span>}
          subtitle={hasCritical ? `${metrics!.criticalIssueCount} critical` : 'none critical'}
          loading={loading}
          className={hasCritical ? 'border-red-500/30' : ''}
        />
        <MetricCard
          title="Activity (24h)"
          value={metrics?.recentActivityCount ?? 0}
          icon={<span>{'\u26A1'}</span>}
          subtitle="events"
          loading={loading}
        />
      </div>

      {/* Row 1b: Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Goals"
          value={metrics?.goalsSummary?.total ?? 0}
          icon={<span>{'\uD83C\uDFAF'}</span>}
          subtitle={`${metrics?.goalsSummary?.onTrack ?? 0} on track`}
          loading={loading}
        />
        <MetricCard
          title="Goals At Risk"
          value={metrics?.goalsSummary?.atRisk ?? 0}
          icon={<span>{'\u26A0\uFE0F'}</span>}
          subtitle={`${metrics?.goalsSummary?.achieved ?? 0} achieved`}
          loading={loading}
          className={(metrics?.goalsSummary?.atRisk ?? 0) > 0 ? 'border-orange-500/30' : ''}
        />
        <MetricCard
          title="Agents"
          value={metrics?.agentsSummary?.total ?? 0}
          icon={<span>{'\uD83E\uDD16'}</span>}
          subtitle={`${metrics?.agentsSummary?.active ?? 0} active now`}
          loading={loading}
        />
        <MetricCard
          title="Scheduled Jobs"
          value={metrics?.scheduledTaskCount ?? 0}
          icon={<span>{'\u23F0'}</span>}
          subtitle="active"
          loading={loading}
        />
      </div>

      {/* Row 2: Priority List + Status Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4">
          <h3 className="text-title-sm font-semibold text-text-primary">Top Priorities</h3>
          <div className="mt-3">
            <PriorityList items={metrics?.topPriorities ?? []} loading={loading} />
          </div>
        </div>

        <div className="rounded-lg border border-border-default bg-bg-surface p-4">
          <h3 className="text-title-sm font-semibold text-text-primary">Task Distribution</h3>
          <div className="mt-4">
            {loading ? (
              <div className="h-6 w-full animate-pulse rounded-full bg-border-subtle" />
            ) : totalStatusTasks > 0 ? (
              <div className="flex h-6 overflow-hidden rounded-full">
                {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((key) => {
                  const count = metrics?.tasksByStatus[key as keyof typeof metrics.tasksByStatus] ?? 0;
                  const pct = (count / totalStatusTasks) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={key}
                      className={`${STATUS_CONFIG[key].color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                      title={`${STATUS_CONFIG[key].label}: ${count}`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-6 w-full rounded-full bg-border-subtle" />
            )}
            <div className="mt-3 flex flex-wrap gap-4">
              {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`inline-block h-3 w-3 rounded-full ${STATUS_CONFIG[key].color}`} />
                  <span className="text-body-xs text-text-secondary">{STATUS_CONFIG[key].label}</span>
                  <span className="text-body-xs font-medium text-text-primary">
                    {metrics?.tasksByStatus[key as keyof typeof metrics.tasksByStatus] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity */}
      <div className="rounded-lg border border-border-default bg-bg-surface p-4">
        <h3 className="text-title-sm font-semibold text-text-primary">Recent Activity</h3>
        <div className="mt-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-pulse rounded bg-border-subtle" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-border-subtle" />
                </div>
              ))}
            </div>
          ) : (metrics?.recentActivity.length ?? 0) === 0 ? (
            <p className="py-4 text-center text-body-sm text-text-tertiary">No recent activity</p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {metrics?.recentActivity.map((activity: ActivityItem) => (
                <li key={activity.id} className="flex items-start gap-3 py-2.5">
                  <span className="mt-0.5 text-sm">{CATEGORY_ICONS[activity.category] ?? '\uD83D\uDD35'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm text-text-primary">{activity.action}</p>
                    {activity.details && (
                      <p className="mt-0.5 line-clamp-1 text-body-xs text-text-tertiary">{activity.details}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-body-xs text-text-tertiary">
                    {formatRelativeTime(activity.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
