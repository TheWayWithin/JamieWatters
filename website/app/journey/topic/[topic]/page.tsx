import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPagedPosts } from '@/lib/database';
import { PostCard } from '@/components/blog/PostCard';
import { FeedFilterBar } from '@/components/blog/FeedFilterBar';
import { Button } from '@/components/ui/Button';
import {
  TOPICS,
  TOPIC_LABELS,
  TOPIC_DESCRIPTIONS,
  isTopic,
  isEditorialType,
} from '@/lib/taxonomy';
import { getSEOMetadata } from '@/lib/seo';
import { getBreadcrumbSchema, renderStructuredData } from '@/lib/structured-data';

export const revalidate = 3600; // 1 hour ISR

/** Pre-render one static page per topic. */
export function generateStaticParams() {
  return TOPICS.map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  if (!isTopic(topic)) return getSEOMetadata({ title: 'Topic', description: '', path: '/journey' });
  return getSEOMetadata({
    title: `${TOPIC_LABELS[topic]} — The Journey`,
    description: TOPIC_DESCRIPTIONS[topic],
    path: `/journey/topic/${topic}`,
  });
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const { topic } = await params;
  if (!isTopic(topic)) notFound();

  const { page: pageParam, type: typeParam } = await searchParams;
  const requestedPage = parseInt(pageParam ?? '1', 10) || 1;
  const activeType = typeParam && isEditorialType(typeParam) ? typeParam : undefined;

  const { posts, page, totalPages } = await getPagedPosts(requestedPage, 20, {
    topic,
    editorialType: activeType,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://jamiewatters.work' },
    { name: 'The Journey', url: 'https://jamiewatters.work/journey' },
    { name: TOPIC_LABELS[topic], url: `https://jamiewatters.work/journey/topic/${topic}` },
  ]);

  // Pagination links preserve topic (implicit in the path) + active type filter.
  const pageHref = (p: number) => {
    const qp = new URLSearchParams();
    if (activeType) qp.set('type', activeType);
    if (p > 1) qp.set('page', String(p));
    const qs = qp.toString();
    return qs ? `/journey/topic/${topic}?${qs}` : `/journey/topic/${topic}`;
  };

  return (
    <>
      {renderStructuredData(breadcrumbSchema)}

      <main className="min-h-screen bg-bg-primary">
        <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
          <nav className="text-sm text-text-tertiary mb-4">
            <Link href="/journey" className="hover:text-text-primary transition-base">
              The Journey
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-secondary">{TOPIC_LABELS[topic]}</span>
          </nav>
          <h1 className="text-display-xl font-bold text-text-primary mb-4">
            {TOPIC_LABELS[topic]}
          </h1>
          <p className="text-body-lg text-text-secondary max-w-2xl">
            {TOPIC_DESCRIPTIONS[topic]}
          </p>
        </section>

        <section className="px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
          <FeedFilterBar activeTopic={topic} activeType={activeType} />

          {posts.length === 0 ? (
            <p className="text-body text-text-secondary py-12 text-center">
              No {activeType ? `${activeType} ` : ''}posts under {TOPIC_LABELS[topic]} yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-12">
              {page > 1 ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={pageHref(page - 1)}>← Previous</Link>
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
                  <Link href={pageHref(page + 1)}>Next →</Link>
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
