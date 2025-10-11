import Link from 'next/link';
import { Card } from '../ui/Card';
import { Calendar, Clock } from 'lucide-react';
import type { PostWithMetadata } from '@/lib/database';

interface PostCardProps {
  post: PostWithMetadata;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(post.publishedAt);

  return (
    <Card hover className="flex flex-col h-full">
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

      <p className="text-text-secondary text-sm mb-4 flex-1">
        {post.excerpt}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs font-medium bg-brand-primary/15 text-brand-primary rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

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
