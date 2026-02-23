'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProjectSummaryBar from './ProjectSummaryBar';
import EnhancedProjectCard from './EnhancedProjectCard';
import LiveIndicator from './LiveIndicator';
import { usePolling } from './hooks/usePolling';
import type { ProjectItem } from './types';

const STATUS_FILTERS = ['All', 'Active', 'Paused', 'Completed'];
const ACTIVE_STATUSES = ['LIVE', 'ACTIVE', 'BUILD', 'MVP', 'BETA', 'DESIGN', 'PLANNING', 'RESEARCH'];
const PAUSED_STATUSES = ['PAUSED'];
const COMPLETED_STATUSES = ['ARCHIVED'];

async function fetchProjects(): Promise<ProjectItem[]> {
  const res = await fetch('/api/admin/projects', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export default function ProjectsTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState('All');

  const { data: projects, loading, error, lastUpdated, refresh, fetching } = usePolling<ProjectItem[]>({
    fetchFn: fetchProjects,
    interval: 120_000,
  });

  const allProjects = projects ?? [];

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'All') return allProjects;
    if (statusFilter === 'Active') return allProjects.filter((p) => ACTIVE_STATUSES.includes(p.status));
    if (statusFilter === 'Paused') return allProjects.filter((p) => PAUSED_STATUSES.includes(p.status));
    if (statusFilter === 'Completed') return allProjects.filter((p) => COMPLETED_STATUSES.includes(p.status));
    return allProjects;
  }, [allProjects, statusFilter]);

  const handleViewTasks = useCallback(
    (projectId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'kanban');
      params.set('project', projectId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  if (error && allProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-error">Failed to load projects: {error}</p>
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

      <ProjectSummaryBar projects={allProjects} loading={loading} />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`rounded-full px-3 py-1 text-body-xs font-medium transition-colors ${
              statusFilter === filter
                ? 'bg-brand-primary text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg border border-border-default bg-bg-surface" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-body-sm text-text-tertiary">
          {allProjects.length === 0 ? 'No projects found.' : 'No projects match this filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <EnhancedProjectCard key={project.id} project={project} onViewTasks={handleViewTasks} />
          ))}
        </div>
      )}
    </div>
  );
}
