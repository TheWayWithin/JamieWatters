'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PostsFilter, type FilterType } from '@/components/admin/PostsFilter';
import { PostsList } from '@/components/admin/PostsList';

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

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/posts', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data.data || []);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        // Remove from local state
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(`Failed to delete post: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to delete post');
      console.error('Delete post error:', err);
    }
  };

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Apply filter
    if (currentFilter === 'published') {
      result = result.filter((p) => p.published);
    } else if (currentFilter === 'drafts') {
      result = result.filter((p) => !p.published);
    } else if (currentFilter === 'daily-update' || currentFilter === 'manual' || currentFilter === 'weekly-plan') {
      result = result.filter((p) => p.postType === currentFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query)
      );
    }

    return result;
  }, [posts, currentFilter, searchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <header className="px-6 py-4 border-b border-border-subtle">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-display-sm font-bold text-brand-primary">All Posts</h1>
          </div>
        </header>
        <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
          <p className="text-body text-text-secondary">Loading posts...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <header className="px-6 py-4 border-b border-border-subtle">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-display-sm font-bold text-brand-primary">All Posts</h1>
          </div>
        </header>
        <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
          <p className="text-body text-error">{error}</p>
          <Button variant="primary" onClick={fetchPosts} className="mt-4">
            Retry
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-display-sm font-bold text-brand-primary">All Posts</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/content">
              <Button variant="ghost" size="sm">
                Back to Content
              </Button>
            </Link>
            <Link href="/admin/content/new">
              <Button variant="primary" size="sm">
                + Create Post
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
        <div className="mb-6">
          <p className="text-body-lg text-text-secondary">
            Manage your blog posts. Total: {posts.length} | Showing: {filteredPosts.length}
          </p>
        </div>

        {/* Filter and Search */}
        <PostsFilter
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Posts List */}
        <PostsList posts={filteredPosts} onDelete={handleDelete} />
      </section>
    </main>
  );
}
