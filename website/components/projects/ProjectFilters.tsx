'use client';

import { useState } from 'react';
import { ProjectStatus, ProjectPhase } from '@prisma/client';

interface ProjectFiltersProps {
  onFilterChange: (filters: ProjectFilterState) => void;
  initialFilters?: ProjectFilterState;
  projectCounts?: {
    total: number;
    byStatus: Record<string, number>;
  };
}

export interface ProjectFilterState {
  status: ProjectStatus | 'ALL';
  sort: 'recent' | 'launched' | 'name';
}

const statusLabels: Record<ProjectStatus | 'ALL', string> = {
  ALL: 'All Projects',
  RESEARCH: 'Research',
  DESIGN: 'Design',
  PLANNING: 'Planning',
  BUILD: 'Building',
  BETA: 'Beta',
  MVP: 'MVP',
  LIVE: 'Live',
  ARCHIVED: 'Archived',
  ACTIVE: 'Active',
};

const statusColors: Record<ProjectStatus, string> = {
  RESEARCH: 'bg-purple-500',
  DESIGN: 'bg-indigo-500',
  PLANNING: 'bg-yellow-500',
  BUILD: 'bg-orange-500',
  BETA: 'bg-blue-500',
  MVP: 'bg-cyan-500',
  LIVE: 'bg-green-500',
  ARCHIVED: 'bg-gray-500',
  ACTIVE: 'bg-green-500',
};

const sortOptions = [
  { value: 'recent', label: 'Recent Activity' },
  { value: 'launched', label: 'Launch Date' },
  { value: 'name', label: 'Name (A-Z)' },
] as const;

export function ProjectFilters({
  onFilterChange,
  initialFilters = { status: 'ALL', sort: 'recent' },
  projectCounts,
}: ProjectFiltersProps) {
  const [filters, setFilters] = useState<ProjectFilterState>(initialFilters);

  const handleStatusChange = (status: ProjectStatus | 'ALL') => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sort: 'recent' | 'launched' | 'name') => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Filter to show only relevant statuses (ones with projects)
  const activeStatuses: (ProjectStatus | 'ALL')[] = ['ALL'];
  if (projectCounts?.byStatus) {
    Object.entries(projectCounts.byStatus).forEach(([status, count]) => {
      if (count > 0) {
        activeStatuses.push(status as ProjectStatus);
      }
    });
  } else {
    // Default to showing common statuses
    activeStatuses.push('LIVE', 'MVP', 'BUILD', 'ARCHIVED');
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {activeStatuses.map((status) => {
          const isActive = filters.status === status;
          const count = status === 'ALL'
            ? projectCounts?.total
            : projectCounts?.byStatus?.[status];

          return (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-full transition-all
                ${
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'bg-bg-surface border border-border-default text-text-secondary hover:border-border-emphasis hover:text-text-primary'
                }
              `}
            >
              {status !== 'ALL' && (
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${statusColors[status]}`}
                />
              )}
              {statusLabels[status]}
              {count !== undefined && (
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-text-tertiary">
          Sort by:
        </label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(e) => handleSortChange(e.target.value as typeof filters.sort)}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
