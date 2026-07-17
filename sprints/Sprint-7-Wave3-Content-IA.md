# Sprint 7 — Wave 3: Content IA consolidation (PRJ-18, JW-ISS-1)

**Goal:** one field-report feed. `/blog` (filesystem, 5 posts) and `/journey`
(Neon, ~185 posts) merge into a single stream with one publish path, zero broken
inbound URLs.

**Status:** planning. Decisions locked one at a time with Jamie, logged here.

---

## Decision log

### D1 — Taxonomy: one stream + facets (LOCKED 2026-07-17)

One chronological stream. Topic and type are frontmatter facets rendered as
filtered views, never separate content sections. Topic pages are generated
views of the same feed (SEO topic clusters for free).

- **Type** (exactly one): `essay` | `build-log`
- **Topics** (1-2 per post, fixed set of 7; revised 2026-07-17):
  - `ai` — AI generally, building with AI
  - `ai-search` — commercial keyword cluster feeding the AI Search Mastery
    products (kept separate for the SEO topic page, not as identity — the
    business framing is truth + staying relevant as AI accelerates)
  - `building` — shipping products, dev practice
  - `open-source` — the open-source push
  - `trading` — the trading system
  - `thinking` — philosophy, life skills, inner work, The Way Within
  - `business` — strategy, revenue, the journey itself
- jpub auto-defaults type to `build-log` and infers topics where it can; hand
  tagging only for essays. Taxonomy must never depend on Jamie remembering it.

### D2 — Content source of truth: Neon (LOCKED 2026-07-17)

Neon stays the source of truth. Migrate the 5 filesystem /blog posts INTO the
DB and retire the filesystem blog. Rationale: 5-post import beats 185-post
export; preserves Sprint 6's instant no-rebuild publish flow (jpub → R2 → Neon);
admin editor keeps working. Cost covered by a nightly export script dumping all
posts to markdown as a git-visible backup artefact (archive, not publish path).
Type/topic become columns + back-fill on existing rows.

### D3 — Admin content editor: KEEP (resolved by D2, 2026-07-17)

It writes to Neon, which remains the source of truth. Extend its form with the
type + topic fields; no retirement.

### D4 — URLs and redirects: keep /journey canonical (LOCKED 2026-07-17)

`/journey` stays the canonical feed path. Rationale: ~184 journey URLs are
already indexed; a rebrand would 301 the whole archive right after Wave 1 fixed
canonicals. Only 5 legacy /blog URLs move.

- `/blog/[slug]` → 301 to `/journey/[slug]` for the 5 migrated posts
  (check slug collisions during migration; if a /blog slug clashes with a
  journey slug, resolve before importing).
- `/blog` index → 301 to `/journey`; remove "Blog" from main nav.
- Topic views: `/journey/topic/[topic]` (7 generated pages). Type is a filter
  view on the feed (essays vs build logs).
- Sitemap + RSS regenerate from the unified feed. jpub publish path untouched.
- Rollback: redirects are config; DB import is additive (5 rows + column
  back-fill). Revert = pull the 301s and restore the /blog filesystem route.

---

## Facts (verified against repo, 2026-07-17 — recon)

**The DB taxonomy plumbing largely already exists.** This is a smaller sprint
than the brief feared — mostly views + migration + vocab, not schema work.

Live (written AND rendered):
- `Post.tags String[]` — written by admin editor (`app/api/admin/posts/route.ts:111`,
  `app/admin/content/posts/[id]/page.tsx:82`) and RENDERED on feed cards
  (`components/blog/PostCard.tsx:59`). Existing tags are FREE-FORM and
  capitalised (e.g. "AI", "co-founders"), not our controlled 7-topic set.
- `Post.postType String` — written, but its vocabulary is
  `manual | daily-update | weekly-plan` (how a post was created), NOT our
  editorial `essay | build-log`. Different axis — do not overload it.

Dead / different-axis scaffolding (in schema + validations, not on public views):
- `contentPillar` (JOURNEY/FRAMEWORK/TOOL/COMMUNITY), `postTypeEnum`
  (PROGRESS_UPDATE/MILESTONE/…), `targetPersona` — selected in
  `lib/database.ts:164` but not rendered on /journey. A marketing-funnel axis,
  unrelated to D1. Leave untouched.

