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
| JW-ISS-5 | Portfolio page undermines proof positioning: 15 projects, no metrics, stale 'last updated', Planning-stage entries listed | Open | low | — | pending |

## Recently closed

| ID | Title | Status | Commit | Detail |
|----|-------|--------|--------|--------|
| JW-ISS-1 | Consolidate dual blog systems: legacy /blog (filesystem) duplicates /journey (DB), both in nav, /blog posts missing from sitemap | Resolved 2026-07-17 | d359735..2329adb | Wave 3: one /journey feed with topic+type facets & 7 topic pages; 5 /blog posts migrated to Neon; /blog 308-redirects to /journey; Blog dropped from nav; sitemap+RSS unified. Regression: website/scripts/verify-wave3.ts. Sprint: sprints/Sprint-7-Wave3-Content-IA.md |
| JW-ISS-4 | Dead code purge: /admin/mission-control island (~30 files), /admin/metrics + /api/metrics + middleware admin block, api/admin/metrics-v2, lib/achievements.ts, lib/image-utils.ts, bcryptjs, @vercel/analytics | Resolved 2026-07-17 | 56001b5 | All deleted plus /api/projects (zero callers); middleware now CSP-only, /api/admin/* self-enforce auth. Regression: website/scripts/verify-wave2.ts |
| JW-ISS-3 | SEO: no canonical URLs anywhere; lib/seo.ts emits wrong og:url (always baseUrl); no metadataBase | Resolved 2026-07-17 | e3e4a9c | Per-page canonical + og:url via getSEOMetadata(path); metadataBase in layout; all public pages converged. Regression: website/scripts/verify-wave1.ts |
| JW-ISS-2 | Homepage 'Subscribe' CTA links to /journey list instead of newsletter signup (/api/subscribe exists) | Resolved 2026-07-17 | 2b8f228 | Hero CTA anchors to #subscribe; closing CTA replaced by the inline NewsletterSignup form. Regression: website/scripts/verify-wave1.ts |
