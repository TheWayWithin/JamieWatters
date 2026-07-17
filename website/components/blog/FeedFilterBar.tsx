import Link from 'next/link';
import { TOPICS, TOPIC_LABELS, EDITORIAL_TYPES, EDITORIAL_TYPE_LABELS } from '@/lib/taxonomy';

interface FeedFilterBarProps {
  /** Currently-active topic slug, if any. */
  activeTopic?: string;
  /** Currently-active editorial type, if any. */
  activeType?: string;
}

/**
 * Topic + type facets for the unified feed. Pure links (server-rendered): each
 * chip points at /journey with the relevant query param, so filtering needs no
 * client JS. Topic chips deep-link to the SEO topic pages (/journey/topic/x).
 */
export function FeedFilterBar({ activeTopic, activeType }: FeedFilterBarProps) {
  const typeHref = (type: string) => {
    const params = new URLSearchParams();
    if (activeTopic) params.set('topic', activeTopic);
    if (activeType !== type) params.set('type', type);
    const qs = params.toString();
    return qs ? `/journey?${qs}` : '/journey';
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-full border transition-base ${
      active
        ? 'bg-brand-primary text-white border-brand-primary'
        : 'bg-bg-surface text-text-secondary border-border hover:border-brand-primary hover:text-text-primary'
    }`;

  return (
    <div className="flex flex-col gap-3 mb-10">
      {/* Topics */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/journey" className={chip(!activeTopic)}>
          All topics
        </Link>
        {TOPICS.map((topic) => (
          <Link
            key={topic}
            href={`/journey/topic/${topic}`}
            className={chip(activeTopic === topic)}
          >
            {TOPIC_LABELS[topic]}
          </Link>
        ))}
      </div>

      {/* Editorial type */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-text-tertiary mr-1">Type</span>
        {EDITORIAL_TYPES.map((type) => (
          <Link key={type} href={typeHref(type)} className={chip(activeType === type)}>
            {EDITORIAL_TYPE_LABELS[type]}
          </Link>
        ))}
      </div>
    </div>
  );
}
