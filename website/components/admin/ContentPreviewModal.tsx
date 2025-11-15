'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ContentPreviewModalProps {
  preview: {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    readTime: number;
    projects: Array<{
      projectId: string;
      projectName: string;
      githubUrl: string;
      completedTasks: string[];
      error?: string;
    }>;
  };
  onClose: () => void;
  onPublish: (data: { title: string; content: string; published: boolean }) => void;
}

export function ContentPreviewModal({ preview, onClose, onPublish }: ContentPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(preview.title);
  const [editedContent, setEditedContent] = useState(preview.content);
  const [publishing, setPublishing] = useState(false);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePublish = async (published: boolean) => {
    setPublishing(true);
    await onPublish({
      title: editedTitle,
      content: editedContent,
      published,
    });
    setPublishing(false);
  };

  // Calculate stats
  const totalTasks = preview.projects.reduce(
    (sum, p) => sum + p.completedTasks.length,
    0
  );
  const projectsWithTasks = preview.projects.filter(
    (p) => p.completedTasks.length > 0 && !p.error
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-bg-primary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-heading-lg font-bold">Preview Daily Update</h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Stats */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-body-sm text-text-secondary">
              <span className="font-medium">{projectsWithTasks}</span>
              <span>project(s)</span>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-text-secondary">
              <span className="font-medium">{totalTasks}</span>
              <span>task(s) completed</span>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-text-secondary">
              <span className="font-medium">{preview.readTime}</span>
              <span>min read</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6 flex flex-wrap gap-2">
            {preview.tags.map((tag) => (
              <Badge key={tag} variant="info">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Edit Toggle */}
          <div className="mb-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-body-sm text-brand-primary hover:underline"
            >
              {isEditing ? '👁️ Preview' : '✏️ Edit'}
            </button>
          </div>

          {/* Content Display/Edit */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-body-sm font-medium mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-body-sm font-medium mb-2">
                  Content (Markdown)
                </label>
                <textarea
                  id="content"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono text-body-sm"
                />
              </div>
            </div>
          ) : (
            <div className="prose prose-neutral max-w-none">
              {/* Render markdown preview */}
              <div className="bg-bg-secondary p-6 rounded-lg border border-border-subtle">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(editedContent),
                  }}
                />
              </div>
            </div>
          )}

          {/* Excerpt */}
          <div className="mt-6 p-4 bg-bg-secondary rounded-lg border border-border-subtle">
            <h3 className="text-body-sm font-semibold mb-2">Excerpt (for preview cards)</h3>
            <p className="text-body-sm text-text-secondary">{preview.excerpt}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between gap-4">
          <Button variant="secondary" onClick={onClose} disabled={publishing}>
            Cancel
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => handlePublish(false)}
              disabled={publishing}
            >
              {publishing ? 'Saving...' : 'Save as Draft'}
            </Button>

            <Button
              variant="primary"
              onClick={() => handlePublish(true)}
              disabled={publishing}
            >
              {publishing ? 'Publishing...' : 'Publish Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple markdown renderer (converts basic markdown to HTML)
 * For production, consider using a library like marked or remark
 */
function renderMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-primary hover:underline">$1</a>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-4 border-border-subtle" />');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up extra p tags around other block elements
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr)/g, '$1');
  html = html.replace(/(\/hr>)<\/p>/g, '$1');

  return html;
}
