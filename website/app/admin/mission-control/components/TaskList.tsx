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
  collapsed?: boolean;
}

interface TaskListResponse {
  sections: TaskSection[];
  totalTasks: number;
  completedTasks: number;
  lastSynced: string;
}

export function TaskList() {
  const [sections, setSections] = useState<TaskSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tasks', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data: TaskListResponse = await response.json();
      setSections(data.sections?.map(s => ({ ...s, collapsed: true })) || []);
      setLastSynced(data.lastSynced || '');
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (sectionTitle: string, taskContent: string, currentCompleted: boolean) => {
    const taskKey = `${sectionTitle}:${taskContent}`;
    setUpdating(taskKey);

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionTitle,
          content: taskContent,
          completed: !currentCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update local state
      setSections(prev => prev.map(section => {
        if (section.title !== sectionTitle) return section;
        return {
          ...section,
          tasks: section.tasks.map(task => {
            if (task.content !== taskContent) return task;
            return { ...task, completed: !currentCompleted };
          }),
          completed: section.completed + (currentCompleted ? -1 : 1),
        };
      }));
    } catch (err) {
      console.error('Error toggling task:', err);
      // Could show a toast here
    } finally {
      setUpdating(null);
    }
  };

  const toggleSection = (index: number) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, collapsed: !section.collapsed } : section
    ));
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
          📋 Tasks
        </h3>
        <p className="text-body text-text-secondary">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          📋 Tasks
        </h3>
        <div className="bg-error/10 border border-error/20 rounded-md p-3">
          <p className="text-error text-body-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-lg font-semibold text-text-primary flex items-center gap-2">
          📋 Tasks
        </h3>
        <button
          onClick={fetchTasks}
          className="text-brand-primary hover:text-brand-secondary text-body-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="text-body text-text-secondary">No tasks found.</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border border-border-default rounded-md">
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full p-3 text-left hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-text-primary text-body-sm flex items-center gap-2">
                    <span className="text-xs">
                      {section.collapsed ? '▶' : '▼'}
                    </span>
                    {section.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-body-xs text-text-secondary">
                      {section.tasks.filter(t => t.completed).length}/{section.tasks.length}
                    </span>
                  </div>
                </div>
              </button>
              
              {!section.collapsed && (
                <div className="px-3 pb-3 space-y-1">
                  {section.tasks.map((task, taskIndex) => {
                    const taskKey = `${section.title}:${task.content}`;
                    const isUpdating = updating === taskKey;
                    
                    return (
                      <button
                        key={taskIndex}
                        onClick={() => toggleTask(section.title, task.content, task.completed)}
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
            </div>
          ))}
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
