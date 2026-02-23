'use client';

import type { ProjectItem } from './types';

interface EnhancedProjectCardProps {
  project: ProjectItem;
  onViewTasks?: (projectId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  LIVE: 'bg-success/10 text-success',
  ACTIVE: 'bg-success/10 text-success',
  BUILD: 'bg-warning/10 text-warning',
  MVP: 'bg-warning/10 text-warning',
  PLANNING: 'bg-brand-secondary/10 text-brand-secondary',
  DESIGN: 'bg-brand-secondary/10 text-brand-secondary',
  RESEARCH: 'bg-brand-secondary/10 text-brand-secondary',
  BETA: 'bg-brand-secondary/10 text-brand-secondary',
  PAUSED: 'bg-text-tertiary/10 text-text-tertiary',
  ARCHIVED: 'bg-text-tertiary/10 text-text-tertiary',
};

function formatRelativeTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
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

export default function EnhancedProjectCard({ project, onViewTasks }: EnhancedProjectCardProps) {
  const statusColor = STATUS_COLORS[project.status] || 'bg-text-tertiary/10 text-text-tertiary';
  const lastActivity = formatRelativeTime(project.lastSynced || project.updatedAt);

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-body-sm font-semibold text-text-primary truncate">{project.name}</h4>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-body-xs font-medium ${statusColor}`}>
          {project.status}
        </span>
      </div>

      {project.currentPhase && (
        <p className="mt-0.5 text-body-xs text-text-tertiary">Phase: {project.currentPhase}</p>
      )}

      {project.description && (
        <p className="mt-2 line-clamp-2 text-body-xs text-text-secondary">{project.description}</p>
      )}

      {/* Metrics row */}
      <div className="mt-3 flex flex-wrap gap-3 text-body-xs text-text-tertiary">
        {project.mrr > 0 && <span>${project.mrr.toLocaleString()} MRR</span>}
        {project.users > 0 && (
          <span>{project.users} user{project.users !== 1 ? 's' : ''}</span>
        )}
        {lastActivity && <span>Updated {lastActivity}</span>}
      </div>

      {/* Tech stack pills */}
      {project.techStack.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded bg-bg-tertiary px-1.5 py-0.5 text-body-xs text-text-tertiary">
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-body-xs text-text-tertiary">+{project.techStack.length - 4}</span>
          )}
        </div>
      )}

      {/* Actions */}
      {onViewTasks && (
        <button
          onClick={() => onViewTasks(project.id)}
          className="mt-3 text-body-xs font-medium text-brand-primary hover:text-brand-primary/80"
        >
          View Tasks &rarr;
        </button>
      )}
    </div>
  );
}
