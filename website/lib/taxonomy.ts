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

/** The two editorial types. Exactly one per post. */
export const EDITORIAL_TYPES = ['essay', 'build-log'] as const;
export type EditorialType = (typeof EDITORIAL_TYPES)[number];

export const EDITORIAL_TYPE_LABELS: Record<EditorialType, string> = {
  essay: 'Essay',
  'build-log': 'Build Log',
};

/** Default type for anything published without an explicit choice (jpub, backfill). */
export const DEFAULT_EDITORIAL_TYPE: EditorialType = 'build-log';

const EDITORIAL_TYPE_SET = new Set<string>(EDITORIAL_TYPES);

export function isEditorialType(value: string): value is EditorialType {
  return EDITORIAL_TYPE_SET.has(value);
}

/** Coerce any input to a valid editorial type, falling back to the default. */
export function normalizeEditorialType(value: string | null | undefined): EditorialType {
  return value && isEditorialType(value) ? value : DEFAULT_EDITORIAL_TYPE;
}
