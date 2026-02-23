'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import KanbanColumn from './KanbanColumn';
import type { KanbanColumnId, KanbanTask, KanbanColumnConfig } from './types';

interface RawTask {
  id: string;
  content: string;
  section: string;
  completed: boolean;
  sortOrder: number;
  syncedAt: string;
}

function mapTaskToColumn(task: { section: string; completed: boolean }): KanbanColumnId {
  if (task.completed) return 'done';
  const s = task.section.toLowerCase();
  if (s.includes('sprint') || s.includes('in progress')) return 'in_progress';
  if (s.includes('review') || s.includes('testing')) return 'review';
  return 'backlog';
}

const COLUMN_ORDER: { id: KanbanColumnId; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export default function KanbanTab() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Flatten sections into individual tasks with column assignment
      const allTasks: KanbanTask[] = [];
      if (data.sections && Array.isArray(data.sections)) {
        for (const section of data.sections) {
          for (const task of section.tasks) {
            allTasks.push({
              id: `${section.title}-${task.content.slice(0, 40)}`,
              content: task.content,
              section: section.title,
              completed: task.completed,
              sortOrder: 0,
              syncedAt: data.lastSynced ?? new Date().toISOString(),
              column: mapTaskToColumn({
                section: section.title,
                completed: task.completed,
              }),
            });
          }
        }
      }

      setTasks(allTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Unique sections for filter dropdown
  const sections = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.section))).sort(),
    [tasks]
  );

  // Apply filters
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (sectionFilter) {
      result = result.filter((t) => t.section === sectionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.content.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, sectionFilter, searchQuery]);

  // Group into columns
  const columns: KanbanColumnConfig[] = useMemo(
    () =>
      COLUMN_ORDER.map((col) => ({
        ...col,
        color: col.id,
        tasks: filteredTasks.filter((t) => t.column === col.id),
      })),
    [filteredTasks]
  );

  if (error && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-error">Failed to load tasks: {error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchTasks();
          }}
          className="mt-3 rounded-md bg-brand-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="rounded-md border border-border-default bg-bg-surface px-3 py-1.5 text-body-sm text-text-primary"
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search tasks\u2026"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-md border border-border-default bg-bg-surface px-3 py-1.5 text-body-sm text-text-primary placeholder:text-text-tertiary"
        />
      </div>

      {/* Board */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {COLUMN_ORDER.map((col) => (
            <div
              key={col.id}
              className="rounded-lg border border-border-default bg-bg-surface p-3"
            >
              <div className="h-4 w-20 animate-pulse rounded bg-border-subtle" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-md bg-border-subtle"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center text-body-sm text-text-tertiary">
          {tasks.length === 0
            ? 'No tasks found. Tasks are synced from your task management system.'
            : 'No tasks match your filters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <KanbanColumn key={col.id} column={col} />
          ))}
        </div>
      )}
    </div>
  );
}
