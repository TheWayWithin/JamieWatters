import Link from 'next/link';
import { Rss } from 'lucide-react';
import { getAllPosts } from '@/lib/database';
import { PostCard } from '@/components/blog/PostCard';
import { Button } from '@/components/ui/Button';

export const revalidate = 3600; // 1 hour ISR

export default async function JourneyPage() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Page Header */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-brand-primary mb-4">
          The Journey
        </h1>
        <p className="text-body-lg sm:text-body-lg text-text-secondary max-w-2xl mb-6">
          Weekly updates on building a billion-dollar portfolio as a solo operator. Wins, failures,
          lessons learned—all shared transparently.
        </p>

        {/* RSS Link */}
        <Button variant="ghost" size="sm" asChild>
          <a
            href="/api/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Rss className="w-4 h-4" />
            Subscribe via RSS
          </a>
        </Button>
      </section>

      {/* Blog Posts Grid */}
      <section className="px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination placeholder (for future when there are >10 posts) */}
        {posts.length > 10 && (
          <div className="flex items-center justify-center gap-6 mt-12">
            <Button variant="ghost" size="sm" disabled>
              ← Previous
            </Button>
            <span className="text-body text-text-secondary">
              Page 1 of 1
            </span>
            <Button variant="ghost" size="sm" disabled>
              Next →
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
