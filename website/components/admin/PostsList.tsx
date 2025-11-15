'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Post {
  id: string;
  slug: string;
  title: string;
  postType: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface PostsListProps {
  posts: Post[];
  onDelete: (id: string, title: string) => void;
}

export function PostsList({ posts, onDelete }: PostsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(post.id);
    try {
      await onDelete(post.id, post.title);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPostTypeBadge = (postType: string) => {
    const types: Record<string, { label: string; variant: 'info' | 'success' | 'warning' }> = {
      'manual': { label: 'Manual', variant: 'info' },
      'daily-update': { label: 'Daily Update', variant: 'success' },
      'weekly-plan': { label: 'Weekly Plan', variant: 'warning' },
    };

    const type = types[postType] || { label: postType, variant: 'info' as const };
    return <Badge variant={type.variant} size="sm">{type.label}</Badge>;
  };

  if (posts.length === 0) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-lg p-12 text-center">
        <p className="text-body-lg text-text-secondary mb-4">No posts found</p>
        <Link href="/admin/content/new">
          <Button variant="primary">Create Your First Post</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-primary border-b border-border-default">
            <tr>
              <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">
                Title
              </th>
              <th className="text-center px-6 py-4 text-body-sm font-semibold text-text-primary">
                Type
              </th>
              <th className="text-center px-6 py-4 text-body-sm font-semibold text-text-primary">
                Status
              </th>
              <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">
                Published
              </th>
              <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">
                Project
              </th>
              <th className="text-right px-6 py-4 text-body-sm font-semibold text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border-subtle last:border-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-body font-medium text-text-primary">{post.title}</p>
                    <p className="text-body-sm text-text-tertiary">{post.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {getPostTypeBadge(post.postType)}
                </td>
                <td className="px-6 py-4 text-center">
                  {post.published ? (
                    <Badge variant="success" size="sm">Published</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Draft</Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-body-sm text-text-secondary">
                    {formatDate(post.publishedAt)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {post.project ? (
                    <Link
                      href={`/projects/${post.project.slug}`}
                      className="text-body-sm text-brand-primary hover:underline"
                    >
                      {post.project.name}
                    </Link>
                  ) : (
                    <span className="text-body-sm text-text-tertiary">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/content/posts/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post)}
                      disabled={deletingId === post.id}
                      className="text-error hover:text-error"
                    >
                      {deletingId === post.id ? 'Deleting...' : 'Delete'}
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
        {posts.map((post) => (
          <div key={post.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-body font-semibold text-text-primary">{post.title}</h3>
                <p className="text-body-sm text-text-tertiary">{post.slug}</p>
              </div>
              {post.published ? (
                <Badge variant="success" size="sm">Published</Badge>
              ) : (
                <Badge variant="warning" size="sm">Draft</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {getPostTypeBadge(post.postType)}
              {post.project && (
                <Link
                  href={`/projects/${post.project.slug}`}
                  className="text-body-sm text-brand-primary hover:underline"
                >
                  {post.project.name}
                </Link>
              )}
            </div>

            <div className="text-body-sm text-text-secondary">
              Published: {formatDate(post.publishedAt)}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link href={`/admin/content/posts/${post.id}`} className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  Edit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(post)}
                disabled={deletingId === post.id}
                className="text-error"
              >
                {deletingId === post.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
