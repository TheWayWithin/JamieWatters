# JamieWatters — Issue & Project Register

**This is the single source of truth for what is open in this repo.** One row per
issue/project. Detail lives in the linked doc; this file is the index the Mission
Control reconcile (`repo-reconcile.py`) reads and mirrors to the cockpit.

## ID convention (collision-safe)

Mission Control owns the bare `ISS-`/`PRJ-`/`T-` namespaces. **Every JamieWatters ID
carries the `JW-` prefix** so it can never collide with a Mission-Control-native
ID or another repo's. Raise issues here with `python3 ~/shared/scripts/repo-issue.py`.

---

## Open

| ID | Title | Status | Severity | Detail | MC-SYNC |
|----|-------|--------|----------|--------|---------|
| JW-ISS-10 | field-report.mjs oneLine() truncated card deks to the first sentence, stripping the benefit the dek carries (e.g. 'A friend said it should be a business.') | Resolved | med | 2026-07-22 | ✅ 2026-07-22 — oneLine() replaced with cardDek(): full authored excerpt passes through, sentence-boundary cap at 350 chars; dek standard (overt benefit + dramatic difference) added to reference/content-standard.md |
| JW-ISS-9 | field-report.mjs subjectFor lowercases proper nouns — 'garry Tan' in live test subject; drop the lowercasing, keep the title's own case after the colon | Resolved | med | 2026-07-22 | ✅ 2026-07-22 — lowercasing dropped in subjectFor; dry-run shows 'Jamie's Field Report: Garry Tan...'; verified in test send |
_(none)_

## Recently closed

| ID | Title | Status | Commit | Detail |
|----|-------|--------|--------|--------|
| JW-ISS-8 | Junk product rows in DB (p-1..p-8 LIVE with no URL; ARCHIVED placeholders) | Resolved 2026-07-21 | _pending push_ | Pruned 13 rows via `website/scripts/prune-junk-projects.ts` (dry-run-by-default, kept in repo): 12 no-url placeholders (posts unlinked where present) + the ARCHIVED `aimpact-scanner` duplicate (its 3 posts reassigned to live `aimpactscanner`). Real retired products (seo-agent, solomarket, asmge) deliberately KEPT — product history, already hidden on-site. 20 projects remain; build verified against pruned DB (243 pages). |
| JW-ISS-7 | public/data/dashboard.json orphaned 46KB static dump | Resolved 2026-07-21 | _pending push_ | Deleted the file AND its dead writer `website/scripts/update-dashboard.js` (not in package.json/CI; its input TASKS.md doesn't exist). /dashboard reads live DB stats, unaffected. |
| JW-ISS-6 | Journey route reads Neon, not content/blog/*.md — editing the 'canonical' markdown didn't update the live page (two sources of truth) | Resolved 2026-07-19 | _pending push_ | Decided **Option B: Neon is canonical**. Matches how the site renders and how jpub already publishes (upsert by slug, instant, no rebuild, keeps Post→Project link + view counts + admin editor). No render change needed. Markdown role made explicit as authoring INPUT: added content/blog/README.md (STOP marker) + docs/blog-editing.md (the one doc for how content flows + the three edit paths, default = "ask Claude, it re-runs jpub"). lib/blog.ts confirmed imported only by migrate-blog-to-neon.ts, no live route. |
| JW-ISS-5 | Portfolio page undermines proof positioning: 15 projects, no metrics, stale 'last updated', Planning-stage entries listed | Resolved 2026-07-17 | _pending push_ | Wave 4 (Option A): trimmed to 10 live products, each with one honest proof line (no vanity metrics — none exist); 7 pre-launch items moved to an "In the workshop" line; dropped the "N built" vanity bar + misleading derived date; fixed AImpactMonitor (was junk row p-3, LIVE/no-url) → BUILD + real repo URL. Regression: website/scripts/verify-wave4.ts. Sprint: sprints/Sprint-8-Wave4-Portfolio-Credibility.md |
| JW-ISS-1 | Consolidate dual blog systems: legacy /blog (filesystem) duplicates /journey (DB), both in nav, /blog posts missing from sitemap | Resolved 2026-07-17 | d359735..2329adb | Wave 3: one /journey feed with topic+type facets & 7 topic pages; 5 /blog posts migrated to Neon; /blog 308-redirects to /journey; Blog dropped from nav; sitemap+RSS unified. Regression: website/scripts/verify-wave3.ts. Sprint: sprints/Sprint-7-Wave3-Content-IA.md |
| JW-ISS-4 | Dead code purge: /admin/mission-control island (~30 files), /admin/metrics + /api/metrics + middleware admin block, api/admin/metrics-v2, lib/achievements.ts, lib/image-utils.ts, bcryptjs, @vercel/analytics | Resolved 2026-07-17 | 56001b5 | All deleted plus /api/projects (zero callers); middleware now CSP-only, /api/admin/* self-enforce auth. Regression: website/scripts/verify-wave2.ts |
| JW-ISS-3 | SEO: no canonical URLs anywhere; lib/seo.ts emits wrong og:url (always baseUrl); no metadataBase | Resolved 2026-07-17 | e3e4a9c | Per-page canonical + og:url via getSEOMetadata(path); metadataBase in layout; all public pages converged. Regression: website/scripts/verify-wave1.ts |
| JW-ISS-2 | Homepage 'Subscribe' CTA links to /journey list instead of newsletter signup (/api/subscribe exists) | Resolved 2026-07-17 | 2b8f228 | Hero CTA anchors to #subscribe; closing CTA replaced by the inline NewsletterSignup form. Regression: website/scripts/verify-wave1.ts |
