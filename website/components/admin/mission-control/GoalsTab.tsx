'use client';

import { useState, useMemo } from 'react';
import MetricCard from './MetricCard';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import LiveIndicator from './LiveIndicator';
import { usePolling } from './hooks/usePolling';
import type { Goal } from './types';

const CATEGORIES = ['All', 'Revenue', 'Growth', 'Product', 'Infrastructure'];

async function fetchGoals(): Promise<Goal[]> {
  const res = await fetch('/api/admin/goals', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function GoalsTab() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const { data: goals, loading, error, lastUpdated, refresh, fetching } = usePolling<Goal[]>({
    fetchFn: fetchGoals,
    interval: 120_000,
  });

  const allGoals = goals ?? [];

  const filteredGoals = useMemo(
    () => activeCategory === 'All' ? allGoals : allGoals.filter((g) => g.category === activeCategory),
    [allGoals, activeCategory]
  );

  const onTrackCount = allGoals.filter((g) => g.status === 'on_track').length;
  const atRiskCount = allGoals.filter((g) => g.status === 'at_risk' || g.status === 'behind').length;
  const achievedCount = allGoals.filter((g) => g.status === 'achieved').length;

  if (error && allGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-error">Failed to load goals: {error}</p>
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
      {/* Header with live indicator */}
      <div className="flex items-center justify-end">
        <LiveIndicator lastUpdated={lastUpdated} fetching={fetching} onRefresh={refresh} />
      </div>

      {/* Summary MetricCards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard title="Total Goals" value={allGoals.length} icon={<span>{'\uD83C\uDFAF'}</span>} loading={loading} />
        <MetricCard title="On Track" value={onTrackCount} icon={<span>{'\u2705'}</span>} loading={loading} />
        <MetricCard title="At Risk" value={atRiskCount} icon={<span>{'\u26A0\uFE0F'}</span>} loading={loading} />
        <MetricCard title="Achieved" value={achievedCount} icon={<span>{'\uD83C\uDFC6'}</span>} loading={loading} />
      </div>

      {/* Category filter + Add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-body-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-md bg-brand-primary px-3 py-1.5 text-body-sm font-medium text-white hover:bg-brand-primary/90"
        >
          {showForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {showForm && (
        <GoalForm
          onSuccess={() => { setShowForm(false); refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg border border-border-default bg-bg-surface" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="py-16 text-center text-body-sm text-text-tertiary">
          {allGoals.length === 0
            ? 'No goals defined yet. Add your first strategic target.'
            : 'No goals match this category.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
