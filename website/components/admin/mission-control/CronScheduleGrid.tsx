'use client';

import type { ScheduleEntry } from './types';

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = then - now;

  // Future time
  if (diffMs > 0) {
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 60) return `in ${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `in ${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `in ${diffDay}d`;
  }

  // Past time
  const pastMs = Math.abs(diffMs);
  const diffMin = Math.floor(pastMs / 60_000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

const STATUS_DOT: Record<string, string> = {
  completed: 'bg-success',
  success: 'bg-success',
  failed: 'bg-red-500',
  error: 'bg-red-500',
  running: 'bg-brand-primary animate-pulse',
  pending: 'bg-amber-400',
  unknown: 'bg-gray-400',
};

interface CronScheduleGridProps {
  schedules: ScheduleEntry[];
  loading?: boolean;
}

export default function CronScheduleGrid({ schedules, loading }: CronScheduleGridProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-border-subtle" />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <p className="py-6 text-center text-body-xs italic text-text-tertiary">
        No scheduled tasks configured
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-xs">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="pb-2 pr-4 text-left font-medium text-text-secondary">Job</th>
            <th className="pb-2 pr-4 text-left font-medium text-text-secondary">Schedule</th>
            <th className="pb-2 pr-4 text-left font-medium text-text-secondary">Next Run</th>
            <th className="pb-2 pr-4 text-left font-medium text-text-secondary">Last Run</th>
            <th className="pb-2 text-left font-medium text-text-secondary">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {schedules.map((entry) => {
            const dotColor = STATUS_DOT[entry.lastStatus || 'unknown'] || STATUS_DOT.unknown;
            return (
              <tr key={entry.jobId}>
                <td className="py-2 pr-4">
                  <span className={`text-text-primary ${!entry.enabled ? 'line-through opacity-50' : ''}`}>
                    {entry.name}
                  </span>
                </td>
                <td className="py-2 pr-4 text-text-tertiary font-mono">{entry.schedule}</td>
                <td className="py-2 pr-4 text-text-secondary">{formatRelativeTime(entry.nextRunAt)}</td>
                <td className="py-2 pr-4 text-text-secondary">{formatRelativeTime(entry.lastRunAt)}</td>
                <td className="py-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
                    <span className="text-text-secondary">{entry.lastStatus || 'unknown'}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
