'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from './MarkdownEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { calculateReadTime } from '@/lib/read-time-calculator';
import {
  PostFormSchema,
  type PostFormData,
  formDataToCreateInput,
  type PostType,
} from '@/lib/validations/post';

interface PostFormProps {
  mode: 'create' | 'edit';
  postId?: string;
  initialData?: Partial<PostFormData>;
  projects?: Array<{ id: string; name: string }>;
}

export function PostForm({ mode, postId, initialData, projects = [] }: PostFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    tagsInput: initialData?.tagsInput || '',
    postType: initialData?.postType || 'manual',
    projectId: initialData?.projectId || '',
    published: initialData?.published || false,
    // Content categorization (Sprint 1)
    contentPillar: initialData?.contentPillar || '',
    postTypeEnum: initialData?.postTypeEnum || '',
    targetPersona: initialData?.targetPersona || '',
    phase: initialData?.phase || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save draft to localStorage (only in create mode)
  const autoSaveKey = mode === 'create' ? 'post-draft' : `post-draft-${postId}`;
  const { save: autoSave, restore, clear: clearDraft } = useAutoSave(
    autoSaveKey,
    formData,
    30000, // 30 seconds
    {
      enabled: true,
      onSave: () => setLastSaved(new Date()),
    }
  );

  // Restore draft on mount (create mode only)
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      const restored = restore();
      if (restored && restored.title) {
        const shouldRestore = confirm(
          'Found an unsaved draft. Would you like to restore it?'
        );
        if (shouldRestore) {
          setFormData(restored);
        } else {
          clearDraft();
        }
      }
    }
  }, [mode, initialData, restore, clearDraft]);

  const updateField = (field: keyof PostFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const result = PostFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (publish: boolean) => {
    // Set published status
    const dataToValidate = { ...formData, published: publish };
    setFormData(dataToValidate);

    // Validate
    const result = PostFormSchema.safeParse(dataToValidate);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setSaving(true);

    try {
      // Convert form data to API input
      const apiData = formDataToCreateInput(dataToValidate);

      // Auto-calculate read time
      const readTime = calculateReadTime(apiData.content);

      // Auto-generate excerpt if empty
      const excerpt = apiData.excerpt || generateExcerpt(apiData.content);

      const payload = {
        ...apiData,
        readTime,
        excerpt,
      };

      const url = mode === 'create'
        ? '/api/admin/posts'
        : `/api/admin/posts/${postId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();

        // Clear draft on successful save
        clearDraft();

        // Redirect to posts list or edit page
        if (mode === 'create') {
          router.push('/admin/content/posts');
        } else {
          router.refresh();
          alert('Post updated successfully!');
        }
      } else {
        const data = await res.json();
        alert(`Failed to save post: ${data.error}`);
      }
    } catch (error) {
      console.error('Post save error:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateExcerpt = (content: string): string => {
    // Remove markdown formatting
    let text = content;
    text = text.replace(/^#+\s+/gm, '');
    text = text.replace(/[*_`]/g, '');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    text = text.replace(/\n+/g, ' ');

    // Trim to 160 characters
    if (text.length > 160) {
      text = text.substring(0, 157) + '...';
    }

    return text.trim();
  };

  return (
    <div className="space-y-6">
      {/* Last saved indicator */}
      {lastSaved && (
        <div className="text-sm text-text-tertiary">
          Last auto-saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Title */}
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        placeholder="Enter post title..."
        error={errors.title}
        required
      />

      {/* Post Type and Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-2">
            Post Type
          </label>
          <select
            value={formData.postType}
            onChange={(e) => updateField('postType', e.target.value as PostType)}
            disabled={mode === 'edit'} // Cannot change post type after creation
            className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="manual">Manual Post</option>
            <option value="weekly-plan">Weekly Plan</option>
            {mode === 'edit' && <option value="daily-update">Daily Update</option>}
          </select>
          {mode === 'edit' && (
            <p className="mt-2 text-body-sm text-text-tertiary">
              Post type cannot be changed after creation
            </p>
          )}
        </div>

        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-2">
            Linked Project (optional)
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => updateField('projectId', e.target.value)}
            className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary"
          >
            <option value="">None</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <Input
        label="Tags (comma-separated)"
        value={formData.tagsInput}
        onChange={(e) => updateField('tagsInput', e.target.value)}
        placeholder="build-in-public, startup, ai"
        error={errors.tagsInput}
        helperText="Separate multiple tags with commas"
      />

      {/* Content Categorization (Sprint 1) */}
      <div className="border border-border-subtle rounded-lg p-4">
        <h3 className="text-body-sm font-semibold text-text-primary mb-4">
          Content Categorization (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Content Pillar */}
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-2">
              Content Pillar
            </label>
            <select
              value={formData.contentPillar}
              onChange={(e) => updateField('contentPillar', e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary"
            >
              <option value="">Not Set</option>
              <option value="JOURNEY">Journey (Build-in-public)</option>
              <option value="FRAMEWORK">Framework (Methodologies)</option>
              <option value="TOOL">Tool (Resources)</option>
              <option value="COMMUNITY">Community (Contributions)</option>
            </select>
          </div>

          {/* Post Type Enum */}
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-2">
              Content Type
            </label>
            <select
              value={formData.postTypeEnum}
              onChange={(e) => updateField('postTypeEnum', e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary"
            >
              <option value="">Not Set</option>
              <option value="PROGRESS_UPDATE">Progress Update</option>
              <option value="MILESTONE">Milestone</option>
              <option value="FAILURE">Failure / Lesson Learned</option>
              <option value="TUTORIAL">Tutorial</option>
              <option value="CASE_STUDY">Case Study</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          {/* Target Persona */}
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-2">
              Target Audience
            </label>
            <select
              value={formData.targetPersona}
              onChange={(e) => updateField('targetPersona', e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary"
            >
              <option value="">Not Set</option>
              <option value="CORPORATE_ESCAPIST">Corporate Escapists</option>
              <option value="SERVICE_PROVIDER">Service Providers</option>
              <option value="BUILDER">Technical Builders</option>
              <option value="ALL">Everyone</option>
            </select>
          </div>

          {/* Project Phase */}
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-2">
              Project Phase
            </label>
            <select
              value={formData.phase}
              onChange={(e) => updateField('phase', e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary"
            >
              <option value="">Not Set</option>
              <option value="IDEATION">Ideation</option>
              <option value="MVP">MVP</option>
              <option value="LAUNCH">Launch</option>
              <option value="GROWTH">Growth</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="ARCHIVED">Archived</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-caption text-text-tertiary">
          Categorization helps organize content for different audiences and project phases.
        </p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-body-sm font-medium text-text-primary mb-2">
          Content (Markdown)
        </label>
        <MarkdownEditor
          value={formData.content}
          onChange={(value) => updateField('content', value)}
        />
        {errors.content && (
          <p className="mt-2 text-body-sm text-error">{errors.content}</p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-body-sm font-medium text-text-primary mb-2">
          Excerpt (optional)
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => updateField('excerpt', e.target.value)}
          placeholder="Auto-generated from first 160 characters if left empty..."
          rows={3}
          className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary"
        />
        {errors.excerpt && (
          <p className="mt-2 text-body-sm text-error">{errors.excerpt}</p>
        )}
        <p className="mt-2 text-body-sm text-text-tertiary">
          Leave empty to auto-generate from content
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => handleSubmit(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>

          <Button
            variant="primary"
            onClick={() => handleSubmit(true)}
            disabled={saving}
          >
            {saving ? 'Publishing...' : 'Publish Now →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
