'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { generateSlug } from '@/lib/validations/project';
import { ProjectType } from '@prisma/client';
import { METRIC_TEMPLATES, type MetricDefinition, formatMetricValue } from '@/lib/metrics';

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string | null;
  url: string;
  techStack: string[];
  category: string;
  status: string;
  projectType: string;
  featured: boolean;
  mrr: number;
  users: number;
  customMetrics?: Record<string, number> | null;
  problemStatement?: string | null;
  solutionApproach?: string | null;
  lessonsLearned?: string | null;
  screenshots: string[];
  launchedAt?: string | null;
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
  const [longDescription, setLongDescription] = useState(project?.longDescription || '');
  const [url, setUrl] = useState(project?.url || '');
  const [techStack, setTechStack] = useState(project?.techStack.join(', ') || '');
  const [category, setCategory] = useState(project?.category || 'AI_TOOLS');
  const [status, setStatus] = useState(project?.status || 'LIVE');
  const [projectType, setProjectType] = useState<ProjectType>(
    (project?.projectType as ProjectType) || ProjectType.SAAS
  );
  const [featured, setFeatured] = useState(project?.featured || false);
  const [mrr, setMrr] = useState(project?.mrr?.toString() || '0');
  const [users, setUsers] = useState(project?.users?.toString() || '0');
  const [metricsData, setMetricsData] = useState<Record<string, number | undefined>>(
    project?.customMetrics || {}
  );
  const [launchedAt, setLaunchedAt] = useState(project?.launchedAt || '');
  const [problemStatement, setProblemStatement] = useState(project?.problemStatement || '');
  const [solutionApproach, setSolutionApproach] = useState(project?.solutionApproach || '');
  const [lessonsLearned, setLessonsLearned] = useState(project?.lessonsLearned || '');
  const [screenshots, setScreenshots] = useState(project?.screenshots?.join('\n') || '');
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

      // Parse screenshots (newline-separated)
      const screenshotsArray = screenshots
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      // Prepare data
      const data = {
        name,
        slug,
        description,
        longDescription: longDescription.trim() || null,
        url,
        techStack: techStackArray,
        category,
        status,
        projectType,
        featured,
        // Legacy mrr/users fields for backward compatibility
        mrr: projectType === ProjectType.SAAS
          ? (metricsData.mrr ?? parseFloat(mrr) ?? 0)
          : (parseFloat(mrr) || 0),
        users: projectType === ProjectType.SAAS
          ? (metricsData.activeUsers ?? parseInt(users) ?? 0)
          : (parseInt(users) || 0),
        // New configurable metrics
        customMetrics: Object.keys(metricsData).length > 0 ? metricsData : null,
        launchedAt: launchedAt ? new Date(launchedAt).toISOString() : null,
        problemStatement: problemStatement.trim() || null,
        solutionApproach: solutionApproach.trim() || null,
        lessonsLearned: lessonsLearned.trim() || null,
        screenshots: screenshotsArray,
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

        {/* Long Description */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            Long Description (Optional)
          </h2>

          <div>
            <label htmlFor="longDescription" className="block text-body-sm font-medium text-text-primary mb-2">
              Detailed Description
            </label>
            <textarea
              id="longDescription"
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="Expanded description for the portfolio detail page..."
              className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary focus:shadow-brand transition-base min-h-[150px]"
              disabled={loading}
            />
            <p className="mt-2 text-body-sm text-text-tertiary">
              This will be displayed on the project detail page
            </p>
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
                <option value="PRODUCTIVITY">Productivity</option>
                <option value="FINANCE">Finance</option>
                <option value="WELLBEING">Well Being</option>
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
                <option value="RESEARCH">Research</option>
                <option value="DESIGN">Design</option>
                <option value="PLANNING">Planning</option>
                <option value="BUILD">Build</option>
                <option value="BETA">Beta</option>
                <option value="MVP">MVP</option>
                <option value="LIVE">Live</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="projectType" className="block text-body-sm font-medium text-text-primary mb-2">
                Project Type *
              </label>
              <select
                id="projectType"
                value={projectType}
                onChange={(e) => {
                  const newType = e.target.value as ProjectType;
                  setProjectType(newType);
                  // Reset metrics when type changes
                  setMetricsData({});
                }}
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary transition-base"
                disabled={loading}
              >
                <option value="SAAS">SaaS Product</option>
                <option value="TRADING">Trading Tool</option>
                <option value="OPEN_SOURCE">Open Source</option>
                <option value="CONTENT">Content Site</option>
                <option value="PERSONAL">Personal Website</option>
                <option value="MARKETPLACE">Marketplace</option>
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

        {/* Dynamic Metrics based on Project Type */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            Metrics
            <span className="text-body-sm font-normal text-text-tertiary ml-2">
              ({projectType.replace('_', ' ')} metrics)
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {METRIC_TEMPLATES[projectType]?.map((metric: MetricDefinition) => (
              <div key={metric.key}>
                <label
                  htmlFor={`metric-${metric.key}`}
                  className="block text-body-sm font-medium text-text-primary mb-2"
                >
                  {metric.label}
                  {metric.description && (
                    <span className="text-text-tertiary font-normal ml-1">
                      ({metric.description})
                    </span>
                  )}
                </label>
                <div className="relative">
                  {metric.format === 'currency' && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                      $
                    </span>
                  )}
                  <input
                    id={`metric-${metric.key}`}
                    type="number"
                    step={metric.format === 'currency' ? '0.01' : '1'}
                    value={metricsData[metric.key] ?? ''}
                    onChange={(e) =>
                      setMetricsData((prev) => ({
                        ...prev,
                        [metric.key]: e.target.value === '' ? undefined : parseFloat(e.target.value),
                      }))
                    }
                    className={`w-full bg-bg-primary border border-border-default rounded-md py-3 text-body text-text-primary focus:border-brand-primary transition-base ${
                      metric.format === 'currency' ? 'pl-8 pr-4' : 'px-4'
                    } ${metric.format === 'percent' ? 'pr-8' : ''}`}
                    disabled={loading}
                    placeholder={`Enter ${metric.label.toLowerCase()}`}
                  />
                  {metric.format === 'percent' && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
                      %
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Launch Date - always shown for all project types */}
            <Input
              label="Launch Date"
              type="date"
              value={launchedAt}
              onChange={(e) => setLaunchedAt(e.target.value)}
              helperText="When was this project launched?"
              disabled={loading}
            />
          </div>

          {(!METRIC_TEMPLATES[projectType] || METRIC_TEMPLATES[projectType].length === 0) && (
            <p className="text-body-sm text-text-tertiary mt-4">
              No metrics configured for this project type.
            </p>
          )}
        </div>

        {/* Case Study Content */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            Case Study Content (Optional)
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="problemStatement" className="block text-body-sm font-medium text-text-primary mb-2">
                Problem Statement
              </label>
              <textarea
                id="problemStatement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the problem this project solves..."
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary focus:shadow-brand transition-base min-h-[120px]"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="solutionApproach" className="block text-body-sm font-medium text-text-primary mb-2">
                Solution Approach
              </label>
              <textarea
                id="solutionApproach"
                value={solutionApproach}
                onChange={(e) => setSolutionApproach(e.target.value)}
                placeholder="Explain how you solved the problem..."
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary focus:shadow-brand transition-base min-h-[120px]"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="lessonsLearned" className="block text-body-sm font-medium text-text-primary mb-2">
                Lessons Learned
              </label>
              <textarea
                id="lessonsLearned"
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                placeholder="What did you learn from building this project?..."
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary focus:shadow-brand transition-base min-h-[120px]"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            Screenshots (Optional)
          </h2>

          <div>
            <label htmlFor="screenshots" className="block text-body-sm font-medium text-text-primary mb-2">
              Screenshot URLs
            </label>
            <textarea
              id="screenshots"
              value={screenshots}
              onChange={(e) => setScreenshots(e.target.value)}
              placeholder="/images/projects/screenshot-1.png&#10;/images/projects/screenshot-2.png&#10;/images/projects/screenshot-3.png"
              className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:border-brand-primary focus:shadow-brand transition-base min-h-[120px] font-mono text-sm"
              disabled={loading}
            />
            <p className="mt-2 text-body-sm text-text-tertiary">
              Enter one URL per line. Images should be placed in <code className="bg-bg-primary px-1 py-0.5 rounded">/public/images/projects/</code>
            </p>
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
