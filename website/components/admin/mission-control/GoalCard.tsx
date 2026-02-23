'use client';

import type { Goal, GoalStatus } from './types';

const STATUS_CONFIG: Record<GoalStatus, { label: string; bg: string; bar: string }> = {
  on_track: { label: 'On Track', bg: 'bg-success/10 text-success', bar: 'bg-success' },
  at_risk: { label: 'At Risk', bg: 'bg-warning/10 text-warning', bar: 'bg-warning' },
  behind: { label: 'Behind', bg: 'bg-error/10 text-error', bar: 'bg-error' },
  achieved: { label: 'Achieved', bg: 'bg-brand-primary/10 text-brand-primary', bar: 'bg-brand-primary' },
};

function formatValue(value: number, unit: string): string {
  if (unit === '$') {
    return `$${value.toLocaleString()}`;
  }
  if (unit === '%') {
    return `${value}%`;
  }
  return `${value.toLocaleString()} ${unit}`;
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const now = Date.now();
  const dl = new Date(deadline).getTime();
  const daysLeft = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`;
  if (daysLeft === 0) return 'Due today';
  return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
}

export default function GoalCard({ goal }: { goal: Goal }) {
  const config = STATUS_CONFIG[goal.status] || STATUS_CONFIG.on_track;
  const deadlineText = formatDeadline(goal.deadline);

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-body-sm font-semibold text-text-primary">{goal.name}</h4>
          <span className="mt-1 inline-block rounded bg-bg-tertiary px-1.5 py-0.5 text-body-xs text-text-tertiary">
            {goal.category}
          </span>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-body-xs font-medium ${config.bg}`}>
          {config.label}
        </span>
      </div>

      <p className="mt-2 text-body-xs text-text-secondary">{goal.metric}</p>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-body-xs">
          <span className="text-text-primary font-medium">
            {formatValue(goal.currentValue, goal.unit)} / {formatValue(goal.targetValue, goal.unit)}
          </span>
          <span className="text-text-tertiary">{goal.progressPercent}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border-subtle">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${config.bar}`}
            style={{ width: `${goal.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      {(deadlineText || goal.project) && (
        <div className="mt-3 flex items-center gap-3 text-body-xs text-text-tertiary">
          {deadlineText && <span>{deadlineText}</span>}
          {goal.project && (
            <span className="truncate">{goal.project.name}</span>
          )}
        </div>
      )}
    </div>
  );
}
