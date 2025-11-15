'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  url: string;
  techStack: string[];
  category: string;
  status: string;
  featured: boolean;
  mrr: number;
  users: number;
  githubUrl?: string | null;
  trackProgress: boolean;
  lastSynced?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        // Remove from local state
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(`Failed to delete project: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to delete project');
      console.error('Delete project error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleTrackProgress = async (project: Project) => {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trackProgress: !project.trackProgress }),
      });

      if (res.ok) {
        // Update local state
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, trackProgress: !p.trackProgress } : p))
        );
      } else {
        const data = await res.json();
        alert(`Failed to update: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to update project');
      console.error('Toggle track progress error:', err);
    }
  };

  const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
    ACTIVE: 'success',
    BETA: 'warning',
    PLANNING: 'info',
    ARCHIVED: 'error',
  };

  if (loading) {
    return (
      <section className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
        <p className="text-body text-text-secondary">Loading projects...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
        <p className="text-body text-error">{error}</p>
        <Button variant="primary" onClick={fetchProjects} className="mt-4">
          Retry
        </Button>
      </section>
    );
  }

  return (
    <section className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
      {/* Header with Actions */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-display-md font-bold text-text-primary mb-2">Projects</h2>
          <p className="text-body text-text-secondary">
            Manage your portfolio projects. Total: {projects.length}
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button variant="primary" size="sm">
            + Add New
          </Button>
        </Link>
      </div>

      {/* Projects Table */}
      <div>
        {projects.length === 0 ? (
          <div className="bg-bg-surface border border-border-default rounded-lg p-12 text-center">
            <p className="text-body-lg text-text-secondary mb-4">No projects yet</p>
            <Link href="/admin/projects/new">
              <Button variant="primary">Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-primary border-b border-border-default">
                  <tr>
                    <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">
                      GitHub
                    </th>
                    <th className="text-center px-6 py-4 text-body-sm font-semibold text-text-primary">
                      Track Progress
                    </th>
                    <th className="text-center px-6 py-4 text-body-sm font-semibold text-text-primary">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">
                      Last Synced
                    </th>
                    <th className="text-right px-6 py-4 text-body-sm font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-body font-medium text-text-primary">{project.name}</p>
                          <p className="text-body-sm text-text-tertiary">{project.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-body-sm text-brand-primary hover:underline"
                          >
                            View Repo →
                          </a>
                        ) : (
                          <span className="text-body-sm text-text-tertiary">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleTrackProgress(project)}
                          className="text-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary rounded"
                          title={project.trackProgress ? 'Tracking enabled' : 'Tracking disabled'}
                        >
                          {project.trackProgress ? '✓' : '○'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={statusColors[project.status]} size="sm">
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {project.lastSynced ? (
                          <span className="text-body-sm text-text-secondary">
                            {new Date(project.lastSynced).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-body-sm text-text-tertiary">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/projects/${project.id}`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(project.id, project.name)}
                            disabled={deletingId === project.id}
                            className="text-error hover:text-error"
                          >
                            {deletingId === project.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border-subtle">
              {projects.map((project) => (
                <div key={project.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-body font-semibold text-text-primary">{project.name}</h3>
                      <p className="text-body-sm text-text-tertiary">{project.slug}</p>
                    </div>
                    <Badge variant={statusColors[project.status]} size="sm">
                      {project.status}
                    </Badge>
                  </div>

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-sm text-brand-primary hover:underline inline-block"
                    >
                      View GitHub Repo →
                    </a>
                  )}

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={project.trackProgress}
                        onChange={() => handleToggleTrackProgress(project)}
                        className="w-5 h-5 border-border-default rounded text-brand-primary"
                      />
                      <span className="text-body-sm text-text-primary">Track Progress</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/admin/projects/${project.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={deletingId === project.id}
                      className="text-error"
                    >
                      {deletingId === project.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
