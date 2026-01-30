'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DailyUpdateGenerator } from '@/components/admin/DailyUpdateGenerator';
import { ProgressReportGenerator } from '@/components/admin/ProgressReportGenerator';
import { ContentPreviewModal } from '@/components/admin/ContentPreviewModal';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  postType: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  readTime: number;
  tags: string[];
}

type DeletingState = string | null;

export default function ContentPage() {
  const router = useRouter();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [preview, setPreview] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [deletingId, setDeletingId] = useState<DeletingState>(null);
  const [previewPostType, setPreviewPostType] = useState<'daily-update' | 'progress-report'>('daily-update');

  // Fetch recent posts on mount
  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await fetch('/api/admin/posts?limit=10', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setRecentPosts(data.data || []);
      }
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(post.id);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setRecentPosts((prev) => prev.filter((p) => p.id !== post.id));
      } else {
        const data = await res.json();
        alert(`Failed to delete post: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to delete post');
      console.error('Delete post error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleGeneratePreview = (generatedPreview: any) => {
    setPreview(generatedPreview);
    setPreviewPostType('daily-update');
    setShowPreviewModal(true);
  };

  const handleProgressReportPreview = (generatedPreview: any) => {
    setPreview(generatedPreview);
    setPreviewPostType('progress-report');
    setShowPreviewModal(true);
  };

  const handlePublish = async (data: { title: string; content: string; published: boolean }) => {
    try {
      setPublishError('');

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          excerpt: preview.excerpt,
          tags: preview.tags,
          readTime: preview.readTime,
          postType: previewPostType,
          published: data.published,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setShowPreviewModal(false);
        setPreview(null);

        // Refresh posts list
        await fetchRecentPosts();

        // Show success message
        const typeLabel = previewPostType === 'progress-report' ? 'Progress report' : 'Daily update';
        alert(data.published ? `${typeLabel} published!` : `${typeLabel} saved as draft!`);
      } else {
        const error = await res.json();
        setPublishError(error.error || 'Failed to publish');
      }
    } catch (err) {
      console.error('Publish error:', err);
      setPublishError('Failed to publish');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-display-md font-bold text-text-primary mb-2">Content</h2>
        <p className="text-body text-text-secondary">
          Create and manage blog posts and daily updates.
        </p>
      </div>

      {/* Main Content */}
      <div>
        <div className="space-y-8">
          {/* Manual Post Creation */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-heading-md font-semibold mb-2">✍️ Write Manual Post</h2>
                <p className="text-body text-text-secondary mb-6">
                  Create weekly plans, essays, or custom posts with markdown editor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/admin/content/new">
                <Button variant="primary">
                  New Manual Post →
                </Button>
              </Link>
              <Link href="/admin/content/posts">
                <Button variant="secondary">
                  Manage All Posts
                </Button>
              </Link>
            </div>
          </Card>

          {/* Divider */}
          <hr className="border-border-subtle" />

          {/* Recent Posts */}
          <div>
            <h2 className="text-heading-md font-semibold mb-4">Recent Posts</h2>

            {loadingPosts ? (
              <p className="text-body text-text-secondary">Loading posts...</p>
            ) : recentPosts.length === 0 ? (
              <Card>
                <p className="text-body text-text-secondary">No posts yet. Generate your first daily update!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <Card key={post.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-body-lg font-semibold">{post.title}</h3>
                          <Badge variant={post.published ? 'success' : 'warning'}>
                            {post.published ? 'Published' : 'Draft'}
                          </Badge>
                          {post.postType === 'daily-update' && (
                            <Badge variant="info">Daily Update</Badge>
                          )}
                          {post.postType === 'progress-report' && (
                            <Badge variant="info">Progress Report</Badge>
                          )}
                        </div>

                        <p className="text-body-sm text-text-secondary mb-2">{post.excerpt}</p>

                        <div className="flex items-center gap-4 text-body-sm text-text-tertiary">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>•</span>
                          <span>{post.readTime} min read</span>
                          <span>•</span>
                          <span>{post.tags.length} tag(s)</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => router.push(`/journey/${post.slug}`)}
                        >
                          View
                        </Button>
                        <Link href={`/admin/content/posts/${post.id}`}>
                          <Button variant="secondary">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeletePost(post)}
                          disabled={deletingId === post.id}
                          className="text-error hover:text-error"
                        >
                          {deletingId === post.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <hr className="border-border-subtle" />

          {/* Daily Update Generator */}
          <DailyUpdateGenerator onGenerate={handleGeneratePreview} />

          {/* Divider */}
          <hr className="border-border-subtle" />

          {/* Progress Report Generator */}
          <ProgressReportGenerator onGenerate={handleProgressReportPreview} />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && preview && (
        <ContentPreviewModal
          preview={preview}
          onClose={() => {
            setShowPreviewModal(false);
            setPublishError('');
          }}
          onPublish={handlePublish}
        />
      )}

      {/* Publish Error */}
      {publishError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
          <p className="text-body-sm text-red-800">{publishError}</p>
        </div>
      )}
    </section>
  );
}
