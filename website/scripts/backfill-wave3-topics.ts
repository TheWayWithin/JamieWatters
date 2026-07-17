/**
 * PRJ-18 Wave 3 T2 — backfill the unified-feed facets on existing posts.
 *
 * For every Post: derive `topics` (controlled 7-vocab) from its free-form
 * `tags`, and set `editorialType` (default 'build-log'). Idempotent.
 *
 * SAFE BY DEFAULT: dry-run prints a full report and writes NOTHING. Pass
 * `--apply` to persist. Pass `--force-topics` to overwrite topics that a prior
 * run/hand-edit already set (default: only fill posts whose topics are empty).
 *
 *   npx tsx scripts/backfill-wave3-topics.ts            # dry-run report
 *   npx tsx scripts/backfill-wave3-topics.ts --apply    # write
 *
 * The tag→topic map below is grounded in the actual tag distribution across the
 * 184 posts (2026-07-17). Unmapped tags contribute no topic — a post with only
 * unmapped tags gets zero topics (still shows in the main chronological feed,
 * just not under a topic filter) and is listed for hand-tagging via the admin
 * editor (T6). Ambiguous clusters are called out in AMBIGUOUS below.
 */

import { prisma } from '../lib/prisma';
import {
  TOPICS,
  type Topic,
  isTopic,
  DEFAULT_EDITORIAL_TYPE,
  type EditorialType,
} from '../lib/taxonomy';

const APPLY = process.argv.includes('--apply');
const FORCE_TOPICS = process.argv.includes('--force-topics');

/**
 * Free-form tag (lowercased) → controlled topic. High-confidence only.
 * A tag absent here contributes nothing.
 */
const TAG_TO_TOPIC: Record<string, Topic> = {
  // --- trading ---
  crypto: 'trading',
  'trader-7': 'trading',
  trader7: 'trading',
  trading: 'trading',
  algotrading: 'trading',
  'algo-trading': 'trading',
  'algorithmic-trading': 'trading',
  'llm trading': 'trading',
  'llm-trading': 'trading',
  'ai-trading': 'trading',
  'ai trading': 'trading',
  'paper-trading': 'trading',
  tradingbot: 'trading',
  'trading bot': 'trading',
  'trading strategies': 'trading',
  'risk-management': 'trading',
  perpetuals: 'trading',
  'coinbase perpetuals': 'trading',
  'spot vs perpetauls': 'trading',
  markets: 'trading',
  modeloptix: 'trading',

  // --- ai ---
  ai: 'ai',
  'ai-agents': 'ai',
  'ai-agent': 'ai',
  'ai agent': 'ai',
  agent: 'ai',
  agents: 'ai',
  'agent-11': 'ai',
  'claude code': 'ai',
  claudecode: 'ai',
  llm: 'ai',
  'llm models': 'ai',
  'which llm': 'ai',
  'chain of thought': 'ai',
  grok42: 'ai',
  'grok4.2': 'ai',
  'opus 4.5 orchestration': 'ai',
  'prompt-injection': 'ai',
  'token optimization': 'ai',
  'human-ai-collaboration': 'ai',
  // Jamie's AI agents — the story is building-with-AI + process, not trading
  clawdbot: 'ai',
  openclaw: 'ai',

  // --- ai-search ---
  'ai-search': 'ai-search',
  'ai search': 'ai-search',
  'ai search optimization': 'ai-search',
  seo: 'ai-search',
  geo: 'ai-search',
  'llms.txt': 'ai-search',
  llmtxtmastery: 'ai-search',
  aisearcharena: 'ai-search',
  benchmark: 'ai-search',
  'fools-gold': 'ai-search',
  aicontent: 'ai-search',

  // --- building ---
  'build-in-public': 'building',
  buildinpublic: 'building',
  'build in public': 'building',
  'building-in-public': 'building',
  building: 'building',
  solopreneur: 'building',
  soloprenuer: 'building',
  development: 'building',
  saas: 'building',
  'saas boilerplate': 'building',
  'saas launch': 'building',
  'saas market': 'building',
  architecture: 'building',
  systemdesign: 'building',
  systems: 'building',
  nextjs: 'building',
  'tech-stack': 'building',
  'web-development': 'building',
  'software-engineering': 'building',
  testing: 'building',
  debugging: 'building',
  'bug-fix': 'building',
  api: 'building',
  automation: 'building',
  stripe: 'building',
  security: 'building',
  verification: 'building',
  refactoring: 'building',
  // ISOTracker — a product Jamie built (interstellar-object tracker)
  'iso tracker': 'building',
  iso: 'building',
  'interstellar object': 'building',
  'interstellar objects': 'building',
  '3i-atlas': 'building',

  // --- thinking ---
  philosophy: 'thinking',
  writing: 'thinking',
  truth: 'thinking',
  trust: 'thinking',
  adhd: 'thinking',
  'lessons-learned': 'thinking',
  postmortem: 'thinking',
  'multi-tasking': 'thinking',
  'second-brain': 'thinking',

  // --- business ---
  pricing: 'business',
  tiers: 'business',
  marketing: 'business',
  'marketing physics': 'business',
  strategy: 'business',
  startup: 'business',
  'cost-optimization': 'business',
  'social-media': 'business',
  email: 'business',
  'compound growth': 'business',

  // NOTE: no high-confidence 'open-source' tags exist in the current corpus.
  // open-source starts empty and grows from new posts (Jamie's OS push).
};

