'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  featured: boolean;
  mrr: number;
  users: number;
  currentPhase: string | null;
  projectType: string;
  customMetrics: Record<string, unknown> | null;
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getPriority(project: Project): string | null {
  if (project.customMetrics && typeof project.customMetrics === 'object') {
    const priority = (project.customMetrics as Record<string, unknown>).priority;
    if (typeof priority === 'string') return priority;
  }
  return project.featured ? 'high' : null;
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-error',
  medium: 'bg-warning',
  low: 'bg-text-tertiary',
};

export function PortfolioOverview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/projects', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          📦 Portfolio
        </h3>
        <p className="text-body text-text-secondary">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          📦 Portfolio
        </h3>
        <div className="bg-error/10 border border-error/20 rounded-md p-3">
          <p className="text-error text-body-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalMRR = projects.reduce((sum, p) => sum + p.mrr, 0);
  const activeCount = projects.filter(
    (p) => p.status === 'ACTIVE' || p.status === 'LIVE' || p.status === 'BUILD' || p.status === 'MVP'
  ).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-lg font-semibold text-text-primary flex items-center gap-2">
          📦 Portfolio
          <span className="text-body-xs text-text-tertiary font-normal">
            {projects.length} projects
          </span>
        </h3>
        <button
          onClick={fetchProjects}
          className="text-brand-primary hover:text-brand-secondary text-body-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="flex gap-6 mb-4 text-body-sm">
        <div>
          <span className="text-text-tertiary">Total: </span>
          <span className="text-text-primary font-medium">{projects.length}</span>
        </div>
        <div>
          <span className="text-text-tertiary">MRR: </span>
          <span className="text-text-primary font-medium">{formatCurrency(totalMRR)}</span>
        </div>
        <div>
          <span className="text-text-tertiary">Active: </span>
          <span className="text-text-primary font-medium">{activeCount}</span>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="text-body text-text-secondary">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const priority = getPriority(project);
            const statusColor = STATUS_COLORS[project.status] || 'bg-text-tertiary/10 text-text-tertiary';

            return (
              <Link
                key={project.id}
                href={`/admin/projects/${project.slug}`}
                className="block border border-border-default rounded-md p-4 hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {priority && (
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[priority] || ''}`}
                      />
                    )}
                    <h4 className="font-medium text-text-primary text-body-sm truncate">
                      {project.name}
                    </h4>
                  </div>
                  <span
                    className={`text-body-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor}`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.currentPhase && (
                  <p className="text-body-xs text-text-tertiary mb-1">
                    Phase: {project.currentPhase}
                  </p>
                )}

                {project.description && (
                  <p className="text-body-xs text-text-secondary line-clamp-2 mb-2">
                    {project.description}
                  </p>
                )}

                <div className="flex gap-4 text-body-xs text-text-tertiary">
                  {project.mrr > 0 && <span>{formatCurrency(project.mrr)} MRR</span>}
                  {project.users > 0 && (
                    <span>
                      {project.users} user{project.users !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
