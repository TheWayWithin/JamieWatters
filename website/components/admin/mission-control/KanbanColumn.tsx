'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
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

      {/* Droppable card area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 overflow-y-auto px-2 pb-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-brand-primary/5' : ''
            }`}
            style={{ minHeight: '80px', maxHeight: 'calc(100vh - 280px)' }}
          >
            {column.tasks.length === 0 && !snapshot.isDraggingOver ? (
              <p className="py-6 text-center text-body-xs italic text-text-tertiary">
                No tasks
              </p>
            ) : null}
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <KanbanCard task={task} isDragging={dragSnapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
