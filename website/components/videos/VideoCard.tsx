import Image from 'next/image';
import { Card } from '../ui/Card';
import { Calendar, Play } from 'lucide-react';
import type { Video } from '@/lib/videos';

interface VideoCardProps {
  video: Video;
  /** Larger treatment for the curated Featured row. */
  featured?: boolean;
}

/**
 * A video card links OUT to YouTube. There is no inline player, and that is a
 * deliberate trade (T-395): subscriptions and watch time happen on YouTube, and
 * the metric that matters is subscribed viewers. An embed would buy on-site
 * dwell time, which nobody is measuring, at the cost of the thing that is.
 *
 * The whole card is the link so the thumbnail, title and CTA are one target
 * rather than three, which matters most on a phone.
 */
export function VideoCard({ video, featured = false }: VideoCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(video.pubDate);

  return (
    <a
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg"
    >
      <Card hover className="flex flex-col h-full">
        <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4 -mt-2 bg-bg-surface-hover">
          {video.thumbnail && (
            <Image
              src={video.thumbnail}
              alt=""
              fill
              // Featured and latest sit in the same 3-up grid, so they resolve
              // to the same widths; `featured` only changes the title size.
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
          {/* Play affordance — the signal that this card is a video. Parked in
              the corner rather than centred: Jamie's thumbnails carry their own
              headline text, and a centred badge sat straight on top of it
              ("IT PHONED HOME." rendered as "IT PH(>)NED HOME."). Corner also
              beats hover-only, since a phone has no hover state. */}
          <span
            className="absolute bottom-2 right-2 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </span>
        </div>

        <span className="inline-flex self-start px-2 py-0.5 mb-2 text-[11px] font-semibold uppercase tracking-wide rounded bg-bg-surface-hover text-text-tertiary">
          Video
        </span>

        <h3
          className={`font-semibold text-text-primary mb-2 group-hover:text-brand-primary transition-base ${
            featured ? 'text-xl' : 'text-lg'
          }`}
        >
          {video.title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <span className="text-brand-primary group-hover:text-brand-primary-hover font-semibold text-sm transition-base inline-flex items-center gap-1 mt-auto">
          Watch on YouTube
          <span aria-hidden="true">→</span>
          <span className="sr-only"> (opens on YouTube in a new tab)</span>
        </span>
      </Card>
    </a>
  );
}
