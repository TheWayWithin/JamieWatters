'use client';

import type { MetricCardProps } from './types';

export default function MetricCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  className = '',
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className={`rounded-lg border border-border-default bg-bg-surface p-4 ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded bg-border-subtle" />
          <div className="h-4 w-20 animate-pulse rounded bg-border-subtle" />
        </div>
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-border-subtle" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-border-subtle" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-border-default bg-bg-surface p-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-text-secondary">
        <span className="text-base">{icon}</span>
        <span className="text-body-sm font-medium">{title}</span>
      </div>
      <p className="mt-2 text-display-sm font-bold text-text-primary">{value}</p>
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2 text-body-xs">
          {trend && (
            <span
              className={
                trend.direction === 'up'
                  ? 'text-success'
                  : trend.direction === 'down'
                    ? 'text-error'
                    : 'text-text-tertiary'
              }
            >
              {trend.direction === 'up'
                ? '\u2191'
                : trend.direction === 'down'
                  ? '\u2193'
                  : '\u2014'}
              {trend.value && ` ${trend.value}`}
            </span>
          )}
          {subtitle && (
            <span className="text-text-tertiary">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
