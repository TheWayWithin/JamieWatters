'use client';

import { useState } from 'react';
import type { KanbanTask } from './types';

interface KanbanCardProps {
  task: KanbanTask;
  isDragging?: boolean;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function KanbanCard({ task, isDragging }: KanbanCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setExpanded((prev) => !prev)}
      className={`w-full rounded-md border border-border-default bg-bg-primary p-3 text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
        isDragging ? 'shadow-lg ring-2 ring-brand-primary/30' : 'hover:shadow-sm'
      }`}
    >
      <p
        className={`text-body-sm text-text-primary ${expanded ? '' : 'line-clamp-2'}`}
      >
        {task.content}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-block rounded bg-bg-tertiary px-1.5 py-0.5 text-body-xs text-text-tertiary">
          {task.section}
        </span>
        <span className="text-body-xs text-text-tertiary">
          {formatRelativeTime(task.syncedAt)}
        </span>
      </div>
    </button>
  );
}
