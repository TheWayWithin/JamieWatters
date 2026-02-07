'use client';

import { useState, useEffect } from 'react';

interface ScheduledJob {
  name: string;
  nextRun: string;
  schedule: string;
  lastStatus: 'ok' | 'error';
  enabled: boolean;
  lastRun?: string;
}

interface ScheduledTasksResponse {
  jobs: ScheduledJob[];
}

export function ScheduledTasks() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatNextRun = (nextRun: string) => {
    try {
      const date = new Date(nextRun);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));

      // Format for display in ET
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

      if (diffHours < 1) {
        return `${formatted} (soon)`;
      } else if (diffHours < 24) {
        return `${formatted} (${diffHours}h)`;
      } else {
        return formatted;
      }
    } catch (err) {
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

      {jobs.length === 0 ? (
        <p className="text-body text-text-secondary">No scheduled tasks found.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border ${
                job.enabled
                  ? 'border-border-default bg-bg-primary'
                  : 'border-border-subtle bg-bg-secondary opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary text-body flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(job.lastStatus)}</span>
                    {job.name}
                  </h4>
                  <p className="text-body-sm text-text-secondary mt-1">
                    Next: {formatNextRun(job.nextRun)}
                  </p>
                  <p className="text-body-xs text-text-tertiary mt-1">
                    Schedule: {job.schedule}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      job.enabled
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-text-tertiary/10 text-text-tertiary border border-text-tertiary/20'
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