'use client';

import { useState, useEffect } from 'react';

interface ScheduledJob {
  name: string;
  jobId?: string;
  nextRun: string;
  schedule: string;
  timezone?: string;
  lastStatus: 'ok' | 'error' | 'unknown';
  enabled: boolean;
  lastRun?: string;
  syncedAt?: string;
}

interface ScheduledTasksResponse {
  jobs: ScheduledJob[];
}

export function ScheduledTasks() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchScheduledTasks();
  }, []);

  const fetchScheduledTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/scheduled-tasks', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scheduled tasks: ${response.status}`);
      }

      const data: ScheduledTasksResponse = await response.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching scheduled tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scheduled tasks');
    } finally {
      setLoading(false);
    }
  };

  const triggerJob = async (job: ScheduledJob) => {
    if (!job.jobId) {
      setMessage({ type: 'error', text: 'Job ID not available' });
      return;
    }

    setTriggering(job.name);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/scheduled-tasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger',
          jobId: job.jobId,
          jobName: job.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger job');
      }

      const data = await response.json();
      setMessage({ type: 'success', text: `${job.name} queued for execution` });
      
      // Auto-hide message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to trigger job' });
    } finally {
      setTriggering(null);
    }
  };

  const formatNextRun = (nextRun: string | null) => {
    if (!nextRun) return 'Not scheduled';
    
    try {
      const date = new Date(nextRun);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));

      const timeFormat = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const formatted = timeFormat.format(date);

      if (diffMs < 0) {
        return `${formatted} (overdue)`;
      } else if (diffHours < 1) {
        return `${formatted} (soon)`;
      } else if (diffHours < 24) {
        return `${formatted} (${diffHours}h)`;
      } else {
        return formatted;
      }
    } catch {
      return nextRun;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          📅 Scheduled Tasks
        </h3>
        <p className="text-body text-text-secondary">Loading scheduled tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          📅 Scheduled Tasks
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
          📅 Scheduled Tasks
        </h3>
        <button
          onClick={fetchScheduledTasks}
          className="text-brand-primary hover:text-brand-secondary text-body-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-body-sm ${
          message.type === 'success' 
            ? 'bg-success/10 text-success border border-success/20' 
            : 'bg-error/10 text-error border border-error/20'
        }`}>
          {message.text}
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="text-body text-text-secondary">No scheduled tasks found.</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {jobs.map((job, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border ${
                job.enabled
                  ? 'border-border-default bg-bg-primary'
                  : 'border-border-subtle bg-bg-secondary opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary text-body-sm flex items-center gap-2">
                    <span>{getStatusIcon(job.lastStatus)}</span>
                    <span className="truncate">{job.name}</span>
                  </h4>
                  <p className="text-body-xs text-text-secondary mt-1">
                    Next: {formatNextRun(job.nextRun)}
                  </p>
                  <p className="text-body-xs text-text-tertiary">
                    Schedule: {job.schedule}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => triggerJob(job)}
                    disabled={triggering === job.name || !job.enabled}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      triggering === job.name
                        ? 'bg-brand-primary/20 text-brand-primary cursor-wait'
                        : job.enabled
                        ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
                        : 'bg-text-tertiary/10 text-text-tertiary cursor-not-allowed'
                    }`}
                  >
                    {triggering === job.name ? '⏳' : '▶️'} Run
                  </button>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      job.enabled
                        ? 'bg-success/10 text-success'
                        : 'bg-text-tertiary/10 text-text-tertiary'
                    }`}
                  >
                    {job.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