/**
 * When a post maps to >2 topics, keep the 2 highest-priority. Niche/specific
 * topics win over the catch-alls ('ai', 'building'), so a post tagged both
 * "ai" and "trading" keeps trading.
 */
const TOPIC_PRIORITY: Topic[] = [
  'ai-search',
  'trading',
  'open-source',
  'thinking',
  'business',
  'ai',
  'building',
];

/** Tags that flag a post as an essay CANDIDATE for the report (noisy on purpose). */
const ESSAY_SIGNAL_TAGS = new Set([
  'philosophy',
  'writing',
  'truth',
  'trust',
  'lessons-learned',
]);

/**
 * Posts Jamie confirmed as essays (2026-07-17). These flip to editorialType
 * 'essay'; everything else defaults to build-log. More essays can be flipped
 * later via the admin editor (T6).
 */
const ESSAY_SLUGS = new Set([
  'you-are-not-the-house-you-built',
  'if-it-makes-you-angry',
  'contact-is-the-test',
  'truth-is-the-currency-of-the-future',
]);

function deriveTopics(tags: string[]): Topic[] {
  const hits = new Set<Topic>();
  for (const raw of tags) {
    const t = TAG_TO_TOPIC[raw.toLowerCase().trim()];
    if (t && isTopic(t)) hits.add(t);
  }
  return TOPIC_PRIORITY.filter((t) => hits.has(t)).slice(0, 2);
}

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, slug: true, title: true, tags: true, topics: true, editorialType: true },
    orderBy: { publishedAt: 'desc' },
  });

  const perTopic: Record<Topic, number> = Object.fromEntries(
    TOPICS.map((t) => [t, 0])
  ) as Record<Topic, number>;
  const zeroTopic: string[] = [];
  const essayCandidates: string[] = [];
  const unmappedTagFreq: Record<string, number> = {};
  let topicsToWrite = 0;
  let typeToWrite = 0;

  for (const p of posts) {
    const derived = deriveTopics(p.tags);
    for (const t of derived) perTopic[t] += 1;
    if (derived.length === 0) zeroTopic.push(`${p.slug}  [${p.tags.join(', ')}]`);

    // track tags that mapped to nothing, to help extend the map later
    for (const raw of p.tags) {
      const k = raw.toLowerCase().trim();
      if (!TAG_TO_TOPIC[k]) unmappedTagFreq[k] = (unmappedTagFreq[k] || 0) + 1;
    }

    const willSetTopics = FORCE_TOPICS || p.topics.length === 0;
    if (willSetTopics && derived.length > 0) topicsToWrite += 1;

    const resolvedType: EditorialType = ESSAY_SLUGS.has(p.slug)
      ? 'essay'
      : DEFAULT_EDITORIAL_TYPE;
    // Write type if unset, or if the resolved type differs (lets an essay flip
    // on a re-run without a manual reset).
    const needsType = p.editorialType !== resolvedType;
    if (needsType) typeToWrite += 1;

    if (p.tags.some((t) => ESSAY_SIGNAL_TAGS.has(t.toLowerCase().trim()))) {
      essayCandidates.push(`${p.slug}  [${p.tags.join(', ')}]`);
    }

    if (APPLY) {
      const data: { topics?: Topic[]; editorialType?: EditorialType } = {};
      if (willSetTopics && derived.length > 0) data.topics = derived;
      if (needsType) data.editorialType = resolvedType;
      if (Object.keys(data).length > 0) {
        await prisma.post.update({ where: { id: p.id }, data });
      }
    }
  }

  const line = (s = '') => console.log(s);
  line(`\n=== Wave 3 T2 backfill ${APPLY ? '(APPLYING)' : '(DRY RUN — no writes)'} ===`);
  line(`posts: ${posts.length}`);
  line(`\nTopic coverage (posts per topic after backfill):`);
  for (const t of TOPICS) line(`  ${t.padEnd(12)} ${perTopic[t]}`);
  line(`\nposts that would get topics written: ${topicsToWrite}`);
  line(`posts that would get editorialType set (essay for ${ESSAY_SLUGS.size} slugs, else build-log): ${typeToWrite}`);
  line(`posts with ZERO topics (main feed only, hand-tag later): ${zeroTopic.length}`);

  line(`\n--- ${essayCandidates.length} essay candidates (tagged philosophy/writing/truth/trust/lessons-learned) ---`);
  line(`(all default to build-log; Jamie confirms which flip to essay)`);
  for (const s of essayCandidates) line(`  ${s}`);

  const topUnmapped = Object.entries(unmappedTagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  line(`\n--- top unmapped tags (freq) — extend TAG_TO_TOPIC if any should map ---`);
  for (const [t, c] of topUnmapped) line(`  ${String(c).padStart(3)}  ${t}`);

  if (zeroTopic.length > 0) {
    line(`\n--- zero-topic posts (${zeroTopic.length}) ---`);
    for (const s of zeroTopic) line(`  ${s}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
