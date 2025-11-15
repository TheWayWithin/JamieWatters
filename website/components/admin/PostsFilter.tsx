'use client';

import { useState } from 'react';

export type FilterType = 'all' | 'published' | 'drafts' | 'daily-update' | 'manual' | 'weekly-plan';

interface PostsFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PostsFilter({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: PostsFilterProps) {
  const filters: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: 'All Posts' },
    { value: 'published', label: 'Published' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'daily-update', label: 'Daily Updates' },
    { value: 'manual', label: 'Manual' },
    { value: 'weekly-plan', label: 'Weekly Plans' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentFilter === filter.value
                ? 'bg-brand-primary text-white'
                : 'bg-bg-surface text-text-secondary hover:bg-bg-hover border border-border-default'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts..."
          className="w-full sm:w-64 px-4 py-2 bg-bg-primary border border-border-default rounded-md text-body text-text-primary placeholder:text-text-tertiary focus:border-brand-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
