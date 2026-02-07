import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on AI, solopreneurship, and building in public.',
};

const posts = [
  {
    slug: 'ai-cofounder',
    title: "The Best Co-Founder I've Ever Had Isn't Human",
    excerpt: "Someone left a comment on one of my LinkedIn posts last week that stopped me cold: 'You two are behaving like perfect co-founders.' They weren't talking about me and a business partner. They were talking about me and my AI agent.",
    date: '2025-02-07',
    readTime: '8 min read',
    tags: ['AI', 'co-founders', 'solopreneurs', 'build-in-public'],
  },
];

export default function BlogPage() {
  return (
    <section className="px-6 py-16 lg:py-24 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-display-lg font-bold text-text-primary mb-4">
          Blog
        </h1>
        <p className="text-body-lg text-text-secondary">
          Thoughts on AI, solopreneurship, and building in public.
        </p>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="bg-bg-surface border border-border-default rounded-lg p-6 hover:border-brand-primary/50 transition-base"
          >
            <Link href={`/blog/${post.slug}`} className="block group">
              <div className="flex items-center gap-3 text-body-sm text-text-tertiary mb-3">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-display-sm font-bold text-text-primary group-hover:text-brand-primary transition-base mb-3">
                {post.title}
              </h2>
              <p className="text-body text-text-secondary mb-4">
                {post.excerpt}
              </p>
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
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
