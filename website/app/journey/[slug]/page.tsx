import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug, getPostSlugs } from '@/lib/database';
import { renderMarkdown } from '@/lib/markdown';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShareButtons } from '@/components/blog/ShareButtons';
import {
  getBlogPostSchema,
  getBreadcrumbSchema,
  renderStructuredData,
} from '@/lib/structured-data';

// Generate static params for all posts (SSG)
export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for each blog post (for social sharing)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const postUrl = `https://jamiewatters.work/journey/${slug}`;
  const ogImage = 'https://jamiewatters.work/og-image.png';

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      type: 'article',
      publishedTime: (post.publishedAt || post.createdAt).toISOString(),
      authors: ['Jamie Watters'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  
  // Input validation
  if (!slug || typeof slug !== 'string' || slug.length > 100) {
    notFound();
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get post index for navigation
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const previousPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // Format date
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  // Use actual post content from database, with fallback to placeholder for legacy posts
  const placeholderContent = `# ${post.title}

${post.excerpt}

This is a placeholder content until the full markdown content system is implemented. The blog post metadata is now stored in the database, but the full content needs to be implemented as markdown files or stored as longform content in the database.

## Next Steps

1. Implement markdown file storage
2. Or extend the database schema to store full content
3. Connect the content rendering system

For now, this shows that the database integration is working correctly for post metadata.`;

  // Use post.content if available, otherwise fall back to placeholder
  const contentToRender = post.content || placeholderContent;

  // Render markdown content to HTML
  const contentHtml = await renderMarkdown(contentToRender);

  // Generate structured data for SEO
  const blogPostSchema = getBlogPostSchema(post, contentToRender);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://jamiewatters.work' },
    { name: 'The Journey', url: 'https://jamiewatters.work/journey' },
    { name: post.title, url: `https://jamiewatters.work/journey/${post.slug}` },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      {renderStructuredData(blogPostSchema)}
      {renderStructuredData(breadcrumbSchema)}

      <main className="min-h-screen bg-bg-primary">
      {/* Post Header */}
      <article className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-3xl mx-auto">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-brand-primary mb-6">
          {post.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-caption text-text-tertiary mb-6">
          <span>Published: {formattedDate}</span>
          <span>•</span>
          <span>{post.readTime} min read</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="frontend" size="sm">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Post Content - Rendered Markdown with Syntax Highlighting */}
        <div
          className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-brand-secondary prose-a:hover:text-brand-primary prose-strong:text-text-primary prose-code:text-brand-accent prose-code:bg-bg-surface prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-bg-surface prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:p-4 prose-ul:text-text-primary prose-ol:text-text-primary prose-li:text-text-secondary"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      {/* Social Share Section */}
      <section className="px-6 py-12 sm:py-16 border-t border-border-subtle max-w-3xl mx-auto">
        <h3 className="text-display-sm font-semibold text-text-primary mb-6 text-center">
          Share this post
        </h3>
        <div className="flex justify-center">
          <ShareButtons title={post.title} slug={post.slug} />
        </div>
      </section>

      {/* Post Navigation */}
      <section className="px-6 py-12 sm:py-16 border-t border-border-subtle max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Previous Post */}
          {previousPost ? (
            <Link
              href={`/journey/${previousPost.slug}`}
              className="bg-bg-surface border border-border-default rounded-lg p-6 hover:border-border-emphasis hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-caption text-text-tertiary mb-2">
                ← Previous Post
              </div>
              <h4 className="text-body font-semibold text-brand-secondary group-hover:underline mb-2">
                {previousPost.title}
              </h4>
              <p className="text-body-sm text-text-secondary line-clamp-2">
                {previousPost.excerpt}
              </p>
            </Link>
          ) : (
            <div></div>
          )}

          {/* Next Post */}
          {nextPost ? (
            <Link
              href={`/journey/${nextPost.slug}`}
              className="bg-bg-surface border border-border-default rounded-lg p-6 hover:border-border-emphasis hover:shadow-lg transition-all duration-300 group sm:text-right"
            >
              <div className="text-caption text-text-tertiary mb-2">
                Next Post →
              </div>
              <h4 className="text-body font-semibold text-brand-secondary group-hover:underline mb-2">
                {nextPost.title}
              </h4>
              <p className="text-body-sm text-text-secondary line-clamp-2">
                {nextPost.excerpt}
              </p>
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Back to blog */}
        <div className="text-center mt-12">
          <Button variant="ghost" size="md" asChild>
            <Link href="/journey">
              ← Back to all posts
            </Link>
          </Button>
        </div>
      </section>
      </main>
    </>
  );
}
