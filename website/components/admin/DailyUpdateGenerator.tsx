'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Project {
  id: string;
  name: string;
  githubUrl: string | null;
  trackProgress: boolean;
}

interface DailyUpdateGeneratorProps {
  onGenerate: (preview: any) => void;
}

export function DailyUpdateGenerator({ onGenerate }: DailyUpdateGeneratorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [error, setError] = useState('');

  // Fetch tracked projects on mount
  useEffect(() => {
    fetchTrackedProjects();
  }, []);

  const fetchTrackedProjects = async () => {
    try {
      setFetchingProjects(true);
      const res = await fetch('/api/admin/projects?trackProgress=true', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const trackedProjects = data.data || [];
        setProjects(trackedProjects);

        // Auto-select all tracked projects by default
        setSelectedProjectIds(trackedProjects.map((p: Project) => p.id));
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Fetch projects error:', err);
    } finally {
      setFetchingProjects(false);
    }
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProjectIds(projects.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedProjectIds([]);
  };

  const handleGenerate = async () => {
    if (selectedProjectIds.length === 0) {
      setError('Please select at least one project');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/admin/content/generate-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectIds: selectedProjectIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onGenerate(data.preview);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to generate daily update');
      }
    } catch (err) {
      setError('Failed to generate daily update');
      console.error('Generate daily update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProjects) {
    return (
      <Card>
        <h2 className="text-heading-md font-semibold mb-4">📊 Generate Daily Update</h2>
        <p className="text-body text-text-secondary">Loading projects...</p>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <h2 className="text-heading-md font-semibold mb-4">📊 Generate Daily Update</h2>
        <p className="text-body text-text-secondary mb-4">
          No projects are set to track progress.
        </p>
        <p className="text-body-sm text-text-tertiary">
          Go to Projects and enable "Track Progress" for projects you want to include in daily updates.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-heading-md font-semibold mb-2">📊 Generate Daily Update</h2>
      <p className="text-body text-text-secondary mb-6">
        Pull completed tasks from project-plan.md files and create a daily progress post.
      </p>

      {/* Project Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body-lg font-medium">Projects to include:</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-body-sm text-brand-primary hover:underline"
            >
              Select All
            </button>
            <span className="text-text-tertiary">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-body-sm text-brand-primary hover:underline"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {projects.map((project) => (
            <label
              key={project.id}
              className="flex items-start gap-3 p-3 border border-border-subtle rounded-lg hover:bg-bg-secondary cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedProjectIds.includes(project.id)}
                onChange={() => handleToggleProject(project.id)}
                className="mt-1 w-4 h-4 text-brand-primary border-border-default rounded focus:ring-2 focus:ring-brand-primary"
              />
              <div className="flex-1">
                <p className="text-body font-medium">{project.name}</p>
                {project.githubUrl && (
                  <p className="text-body-sm text-text-tertiary">{project.githubUrl}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        <p className="text-body-sm text-text-tertiary mt-2">
          {selectedProjectIds.length} of {projects.length} project(s) selected
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-body-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={loading || selectedProjectIds.length === 0}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Daily Update →'}
      </Button>
    </Card>
  );
}
