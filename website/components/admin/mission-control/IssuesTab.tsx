'use client';

import { useState, useMemo } from 'react';
import MetricCard from './MetricCard';
import IssueCard from './IssueCard';
import IssueForm from './IssueForm';
import LiveIndicator from './LiveIndicator';
import { usePolling } from './hooks/usePolling';
import type { Issue, IssuesResponse, IssueType } from './types';

const TYPE_FILTERS: { value: IssueType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'approval', label: 'Approvals' },
  { value: 'blocker', label: 'Blockers' },
  { value: 'error', label: 'Errors' },
  { value: 'warning', label: 'Warnings' },
  { value: 'question', label: 'Questions' },
];

const TYPE_ORDER: IssueType[] = ['blocker', 'error', 'warning', 'approval', 'question'];

const TYPE_LABELS: Record<IssueType, string> = {
  blocker: 'Blockers',
  error: 'Errors',
  warning: 'Warnings',
  approval: 'Approvals',
  question: 'Questions',
};

export default function IssuesTab() {
  const [activeType, setActiveType] = useState<IssueType | 'all'>('all');
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchIssues = async (): Promise<IssuesResponse> => {
    const statusParam = showAll ? 'all' : 'open,in_progress';
    const res = await fetch(`/api/admin/issues?status=${statusParam}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const { data, loading, error, lastUpdated, refresh, fetching } = usePolling<IssuesResponse>({
    fetchFn: fetchIssues,
    interval: 30_000,
  });

  // Re-fetch when showAll changes
  const handleShowAllToggle = (val: boolean) => {
    setShowAll(val);
    // The usePolling hook will pick up the new fetchFn on next interval,
    // but we want an immediate refresh
    setTimeout(refresh, 0);
  };

  const filteredIssues = useMemo(() => {
    if (!data) return [];
    if (activeType === 'all') return data.issues;
    return data.issues.filter((i) => i.type === activeType);
  }, [data, activeType]);

  const groupedIssues = useMemo(() => {
    if (activeType !== 'all') return null;
    const groups: Record<string, Issue[]> = {};
    for (const issue of filteredIssues) {
      if (!groups[issue.type]) groups[issue.type] = [];
      groups[issue.type].push(issue);
    }
    return groups;
  }, [filteredIssues, activeType]);

  const criticalCount = data?.counts.bySeverity.critical || 0;
  const highCount = data?.counts.bySeverity.high || 0;
  const mediumCount = data?.counts.bySeverity.medium || 0;
  const lowCount = data?.counts.bySeverity.low || 0;

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-error">Failed to load issues: {error}</p>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Critical"
          value={criticalCount}
          icon={<span className="text-red-500">{'\uD83D\uDD34'}</span>}
          loading={loading}
          className={criticalCount > 0 ? 'border-red-500/30' : ''}
        />
        <MetricCard title="High" value={highCount} icon={<span className="text-orange-500">{'\uD83D\uDFE0'}</span>} loading={loading} />
        <MetricCard title="Medium" value={mediumCount} icon={<span className="text-amber-500">{'\uD83D\uDFE1'}</span>} loading={loading} />
        <MetricCard title="Low" value={lowCount} icon={<span className="text-gray-400">{'\u26AA'}</span>} loading={loading} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveType(f.value)}
              className={`rounded-full px-3 py-1 text-body-xs font-medium transition-colors ${
                activeType === f.value
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="ml-2 flex items-center rounded-full border border-border-default">
            <button
              onClick={() => handleShowAllToggle(false)}
              className={`rounded-l-full px-3 py-1 text-body-xs font-medium ${
                !showAll ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => handleShowAllToggle(true)}
              className={`rounded-r-full px-3 py-1 text-body-xs font-medium ${
                showAll ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-md bg-brand-primary px-3 py-1.5 text-body-sm font-medium text-white hover:bg-brand-primary/90"
        >
          {showForm ? 'Cancel' : '+ Report Issue'}
        </button>
      </div>

      {showForm && (
        <IssueForm
          onSuccess={() => { setShowForm(false); refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-border-default bg-bg-surface" />
          ))}
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="py-16 text-center text-body-sm text-text-tertiary">
          {data && data.counts.total === 0
            ? 'No open issues. Everything is running smoothly.'
            : 'No issues match the current filters.'}
        </div>
      ) : groupedIssues ? (
        <div className="space-y-6">
          {TYPE_ORDER.filter((t) => groupedIssues[t]?.length).map((type) => (
            <div key={type}>
              <h3 className="mb-3 text-body-sm font-semibold text-text-secondary">
                {TYPE_LABELS[type]} ({groupedIssues[type].length})
              </h3>
              <div className="space-y-3">
                {groupedIssues[type].map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onUpdate={refresh} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onUpdate={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
