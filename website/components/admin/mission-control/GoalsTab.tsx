'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import MetricCard from './MetricCard';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import type { Goal } from './types';

const CATEGORIES = ['All', 'Revenue', 'Growth', 'Product', 'Infrastructure'];

export default function GoalsTab() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/goals', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Goal[] = await res.json();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const filteredGoals = useMemo(
    () => activeCategory === 'All' ? goals : goals.filter((g) => g.category === activeCategory),
    [goals, activeCategory]
  );

  const onTrackCount = goals.filter((g) => g.status === 'on_track').length;
  const atRiskCount = goals.filter((g) => g.status === 'at_risk' || g.status === 'behind').length;
  const achievedCount = goals.filter((g) => g.status === 'achieved').length;

  if (error && goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-error">Failed to load goals: {error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); fetchGoals(); }}
          className="mt-3 rounded-md bg-brand-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Summary MetricCards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Total Goals"
          value={goals.length}
          icon={<span>{'\uD83C\uDFAF'}</span>}
          loading={loading}
        />
        <MetricCard
          title="On Track"
          value={onTrackCount}
          icon={<span>{'\u2705'}</span>}
          loading={loading}
        />
        <MetricCard
          title="At Risk"
          value={atRiskCount}
          icon={<span>{'\u26A0\uFE0F'}</span>}
          loading={loading}
        />
        <MetricCard
          title="Achieved"
          value={achievedCount}
          icon={<span>{'\uD83C\uDFC6'}</span>}
          loading={loading}
        />
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

      {/* Goal Form */}
      {showForm && (
        <GoalForm
          onSuccess={() => {
            setShowForm(false);
            setLoading(true);
            fetchGoals();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg border border-border-default bg-bg-surface" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="py-16 text-center text-body-sm text-text-tertiary">
          {goals.length === 0
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
