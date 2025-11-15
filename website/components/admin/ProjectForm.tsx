'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { generateSlug } from '@/lib/validations/project';

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
}

interface ProjectFormProps {
  project?: Project; // If editing existing project
  mode: 'create' | 'edit';
}

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [name, setName] = useState(project?.name || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [description, setDescription] = useState(project?.description || '');
  const [url, setUrl] = useState(project?.url || '');
  const [techStack, setTechStack] = useState(project?.techStack.join(', ') || '');
  const [category, setCategory] = useState(project?.category || 'AI_TOOLS');
  const [status, setStatus] = useState(project?.status || 'ACTIVE');
  const [featured, setFeatured] = useState(project?.featured || false);
  const [mrr, setMrr] = useState(project?.mrr?.toString() || '0');
  const [users, setUsers] = useState(project?.users?.toString() || '0');
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '');
  const [githubToken, setGithubToken] = useState(''); // Never pre-populate for security
  const [trackProgress, setTrackProgress] = useState(project?.trackProgress || false);

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && name && !slug) {
      setSlug(generateSlug(name));
    }
  }, [name, mode, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Parse tech stack (comma-separated)
      const techStackArray = techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0);

      // Prepare data
      const data = {
        name,
        slug,
        description,
        url,
        techStack: techStackArray,
        category,
        status,
        featured,
        mrr: parseFloat(mrr) || 0,
        users: parseInt(users) || 0,
        githubUrl: githubUrl.trim() || null,
        githubToken: githubToken.trim() || null,
        trackProgress,
      };

      // Validate required fields
      if (!name || !slug || !description || !url || techStackArray.length === 0) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate GitHub URL format if provided
      if (data.githubUrl && !data.githubUrl.match(/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/)) {
        setError('GitHub URL must be in format: https://github.com/username/repo');
        setLoading(false);
        return;
      }

      // Make API request
      const endpoint = mode === 'create' ? '/api/admin/projects' : `/api/admin/projects/${project?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMessage(
          mode === 'create' ? 'Project created successfully!' : 'Project updated successfully!'
        );

        // Redirect after success
        setTimeout(() => {
          router.push('/admin/projects');
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || 'Failed to save project');
        if (result.details) {
          const detailsText = result.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
          setError(`${result.error}: ${detailsText}`);
        }
      }
    } catch (err) {
      setError('Failed to save project. Please try again.');
      console.error('Project save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            Basic Information
          </h2>

          <div className="space-y-4">
            <Input
              label="Project Name *"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Agent-11"
              disabled={loading}
              required
            />

            <Input
              label="Slug *"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., agent-11"
              helperText="URL-friendly identifier (lowercase, hyphens only)"
              disabled={loading}
              required
            />

            <div>
              <label htmlFor="description" className="block text-body-sm font-medium text-text-primary mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of the project..."
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary focus:shadow-brand transition-base min-h-[100px]"
                disabled={loading}
                required
              />
            </div>

            <Input
              label="Project URL *"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              required
            />

            <Input
              label="Tech Stack *"
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, Next.js, TypeScript, Tailwind CSS"
              helperText="Comma-separated list of technologies"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Category and Status */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            Category & Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-body-sm font-medium text-text-primary mb-2">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary transition-base"
                disabled={loading}
              >
                <option value="AI_TOOLS">AI Tools</option>
                <option value="FRAMEWORKS">Frameworks</option>
                <option value="EDUCATION">Education</option>
                <option value="MARKETPLACE">Marketplace</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-body-sm font-medium text-text-primary mb-2">
                Status *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary transition-base"
                disabled={loading}
              >
                <option value="ACTIVE">Active</option>
                <option value="BETA">Beta</option>
                <option value="PLANNING">Planning</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 border-border-default rounded text-brand-primary focus:ring-brand-primary"
                disabled={loading}
              />
              <span className="text-body text-text-primary">Featured Project</span>
            </label>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">Metrics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mrr" className="block text-body-sm font-medium text-text-primary mb-2">
                Monthly Recurring Revenue (MRR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                <input
                  id="mrr"
                  type="number"
                  step="0.01"
                  value={mrr}
                  onChange={(e) => setMrr(e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md pl-8 pr-4 py-3 text-body text-text-primary focus:border-brand-primary transition-base"
                  disabled={loading}
                />
              </div>
            </div>

            <Input
              label="Active Users"
              type="number"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* GitHub Integration */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            GitHub Integration (Optional)
          </h2>

          <div className="space-y-4">
            <Input
              label="GitHub Repository URL"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              helperText="Public or private GitHub repository"
              disabled={loading}
            />

            <Input
              label="GitHub Personal Access Token"
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx or github_pat_xxxxxxxxxxxx"
              helperText="Required for private repos. Token is encrypted before storage."
              disabled={loading}
            />

            <div className="mt-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={trackProgress}
                  onChange={(e) => setTrackProgress(e.target.checked)}
                  className="w-5 h-5 border-border-default rounded text-brand-primary focus:ring-brand-primary"
                  disabled={loading}
                />
                <span className="text-body text-text-primary">Track Progress (Include in daily updates)</span>
              </label>
              <p className="ml-8 mt-1 text-body-sm text-text-tertiary">
                When enabled, completed tasks from project-plan.md will be included in daily updates
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
          </Button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-body-sm">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-body-sm">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
