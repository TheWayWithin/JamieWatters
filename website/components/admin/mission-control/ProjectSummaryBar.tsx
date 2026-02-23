'use client';

import type { ProjectItem } from './types';

interface ProjectSummaryBarProps {
  projects: ProjectItem[];
  loading?: boolean;
}

const ACTIVE_STATUSES = ['LIVE', 'ACTIVE', 'BUILD', 'MVP'];
const PAUSED_STATUSES = ['PAUSED'];
const COMPLETED_STATUSES = ['ARCHIVED'];

export default function ProjectSummaryBar({ projects, loading = false }: ProjectSummaryBarProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-4 rounded-lg border border-border-default bg-bg-surface p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-28 animate-pulse rounded bg-border-subtle" />
        ))}
      </div>
    );
  }

  const active = projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length;
  const paused = projects.filter((p) => PAUSED_STATUSES.includes(p.status)).length;
  const completed = projects.filter((p) => COMPLETED_STATUSES.includes(p.status)).length;
  const totalMrr = projects.reduce((sum, p) => sum + p.mrr, 0);

  return (
    <div className="flex flex-wrap gap-6 rounded-lg border border-border-default bg-bg-surface px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-body-xs text-text-tertiary">Total</span>
        <span className="text-body-sm font-semibold text-text-primary">{projects.length}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-success" />
        <span className="text-body-xs text-text-tertiary">Active</span>
        <span className="text-body-sm font-semibold text-text-primary">{active}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-warning" />
        <span className="text-body-xs text-text-tertiary">Paused</span>
        <span className="text-body-sm font-semibold text-text-primary">{paused}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />
        <span className="text-body-xs text-text-tertiary">Completed</span>
        <span className="text-body-sm font-semibold text-text-primary">{completed}</span>
      </div>
      {totalMrr > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-body-xs text-text-tertiary">MRR</span>
          <span className="text-body-sm font-semibold text-text-primary">
            ${totalMrr.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
