import Link from 'next/link';
import Image from 'next/image';
import { Card } from '../ui/Card';
import { Calendar, Clock } from 'lucide-react';
import type { PostListItem } from '@/lib/database';
import { renderMarkdown } from '@/lib/markdown';
import { use } from 'react';
import { isTopic, TOPIC_LABELS, isEditorialType, EDITORIAL_TYPE_LABELS } from '@/lib/taxonomy';

interface PostCardProps {
  post: PostListItem;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(post.publishedAt || post.createdAt);

  // Render excerpt as markdown HTML
  const excerptHtml = use(renderMarkdown(post.excerpt));

  return (
    <Card hover className="flex flex-col h-full">
      {post.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md mb-4 -mt-2">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Editorial type badge */}
      {post.editorialType && isEditorialType(post.editorialType) && (
        <span className="inline-flex self-start px-2 py-0.5 mb-2 text-[11px] font-semibold uppercase tracking-wide rounded bg-bg-surface-hover text-text-tertiary">
          {EDITORIAL_TYPE_LABELS[post.editorialType]}
        </span>
      )}

      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {post.title}
      </h3>

      <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{post.readTime} min read</span>
        </div>
      </div>

      <div
        className="markdown-excerpt mb-4 flex-1"
        dangerouslySetInnerHTML={{ __html: excerptHtml }}
      />

      {/* Topics — clean controlled facets, linked to their topic pages */}
      {post.topics.filter(isTopic).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.topics.filter(isTopic).map((topic) => (
            <Link
              key={topic}
              href={`/journey/topic/${topic}`}
              className="px-2 py-1 text-xs font-medium bg-bg-surface-hover text-text-secondary rounded hover:text-brand-primary transition-base"
            >
              {TOPIC_LABELS[topic]}
            </Link>
          ))}
        </div>
      )}

      {/* Read More Link */}
      <Link
        href={`/journey/${post.slug}`}
        className="text-brand-primary hover:text-brand-primary-hover font-semibold text-sm transition-base inline-flex items-center gap-1 mt-auto"
      >
        Read More
        <span aria-hidden="true">→</span>
      </Link>
    </Card>
  );
}
