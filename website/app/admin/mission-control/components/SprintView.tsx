'use client';

import { useState, useEffect } from 'react';

interface Task {
  content: string;
  completed: boolean;
}

interface TaskSection {
  title: string;
  tasks: Task[];
  total: number;
  completed: number;
}

interface TaskListResponse {
  sections: TaskSection[];
  totalTasks: number;
  completedTasks: number;
  lastSynced: string;
}

export function SprintView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSprintTasks();
  }, []);

  const fetchSprintTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tasks', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data: TaskListResponse = await response.json();

      // Filter for sprint sections only
      const sprintSections = (data.sections || []).filter((s) =>
        /sprint/i.test(s.title)
      );

      // Flatten all sprint tasks into a single list
      const allSprintTasks = sprintSections.flatMap((s) => s.tasks);
      setTasks(allSprintTasks);
      setLastSynced(data.lastSynced || '');
      setError(null);
    } catch (err) {
      console.error('Error fetching sprint tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sprint tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskContent: string, currentCompleted: boolean) => {
    setUpdating(taskContent);

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'Active Sprint',
          content: taskContent,
          completed: !currentCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.content === taskContent ? { ...task, completed: !currentCompleted } : task
        )
      );
    } catch (err) {
      console.error('Error toggling sprint task:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatLastSynced = (dateStr: string) => {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          🎯 Current Sprint
        </h3>
        <p className="text-body text-text-secondary">Loading sprint...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          🎯 Current Sprint
        </h3>
        <div className="bg-error/10 border border-error/20 rounded-md p-3">
          <p className="text-error text-body-sm">{error}</p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-lg font-semibold text-text-primary flex items-center gap-2">
          🎯 Current Sprint
          <span className="text-body-xs text-text-tertiary font-normal">
            {completedCount}/{totalCount}
          </span>
        </h3>
        <button
          onClick={fetchSprintTasks}
          className="text-brand-primary hover:text-brand-secondary text-body-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-body-xs text-text-tertiary mb-1">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-body-sm text-text-secondary">
          No sprint tasks found. Sprint items will appear here after sync.
        </p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {tasks.map((task, index) => {
            const isUpdating = updating === task.content;

            return (
              <button
                key={index}
                onClick={() => toggleTask(task.content, task.completed)}
                disabled={isUpdating}
                className={`w-full flex items-start gap-2 p-2 rounded text-left transition-colors ${
                  isUpdating
                    ? 'opacity-50 cursor-wait'
                    : 'hover:bg-bg-primary cursor-pointer'
                }`}
              >
                <span className="text-sm mt-0.5 flex-shrink-0">
                  {task.completed ? '✅' : '☐'}
                </span>
                <span
                  className={`text-body-sm flex-1 ${
                    task.completed
                      ? 'text-text-tertiary line-through'
                      : 'text-text-primary'
                  }`}
                >
                  {task.content}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {lastSynced && (
        <p className="text-body-xs text-text-tertiary mt-4">
          Last synced: {formatLastSynced(lastSynced)}
        </p>
      )}
    </div>
  );
}
