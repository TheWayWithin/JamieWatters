'use client';

import { useState, useEffect } from 'react';

interface Task {
  text: string;
  done: boolean;
}

interface TaskSection {
  title: string;
  tasks: Task[];
  collapsed?: boolean;
}

interface TaskListResponse {
  sections: TaskSection[];
  lastModified: string;
}

export function TaskList() {
  const [sections, setSections] = useState<TaskSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string>('');

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
      setSections(data.sections || []);
      setLastModified(data.lastModified || '');
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (index: number) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, collapsed: !section.collapsed } : section
    ));
  };

  const formatLastModified = (dateStr: string) => {
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
    } catch (err) {
      return dateStr;
    }
  };

  const getProgressStats = (section: TaskSection) => {
    const completed = section.tasks.filter(task => task.done).length;
    const total = section.tasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
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
        <div className="flex items-center gap-3">
          {lastModified && (
            <span className="text-body-xs text-text-tertiary">
              Updated {formatLastModified(lastModified)}
            </span>
          )}
          <button
            onClick={fetchTasks}
            className="text-brand-primary hover:text-brand-secondary text-body-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-body text-text-secondary">No tasks found.</p>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const stats = getProgressStats(section);
            return (
              <div key={sectionIndex} className="border border-border-default rounded-md">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full p-3 text-left hover:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary text-body flex items-center gap-2">
                      <span className="text-sm">
                        {section.collapsed ? '▶️' : '▼'}
                      </span>
                      {section.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm text-text-secondary">
                        {stats.completed}/{stats.total}
                      </span>
                      <div className="w-16 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all duration-300"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
                
                {!section.collapsed && (
                  <div className="px-3 pb-3">
                    <div className="space-y-2">
                      {section.tasks.map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="flex items-start gap-3 p-2 rounded hover:bg-bg-primary transition-colors"
                        >
                          <span className="text-lg mt-0.5">
                            {task.done ? '✅' : '☐'}
                          </span>
                          <span 
                            className={`text-body flex-1 ${
                              task.done 
                                ? 'text-text-tertiary line-through' 
                                : 'text-text-primary'
                            }`}
                          >
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}