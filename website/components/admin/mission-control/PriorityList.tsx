'use client';

import type { PriorityItem } from './types';

interface PriorityListProps {
  items: PriorityItem[];
  loading?: boolean;
}

export default function PriorityList({ items, loading = false }: PriorityListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-6 w-6 animate-pulse rounded-full bg-border-subtle" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-border-subtle" />
              <div className="h-3 w-16 animate-pulse rounded bg-border-subtle" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-body-sm text-text-tertiary">
        All clear! No pending tasks.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-body-xs font-semibold text-brand-primary">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-body-sm text-text-primary">
              {item.content}
            </p>
            <span className="mt-0.5 inline-block rounded bg-bg-tertiary px-1.5 py-0.5 text-body-xs text-text-tertiary">
              {item.section}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