Views + routing:
- `/journey` feed (`app/journey/page.tsx`) is paginated (`getPagedPosts`, 20/pg)
  with ZERO topic/type filter UI. Header already says "Field reports". RSS lives
  at `/api/rss`. This is where the D1 facets need building.
- `/blog/[slug]` is SSG from `content/blog/*.md` via `lib/blog.ts` (locked
  frontmatter: title, slug, date, excerpt, tags[], readTime, draft).
- Sitemap (`app/sitemap.ts`) enumerates ONLY `/journey/{slug}` from `getAllPosts`
  (Neon). The filesystem /blog posts are NOT in the sitemap as dynamic routes —
  this IS the "blog posts missing from sitemap" half of JW-ISS-1. Migrating them
  into Neon fixes it for free.

Two corrections to the goal's assumptions:
- **7 markdown files in `content/blog/`, not 5**: the 5 published posts plus
  `trader-7-graphics-spec.md` and `trader-7-stop-loss-guardrails.md` (look like
  spec docs / drafts — the build only emitted 5 /blog paths). Migration must
  decide per-file: import as post, or leave as non-post. → in-sprint check.
- Existing free-form tags need mapping to the controlled 7 topics; not a
  1:1 rename.

---

## Task breakdown (draft — for Jamie review)

**T1 — Taxonomy vocab + schema touch — DONE (code) 2026-07-17.**
Chose dedicated fields over overloading `tags[]`: added `topics String[]`
(controlled 7, GIN-indexed) and `editorialType String?` (essay|build-log,
btree-indexed) to the Post model. Shipped:
- `lib/taxonomy.ts` — TOPICS(7), labels, descriptions, EDITORIAL_TYPES,
  normalizeTopics/normalizeEditorialType, DEFAULT_EDITORIAL_TYPE='build-log'.
- `prisma/schema.prisma` — two additive columns + two indexes; validates.
- `prisma/migrations/20260717120000_add_wave3_feed_facets/migration.sql` —
  hand-verified additive SQL (generated via `prisma migrate diff`, no DB touched).
- Validation wiring: `lib/validations/post.ts` (Create/Update/Form + both
  converters), create + update API routes persist both fields, PostForm carries
  defaults. `getAllPosts`/`getPagedPosts`/`getPostBySlug` already expose them
  (omit-content / full-row reads). `npx tsc --noEmit` clean.
- **DEFERRED (needs Jamie):** applying the migration to Neon —
  `npx prisma migrate deploy` runs against `DATABASE_URL` (production). Safe
  (additive), but it mutates the real DB, so it rides with the gated deploy or
  a deliberate go. Not yet applied.

**T2 — Backfill existing ~185 posts.**
Script: map free-form tags → the 7 topics (lossy, with a fallback), set
`editorialType` default `build-log`, produce a report of posts needing a hand
essay-tag. Jamie hand-tags the essays from that list. Idempotent, dry-run first.

**T3 — Migrate the 5 (or 7) filesystem /blog posts into Neon.**
Import script reading `content/blog/*.md` → Post rows (map frontmatter, upload
any local hero to R2 per Sprint-6 flow). Slug-collision check vs journey. Decide
trader-7 spec files in/out. Retire `content/blog/` + `lib/blog.ts` read path.

**T4 — Feed views: topic + type filters + topic pages.**
Add filter UI to `/journey` (topic + type facets), generate
`/journey/topic/[topic]` (7 pages) as filtered views. `getPagedPosts` gains
optional topic/type args. PostCard already shows tags.

**T5 — Redirects + nav + sitemap/RSS.**
301 `/blog` → `/journey` and `/blog/{slug}` → `/journey/{slug}` (netlify.toml
or middleware — respect Wave 2's CSP-only middleware). Drop "Blog" from nav.
Sitemap now covers everything via Neon; add topic pages. Confirm RSS pulls the
unified feed.

**T6 — Admin editor: add the two fields.**
Extend the content editor form (`app/admin/content/…`) with topic multiselect
(the 7) + editorial type. jpub auto-defaults type=build-log, infers topics.

**T7 — Verify + regression script.**
`scripts/verify-wave3.ts`: /blog + /blog/{slug} 301 to /journey; topic pages
200; feed filter returns filtered set; sitemap contains former blog slugs under
/journey; RSS non-empty; build green. Live spot-check post-deploy.

Sequencing: T1 → T2 ∥ T3 → T4 ∥ T6 → T5 → T7. Jamie gates the push.
