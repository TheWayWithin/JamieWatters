'use client';

import KanbanCard from './KanbanCard';
import type { KanbanColumnConfig, KanbanColumnId } from './types';

const HEADER_COLORS: Record<KanbanColumnId, string> = {
  backlog: 'bg-text-tertiary',
  in_progress: 'bg-brand-primary',
  review: 'bg-warning',
  done: 'bg-success',
};

export default function KanbanColumn({ column }: { column: KanbanColumnConfig }) {
  const headerColor = HEADER_COLORS[column.id] ?? 'bg-text-tertiary';

  return (
    <div className="flex min-w-[260px] flex-col rounded-lg border border-border-default bg-bg-surface">
      {/* Colored header bar */}
      <div className={`h-1 rounded-t-lg ${headerColor}`} />

      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <h3 className="text-body-sm font-semibold text-text-primary">
          {column.label}
        </h3>
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-bg-tertiary px-1.5 text-body-xs font-medium text-text-secondary">
          {column.tasks.length}
        </span>
      </div>

      {/* Scrollable card area */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {column.tasks.length === 0 ? (
          <p className="py-6 text-center text-body-xs italic text-text-tertiary">
            No tasks
          </p>
        ) : (
          column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}
