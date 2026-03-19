'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  tid: string | null;
  content: string;
  owner: string | null;
  project: string | null;
  mode: string | null;
  size: string | null;
  taskStatus: string | null;
  blockedBy: string | null;
  dueDate: string | null;
  syncedAt: string;
}

const COLUMNS = [
  { status: 'ready', label: 'Ready', color: 'border-gray-500' },
  { status: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { status: 'waiting_on_jamie', label: 'Waiting on Jamie', color: 'border-amber-500' },
  { status: 'waiting_on_agent', label: 'Waiting on Agent', color: 'border-gray-400' },
  { status: 'blocked', label: 'Blocked', color: 'border-red-500' },
  { status: 'done', label: 'Done Today', color: 'border-green-500' },
];

function daysInStatus(syncedAt: string): number {
  return Math.floor((Date.now() - new Date(syncedAt).getTime()) / 86_400_000);
}

function modeBadge(mode: string | null): string {
  switch (mode) {
    case 'build': return 'bg-blue-500/20 text-blue-400';
    case 'growth': return 'bg-green-500/20 text-green-400';
    case 'content': return 'bg-purple-500/20 text-purple-400';
    case 'admin': return 'bg-gray-500/20 text-gray-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

export default function ExecutionPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [mobileTab, setMobileTab] = useState('in_progress');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks');
      if (!res.ok) return;
      const data = await res.json();
      // Handle both { sections: [...] } and flat array responses
      if (data.sections) {
        // Flatten section-based response to flat task list
        const flat: Task[] = [];
        for (const section of data.sections) {
          for (const task of section.tasks) {
            flat.push({
              id: task.id || `${section.title}-${task.content}`,
              tid: task.tid || null,
              content: task.content,
              owner: task.owner || null,
              project: task.project || section.title,
              mode: task.mode || null,
              size: task.size || null,
              taskStatus: task.taskStatus || (task.completed ? 'done' : 'ready'),
              blockedBy: task.blockedBy || null,
              dueDate: task.dueDate || null,
              syncedAt: task.syncedAt || new Date().toISOString(),
            });
          }
        }
        setTasks(flat);
      } else if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30_000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  // Get unique projects and owners for filters
  const projects = [...new Set(tasks.map((t) => t.project).filter(Boolean))] as string[];
  const owners = [...new Set(tasks.map((t) => t.owner).filter(Boolean))] as string[];

  // Filter tasks
  const filtered = tasks.filter((t) => {
    if (filterProject && t.project !== filterProject) return false;
    if (filterOwner && t.owner !== filterOwner) return false;
    if (filterPriority && t.size !== filterPriority) return false;
    return true;
  });

  // Group by status
  const grouped: Record<string, Task[]> = {};
  for (const col of COLUMNS) grouped[col.status] = [];
  for (const t of filtered) {
    const status = t.taskStatus || 'ready';
    if (grouped[status]) {
      // For "done" column, only show today's completions
      if (status === 'done') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (new Date(t.syncedAt) >= todayStart) {
          grouped[status].push(t);
        }
      } else {
        grouped[status].push(t);
      }
    }
  }

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-text-secondary">Loading execution board...</p></div>;
  }

  return (
    <div className="p-6 max-w-full mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-display-sm font-bold text-text-primary">Execution Board</h1>
        <button onClick={fetchTasks} className="text-body-sm text-text-secondary hover:text-text-primary">Refresh</button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary"
        >
          <option value="">All projects</option>
          {projects.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary"
        >
          <option value="">All owners</option>
          {owners.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary"
        >
          <option value="">All sizes</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>
      </div>

      {/* Desktop Kanban */}
      <div className="hidden lg:grid grid-cols-6 gap-3">
        {COLUMNS.map((col) => (
          <div key={col.status} className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            <div className={`px-3 py-2 border-t-2 ${col.color} flex items-center justify-between`}>
              <span className="text-body-sm font-medium text-text-primary">{col.label}</span>
              <span className="text-[11px] text-text-secondary">{grouped[col.status]?.length || 0}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {(grouped[col.status] || []).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {(grouped[col.status] || []).length === 0 && (
                <p className="text-[11px] text-text-secondary text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Status tabs + list */}
      <div className="lg:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {COLUMNS.map((col) => (
            <button
              key={col.status}
              onClick={() => setMobileTab(col.status)}
              className={`shrink-0 px-3 py-2 text-body-sm rounded-md transition-colors ${
                mobileTab === col.status
                  ? 'bg-bg-surface text-text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{ minHeight: '44px' }}
            >
              {col.label} ({grouped[col.status]?.length || 0})
            </button>
          ))}
        </div>
        <div className="space-y-2 mt-2">
          {(grouped[mobileTab] || []).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {(grouped[mobileTab] || []).length === 0 && (
            <p className="text-body-sm text-text-secondary text-center py-8">No tasks in this status</p>
          )}
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="bg-bg-surface border border-border-default rounded-lg p-8 text-center">
          <p className="text-text-secondary">No tasks found. Awaiting first sync from Mission Control.</p>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const days = daysInStatus(task.syncedAt);
  return (
    <div className="bg-bg-primary rounded-md p-3 border border-border-subtle">
      <div className="flex items-start justify-between gap-1 mb-1">
        {task.tid && <span className="text-[11px] font-mono text-text-secondary shrink-0">{task.tid}</span>}
        {days > 0 && (
          <span className={`text-[10px] shrink-0 ${days >= 5 ? 'text-red-400' : days >= 3 ? 'text-amber-400' : 'text-text-secondary'}`}>
            {days}d
          </span>
        )}
      </div>
      <p className="text-body-sm text-text-primary leading-tight">{task.content}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {task.owner && (
          <span className="inline-block text-[10px] bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5">{task.owner}</span>
        )}
        {task.project && (
          <span className="inline-block text-[10px] bg-purple-500/20 text-purple-400 rounded px-1.5 py-0.5">{task.project}</span>
        )}
        {task.mode && (
          <span className={`inline-block text-[10px] rounded px-1.5 py-0.5 ${modeBadge(task.mode)}`}>{task.mode}</span>
        )}
        {task.size && (
          <span className="inline-block text-[10px] bg-gray-500/20 text-gray-400 rounded px-1.5 py-0.5">{task.size}</span>
        )}
      </div>
      {task.blockedBy && (
        <p className="text-[10px] text-red-400 mt-1">Blocked by: {task.blockedBy}</p>
      )}
    </div>
  );
}
