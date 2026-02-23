'use client';

import { useState, useEffect } from 'react';

interface IssueFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TYPE_OPTIONS = [
  { value: 'blocker', label: 'Blocker' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'approval', label: 'Approval' },
  { value: 'question', label: 'Question' },
];

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

interface ProjectOption {
  id: string;
  name: string;
}

export default function IssueForm({ onSuccess, onCancel }: IssueFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('blocker');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    fetch('/api/admin/projects', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const list = data?.data || data || [];
        if (Array.isArray(list)) {
          setProjects(list.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/issues', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          severity,
          description: description || undefined,
          projectId: projectId || undefined,
          source: 'manual',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border-default bg-bg-surface p-4">
      <h4 className="text-body-sm font-semibold text-text-primary">Report Issue</h4>

      {error && (
        <p className="mt-2 rounded bg-error/10 px-3 py-1.5 text-body-xs text-error">{error}</p>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-body-xs font-medium text-text-secondary">Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Severity *</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary"
          >
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Project */}
        <div>
          <label className="block text-body-xs font-medium text-text-secondary">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary"
          >
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-body-xs font-medium text-text-secondary">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Additional details about the issue"
            className="mt-1 w-full rounded-md border border-border-default bg-bg-primary px-3 py-1.5 text-body-sm text-text-primary placeholder:text-text-tertiary"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border-default px-3 py-1.5 text-body-sm text-text-secondary hover:bg-bg-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-primary px-3 py-1.5 text-body-sm font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Issue'}
        </button>
      </div>
    </form>
  );
}
