/**
 * Content taxonomy — the single source of truth for the unified field-report feed.
 *
 * Two independent facets (PRJ-18 Wave 3, decision D1):
 *   - topic: WHAT a post is about (1-2 per post, from a fixed set of 7)
 *   - editorial type: essay vs build-log (exactly one)
 *
 * These are deliberately separate from the legacy `postType`
 * (manual | daily-update | weekly-plan — how a post was created) and from the
 * Sprint-1 `contentPillar` / `postTypeEnum` / `targetPersona` marketing axes,
 * which remain untouched.
 */

/** The 7 controlled topics. Order here is the order used in filter UIs. */
export const TOPICS = [
  'ai',
  'ai-search',
  'building',
  'open-source',
  'trading',
  'thinking',
  'business',
] as const;

export type Topic = (typeof TOPICS)[number];

/** Human-facing labels for each topic (used in chips, filters, topic pages). */
export const TOPIC_LABELS: Record<Topic, string> = {
  ai: 'AI',
  'ai-search': 'AI Search',
  building: 'Building',
  'open-source': 'Open Source',
  trading: 'Trading',
  thinking: 'Thinking',
  business: 'Business',
};

/** One-line descriptions for topic-page headers and meta descriptions. */
export const TOPIC_DESCRIPTIONS: Record<Topic, string> = {
  ai: 'Working with AI, building with it, and thinking about where it goes.',
  'ai-search': 'Getting found in an AI-first search world: the AI Search Mastery work.',
  building: 'Shipping products solo: the craft, the stack, the decisions.',
  'open-source': 'Building in the open: what I am releasing and why.',
  trading: 'The trading system: models, guardrails, and what the market teaches.',
  thinking: 'Philosophy, life skills, and the inner work behind the building.',
  business: 'Strategy, revenue, and the honest arc of the journey.',
};

const TOPIC_SET = new Set<string>(TOPICS);

/** True if a raw string is one of the 7 controlled topics. */
export function isTopic(value: string): value is Topic {
  return TOPIC_SET.has(value);
}

/** Keep only valid topics, de-duplicated, capped at 2 (the per-post limit). */
export function normalizeTopics(values: readonly string[]): Topic[] {
  const seen = new Set<Topic>();
  for (const v of values) {
    if (isTopic(v)) seen.add(v);
    if (seen.size >= 2) break;
  }
  return [...seen];
}

/**
 * The editorial types. Exactly one per post.
 *
 * 'video' joined the two written types on 2026-08-06 (T-401), when published
 * YouTube videos became first-class entries in the feed. It is a real member of
 * the vocabulary rather than a special case: FeedFilterBar renders a chip per
 * entry here, so a "Video" filter appears on /journey for free, and PostCard
 * reads the same list for its badge. A video is a different KIND of field
 * report, not a different topic, which is why it belongs on this axis.
 */
export const EDITORIAL_TYPES = ['essay', 'build-log', 'video'] as const;
export type EditorialType = (typeof EDITORIAL_TYPES)[number];

export const EDITORIAL_TYPE_LABELS: Record<EditorialType, string> = {
  essay: 'Essay',
  'build-log': 'Build Log',
  video: 'Video',
};

/** Default type for anything published without an explicit choice (jpub, backfill). */
export const DEFAULT_EDITORIAL_TYPE: EditorialType = 'build-log';

/**
 * The types a human may choose in the admin form.
 *
 * 'video' is excluded because it is MACHINE-SET, by
 * scripts/videos/publish-videos.mjs, and it is only coherent alongside a
 * `video-<id>` slug. Offering it in a free dropdown let any written post be
 * labelled Video, which produced a genuinely contradictory row: the card showed
 * a Video badge (driven by editorialType) while still saying "Read More" and
 * linking to /journey (driven by the slug, which had no video id in it), and
 * the post then polluted the Video filter on /journey. Narrowing the choice
 * fixes that at the source rather than papering over it in the components.
 */
export const AUTHORABLE_EDITORIAL_TYPES = EDITORIAL_TYPES.filter(
  (t) => t !== 'video'
) as readonly EditorialType[];

const EDITORIAL_TYPE_SET = new Set<string>(EDITORIAL_TYPES);

export function isEditorialType(value: string): value is EditorialType {
  return EDITORIAL_TYPE_SET.has(value);
}

/** Coerce any input to a valid editorial type, falling back to the default. */
export function normalizeEditorialType(value: string | null | undefined): EditorialType {
  return value && isEditorialType(value) ? value : DEFAULT_EDITORIAL_TYPE;
}
