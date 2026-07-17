import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPostBySlug, getBlogSlugs } from '@/lib/blog';
import { renderMarkdown } from '@/lib/markdown';
import { formatReadTime } from '@/lib/read-time-calculator';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { getSEOMetadata, SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Not Found' };
  }

  const heroImageUrl = post.image
    ? post.image.startsWith('http')
      ? post.image
      : `${SITE_URL}${post.image}`
    : null;

  const ogImage = heroImageUrl
    ? { url: heroImageUrl, width: 1600, height: 900, alt: post.imageAlt || post.title }
    : {
        url: `${SITE_URL}/og?type=post&title=${encodeURIComponent(post.title)}`,
        width: 1200,
        height: 630,
        alt: post.title,
      };

  return getSEOMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.date,
    image: ogImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const contentHtml = await renderMarkdown(post.content);

  return (
    <article className="px-6 py-16 lg:py-24 max-w-3xl mx-auto">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-body-sm text-brand-secondary hover:text-brand-primary transition-base mb-8"
      >
        ← Back to Blog
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 text-body-sm text-text-tertiary mb-4">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>•</span>
          <span>{formatReadTime(post.readTime)}</span>
        </div>
        <h1 className="text-display-lg font-bold text-text-primary mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-body-sm bg-bg-tertiary text-text-secondary rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {post.image && (
        <figure className="mb-12 -mx-6 sm:mx-0">
          <div className="relative aspect-[16/9] w-full overflow-hidden sm:rounded-lg">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </figure>
      )}

      <div
        className="prose prose-invert prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-brand-secondary prose-a:hover:text-brand-primary prose-strong:text-text-primary prose-code:text-brand-accent prose-code:bg-bg-surface prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-bg-surface prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:p-4 prose-ul:text-text-primary prose-ol:text-text-primary prose-li:text-text-secondary"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {process.env.BUTTONDOWN_API_KEY && (
        <div className="mt-12">
          <NewsletterSignup variant="inline" />
        </div>
      )}

      <footer className="mt-12 pt-8 border-t border-border-default">
        <p className="text-body text-text-secondary italic">
          I&apos;m Jamie. I build with AI in the open and give it away, then write up what actually held and what didn&apos;t — real numbers, the failures louder than the wins. Systems programmer since &apos;85, four books published, more creative at 57 than at 25. The man in the water finding out what holds up, not selling theory from the beach.
          Follow along at{' '}
          <Link href="/" className="text-brand-primary hover:text-brand-primary-hover transition-base">
            jamiewatters.work
          </Link>.
        </p>
      </footer>
    </article>
  );
}
