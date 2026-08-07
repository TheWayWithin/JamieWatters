import Link from 'next/link';
import Image from 'next/image';
import { Card } from '../ui/Card';
import { Calendar, Clock, Play } from 'lucide-react';
import type { PostListItem } from '@/lib/database';
import { renderMarkdown } from '@/lib/markdown';
import { use } from 'react';
import {
  isTopic,
  TOPIC_LABELS,
  isEditorialType,
  EDITORIAL_TYPE_LABELS,
  type EditorialType,
} from '@/lib/taxonomy';
import { videoIdFromSlug, watchUrl } from '@/lib/youtube-feed.mjs';

interface PostCardProps {
  post: PostListItem;
}

export function PostCard({ post }: PostCardProps) {
  // A video entry is still a post row, but three things about a written post are
  // wrong for it (T-401): "min read" measures the wrong thing, "Read More" is
  // not what you do with it, and /journey/{slug} is not where it lives. The id
  // comes off the slug, so no extra column and no second fetch — see
  // videoSlug() in lib/youtube-feed.mjs for why the slug carries it.
  const videoId = post.editorialType === 'video' ? videoIdFromSlug(post.slug) : null;
  const isVideo = Boolean(videoId);
  const href = videoId ? watchUrl(videoId) : `/journey/${post.slug}`;

  // Suppress the badge on a row that claims to be a video but carries no video
  // id in its slug. It would read "Video" while the card below still said "Read
  // More" and linked to /journey, which is worse than no badge at all. The admin
  // form no longer offers 'video', so this only guards rows written straight
  // through the API.
  const showTypeBadge =
    Boolean(post.editorialType) &&
    isEditorialType(post.editorialType as string) &&
    !(post.editorialType === 'video' && !isVideo);
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
          {/* Same corner play badge as the /videos cards, for the same reason:
              centred, it sits on top of the thumbnail's own headline text. */}
          {isVideo && (
            <span
              className="absolute bottom-2 right-2 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm shadow-lg"
              aria-hidden="true"
            >
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </span>
          )}
        </div>
      )}

      {/* Editorial type badge */}
      {showTypeBadge && (
        <span className="inline-flex self-start px-2 py-0.5 mb-2 text-[11px] font-semibold uppercase tracking-wide rounded bg-bg-surface-hover text-text-tertiary">
          {EDITORIAL_TYPE_LABELS[post.editorialType as EditorialType]}
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
          {/* A video's runtime is not in the Atom feed, and "0 min read" on a
              video is worse than saying nothing. */}
          <span>{isVideo ? 'Watch' : `${post.readTime} min read`}</span>
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

      {/* Read More / Watch. A video leaves the site for YouTube, so it is a
          plain anchor with the usual new-tab safety rather than a next/link
          client transition. */}
      {isVideo ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary hover:text-brand-primary-hover font-semibold text-sm transition-base inline-flex items-center gap-1 mt-auto"
        >
          Watch on YouTube
          <span aria-hidden="true">→</span>
          <span className="sr-only"> (opens on YouTube in a new tab)</span>
        </a>
      ) : (
        <Link
          href={href}
          className="text-brand-primary hover:text-brand-primary-hover font-semibold text-sm transition-base inline-flex items-center gap-1 mt-auto"
        >
          Read More
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </Card>
  );
}
