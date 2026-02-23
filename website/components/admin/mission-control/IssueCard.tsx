'use client';

import { useState } from 'react';
import type { Issue, IssueType, IssueSeverity, IssueStatus } from './types';

const TYPE_ICONS: Record<IssueType, string> = {
  approval: '\u2705',
  blocker: '\uD83D\uDED1',
  error: '\u26A0\uFE0F',
  warning: '\uD83D\uDFE1',
  question: '\u2753',
};

const SEVERITY_BORDER: Record<IssueSeverity, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-gray-400',
};

const SEVERITY_BADGE: Record<IssueSeverity, string> = {
  critical: 'bg-red-500/10 text-red-500',
  high: 'bg-orange-500/10 text-orange-500',
  medium: 'bg-amber-500/10 text-amber-600',
  low: 'bg-gray-500/10 text-gray-500',
};

const STATUS_BADGE: Record<IssueStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-500/10 text-blue-500' },
  in_progress: { label: 'In Progress', className: 'bg-warning/10 text-warning' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success' },
  dismissed: { label: 'Dismissed', className: 'bg-gray-500/10 text-gray-500' },
};

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

interface IssueCardProps {
  issue: Issue;
  onUpdate: () => void;
}

export default function IssueCard({ issue, onUpdate }: IssueCardProps) {
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isTerminal = issue.status === 'resolved' || issue.status === 'dismissed';
  const statusConfig = STATUS_BADGE[issue.status] || STATUS_BADGE.open;

  async function patchIssue(data: Record<string, unknown>) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setResolving(false);
      setResolution('');
      onUpdate();
    } catch {
      // Silently handle — user can retry
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`rounded-lg border border-border-default border-l-4 bg-bg-surface p-4 ${SEVERITY_BORDER[issue.severity]} ${isTerminal ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <span className="mt-0.5 text-lg">{TYPE_ICONS[issue.type]}</span>

        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-body-sm font-semibold text-text-primary">{issue.title}</h4>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-body-xs font-medium ${SEVERITY_BADGE[issue.severity]}`}>
                {issue.severity}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-body-xs font-medium ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Description */}
          {issue.description && (
            <p className="mt-1 text-body-xs text-text-secondary line-clamp-2">{issue.description}</p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-body-xs text-text-tertiary">
            <span>{formatRelativeTime(issue.createdAt)}</span>
            <span className="rounded bg-bg-tertiary px-1.5 py-0.5">{issue.source}</span>
            {issue.project && <span>{issue.project.name}</span>}
            {issue.assignedTo && <span>Assigned: {issue.assignedTo}</span>}
          </div>

          {/* Resolution display */}
          {issue.resolution && (
            <p className="mt-2 rounded bg-success/5 px-2 py-1 text-body-xs text-success">
              Resolution: {issue.resolution}
            </p>
          )}

          {/* Action buttons */}
          {!isTerminal && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {issue.status === 'open' && (
                <button
                  onClick={() => patchIssue({ status: 'in_progress' })}
                  disabled={submitting}
                  className="rounded-md border border-border-default px-2.5 py-1 text-body-xs font-medium text-text-secondary hover:bg-bg-secondary disabled:opacity-50"
                >
                  Start
                </button>
              )}
              <button
                onClick={() => setResolving(true)}
                disabled={submitting}
                className="rounded-md bg-success/10 px-2.5 py-1 text-body-xs font-medium text-success hover:bg-success/20 disabled:opacity-50"
              >
                Resolve
              </button>
              <button
                onClick={() => patchIssue({ status: 'dismissed' })}
                disabled={submitting}
                className="rounded-md px-2.5 py-1 text-body-xs font-medium text-text-tertiary hover:bg-bg-secondary disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Inline resolve input */}
          {resolving && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="How was this resolved?"
                className="flex-1 rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-xs text-text-primary placeholder:text-text-tertiary"
                autoFocus
              />
              <button
                onClick={() => patchIssue({ status: 'resolved', resolution })}
                disabled={submitting || !resolution.trim()}
                className="rounded-md bg-success px-3 py-1.5 text-body-xs font-medium text-white hover:bg-success/90 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
              <button
                onClick={() => { setResolving(false); setResolution(''); }}
                className="rounded-md border border-border-default px-2.5 py-1.5 text-body-xs text-text-secondary hover:bg-bg-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
