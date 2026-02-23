'use client';

import { useState } from 'react';

interface GoalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const UNIT_PRESETS = ['$', 'users', '%', 'tasks', 'sessions'];
const CATEGORY_PRESETS = ['Revenue', 'Growth', 'Product', 'Infrastructure'];

export default function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [metric, setMetric] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('$');
  const [category, setCategory] = useState('Revenue');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/goals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          metric,
          currentValue: Number(currentValue),
          targetValue: Number(targetValue),
          unit,
          category,
          deadline: deadline || undefined,
          description: description || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border-default bg-bg-surface p-4">
      <h4 className="text-body-sm font-semibold text-text-primary">Add Goal</h4>

      {error && (
        <p className="mt-2 rounded bg-error/10 px-3 py-1.5 text-body-xs text-error">{error}</p>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-body-xs font-medium text-text-secondary">Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monthly Revenue Target"
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        {/* Metric */}
        <div className="sm:col-span-2">
          <label className="block text-body-xs font-medium text-text-secondary">Metric *</label>
          <input
            type="text"
            required
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="e.g. Monthly Recurring Revenue"
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        {/* Current Value */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Current Value *</label>
          <input
            type="number"
            required
            min="0"
            step="any"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary"
          />
        </div>

        {/* Target Value */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Target Value *</label>
          <input
            type="number"
            required
            min="0.01"
            step="any"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="e.g. 5000"
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Unit *</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary"
          >
            {UNIT_PRESETS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary"
          >
            {CATEGORY_PRESETS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-body-xs font-medium text-text-secondary">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional notes about this goal"
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary placeholder:text-text-tertiary"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border-default px-3 py-1.5 text-body-sm text-text-secondary hover:bg-bg-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-primary px-3 py-1.5 text-body-sm font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Creating\u2026' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
}
