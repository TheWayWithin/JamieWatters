import type { Metadata } from 'next';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { getPagedPosts } from '@/lib/database';
import { PostCard } from '@/components/blog/PostCard';
import { Button } from '@/components/ui/Button';
import {
  getBreadcrumbSchema,
  renderStructuredData,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'The Journey',
  description:
    'Weekly updates on building AI-powered businesses as a solo operator. Wins, failures, and lessons learned — all shared transparently.',
  openGraph: {
    title: 'The Journey | Jamie Watters',
    description:
      'Weekly updates on building AI-powered businesses as a solo operator. Wins, failures, and lessons learned — all shared transparently.',
  },
};

export const revalidate = 3600; // 1 hour ISR

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = parseInt(pageParam ?? '1', 10) || 1;
  const { posts, page, totalPages } = await getPagedPosts(requestedPage, 20);

  // Generate breadcrumb structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://jamiewatters.work' },
    { name: 'The Journey', url: 'https://jamiewatters.work/journey' },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      {renderStructuredData(breadcrumbSchema)}

      <main className="min-h-screen bg-bg-primary">
      {/* Page Header */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-text-primary mb-4">
          The Journey
        </h1>
        <p className="text-body-lg sm:text-body-lg text-text-secondary max-w-2xl mb-6">
          Field reports from building with AI in public. What's working, what isn't, and what it
          cost me. Open numbers, the failures before the wins.
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-12">
            {page > 1 ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={page - 1 === 1 ? '/journey' : `/journey?page=${page - 1}`}>
                  ← Previous
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                ← Previous
              </Button>
            )}
            <span className="text-body text-text-secondary">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/journey?page=${page + 1}`}>Next →</Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                Next →
              </Button>
            )}
          </div>
        )}
      </section>
      </main>
    </>
  );
}
