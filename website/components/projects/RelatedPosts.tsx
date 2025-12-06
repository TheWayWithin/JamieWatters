'use client';

import Link from 'next/link';
import { ContentPillar, PostTypeEnum, ProjectPhase } from '@prisma/client';

// Post data structure for related posts display
export interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: number;
  publishedAt: Date | null;
  contentPillar?: ContentPillar | null;
  postTypeEnum?: PostTypeEnum | null;
  phase?: ProjectPhase | null;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  projectName: string;
  limit?: number;
}

const pillarLabels: Record<ContentPillar, string> = {
  JOURNEY: 'Journey',
  FRAMEWORK: 'Framework',
  TOOL: 'Tool',
  COMMUNITY: 'Community',
};

const pillarColors: Record<ContentPillar, string> = {
  JOURNEY: 'bg-blue-500/15 text-blue-400',
  FRAMEWORK: 'bg-purple-500/15 text-purple-400',
  TOOL: 'bg-green-500/15 text-green-400',
  COMMUNITY: 'bg-amber-500/15 text-amber-400',
};

const postTypeLabels: Record<PostTypeEnum, string> = {
  PROGRESS_UPDATE: 'Progress',
  MILESTONE: 'Milestone',
  FAILURE: 'Lesson',
  TUTORIAL: 'Tutorial',
  CASE_STUDY: 'Case Study',
  GENERAL: 'Post',
};

const postTypeColors: Record<PostTypeEnum, string> = {
  PROGRESS_UPDATE: 'bg-cyan-500/15 text-cyan-400',
  MILESTONE: 'bg-green-500/15 text-green-400',
  FAILURE: 'bg-red-500/15 text-red-400',
  TUTORIAL: 'bg-violet-500/15 text-violet-400',
  CASE_STUDY: 'bg-indigo-500/15 text-indigo-400',
  GENERAL: 'bg-gray-500/15 text-gray-400',
};

export function RelatedPosts({ posts, projectName, limit = 5 }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-tertiary">
          No posts yet for {projectName}. Check back soon!
        </p>
      </div>
    );
  }

  const displayPosts = posts.slice(0, limit);
  const hasMore = posts.length > limit;

  return (
    <div className="space-y-4">
      {displayPosts.map((post) => (
        <Link
          key={post.id}
          href={`/journey/${post.slug}`}
          className="block group"
        >
          <article className="bg-bg-surface border border-border-default rounded-lg p-4 transition-all hover:border-border-emphasis hover:shadow-md">
            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 mb-2">
              {post.postTypeEnum && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${postTypeColors[post.postTypeEnum]}`}
                >
                  {postTypeLabels[post.postTypeEnum]}
                </span>
              )}
              {post.contentPillar && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${pillarColors[post.contentPillar]}`}
                >
                  {pillarLabels[post.contentPillar]}
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className="text-base font-semibold text-text-primary group-hover:text-brand-primary transition-colors mb-1">
              {post.title}
            </h4>

            {/* Excerpt */}
            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              {post.publishedAt && (
                <time>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              )}
              <span>•</span>
              <span>{post.readTime} min read</span>
            </div>
          </article>
        </Link>
      ))}

      {/* Show More Link */}
      {hasMore && (
        <div className="text-center pt-4">
          <Link
            href={`/journey?project=${encodeURIComponent(projectName)}`}
            className="text-sm text-brand-secondary hover:text-brand-primary transition-colors"
          >
            View all {posts.length} posts →
          </Link>
        </div>
      )}
    </div>
  );
}
