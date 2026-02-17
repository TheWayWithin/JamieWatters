# PRD: Mission Control Dashboard Update

**Date:** 2026-02-17
**Author:** Marvin (AI agent)
**For:** Dev agent on Jamie's MacBook
**Repo:** TheWayWithin/JamieWatters (website directory)
**Branch:** develop

---

## Overview

Update the Mission Control dashboard at `/admin/mission-control` to show a portfolio-wide view of all products and the current sprint focus. Currently the dashboard has 4 panels (ScheduledTasks, TaskList, MemoryBrowser, ActivityFeed). We're adding 2 new panels on top and updating the sync script to read from new plan files.

---

## Background

Task tracking has been restructured. Instead of a single `TASKS.md`, there are now 3 files in `/home/ubuntu/clawd/plan/`:

- **`PORTFOLIO.md`** — All 9 products with status, priority, phase, next actions
- **`SPRINT.md`** — Current 2-week sprint (max 7 items, table format)
- **`BACKLOG.md`** — Prioritized queue of everything else

The Mission Control dashboard needs to reflect this new structure.

---

## What to Build

### 1. New Component: `PortfolioOverview.tsx`

**Location:** `app/admin/mission-control/components/PortfolioOverview.tsx`

**Data source:** Fetch from existing `/api/admin/projects` endpoint (already returns projects with name, status, mrr, users, category, currentPhase, etc.)

**UI Requirements:**
- Card grid layout (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each card shows:
  - Product name
  - Priority indicator dot (🔴 HIGH / 🟡 MED / 🟢 LOW) — map from project's `featured` field or a new `customMetrics.priority` field
  - Status badge with color coding (LIVE=green, BUILD=yellow, PLANNING=blue, PAUSED=gray, ARCHIVED=gray)
  - Current phase if set
  - MRR (format as currency)
  - Users count
  - Short description (truncated to 2 lines)
- Cards link to `/admin/projects/{slug}` or `/portfolio/{slug}`
- Sort order: featured first, then by status
- Header: "📦 Portfolio" with product count
- Refresh button

**Component pattern:** Match existing components (loading state, error state, fetch with `credentials: 'include'`). See `TaskList.tsx` for reference.

### 2. New Component: `SprintView.tsx`

**Location:** `app/admin/mission-control/components/SprintView.tsx`

**Data source:** Fetch from existing `/api/admin/tasks` endpoint. Filter for sections containing "Sprint" or "Active Sprint".

**UI Requirements:**
- Sprint date range at top (parsed from Sprint.md header)
- Sprint goals section (if present in data)
- Progress bar showing % of sprint items completed
- Task table/list with columns:
  - Checkbox (completed state)
  - Task description
  - Owner (parsed from task content if in `| Task | Owner | Product | Status |` table format)
  - Product name
  - Status indicator (⬜ TODO / 🔄 IN PROGRESS / ✅ DONE)
- Header: "🎯 Current Sprint" with completion ratio

**Component pattern:** Same as above — match existing TaskList.tsx patterns.

### 3. Update Page Layout: `page.tsx`

**Location:** `app/admin/mission-control/page.tsx`

**Changes:**
- Import and add `PortfolioOverview` as FIRST panel — full width (`lg:col-span-2`)
- Add `SprintView` as SECOND panel — full width (`lg:col-span-2`)
- Keep existing 4 panels below in their current 2x2 grid layout
- Update subtitle to: "Portfolio dashboard — products, sprint, tasks, and agent activity"

**Layout:**
```
┌──────────────────────────────────────┐
│         📦 Portfolio Overview         │  ← full width
├──────────────────────────────────────┤
│          🎯 Current Sprint            │  ← full width
├──────────────────┬───────────────────┤
│ 📅 Scheduled     │ 📋 Tasks          │  ← existing
├──────────────────┼───────────────────┤
│ 🧠 Memory        │ ⚡ Activity        │  ← existing
└──────────────────┴───────────────────┘
```

### 4. Update Sync Script: `sync-mission-control.js`

**Location:** `scripts/sync-mission-control.js`

**Changes to `syncTasks()` function:**
- Read from `plan/SPRINT.md`, `plan/BACKLOG.md`, and `plan/PORTFOLIO.md` instead of just `TASKS.md`
- Fall back to `TASKS.md` if plan files don't exist
- Parse the sprint table format: `| # | Task | Owner | Product | Status |`
- Parse portfolio next actions from numbered lists under `**Next actions:**`
- Store sprint items with section = "Active Sprint"
- Store backlog items with their existing section headers
- Store portfolio next actions with section = "Portfolio: {ProductName}"

**Changes to `syncScheduledTasks()` function:**
- Replace `clawdbot` CLI reference with `openclaw` (tool was renamed)
- Command should be: `openclaw cron list --json 2>/dev/null || echo "[]"`

**Other sync functions:** Leave `syncMemory()`, `syncActivity()`, and `processPendingTriggers()` unchanged.

---

## Existing Architecture Notes

- **Framework:** Next.js 15 App Router with TypeScript
- **Database:** Prisma ORM (PostgreSQL)
- **Auth:** Custom JWT auth — all admin API routes check `verifyToken`
- **Styling:** Tailwind CSS with custom design tokens (bg-bg-surface, border-border-default, text-text-primary, text-text-secondary, etc.)
- **Existing components to reference:** `TaskList.tsx`, `ScheduledTasks.tsx` in the same directory — follow their patterns exactly

### Known Issue: Prisma Schema Mismatch
The Prisma schema uses **PascalCase** for relation names (e.g., `Post`, `Project`, `MetricsHistory`) but some existing code references them in **camelCase** (e.g., `posts`, `project`, `metricsHistory`). This causes TypeScript build failures. 

**Recommendation:** Before starting this work, run `npx prisma generate` and fix any existing type errors related to relation names. The affected files are:
- `app/admin/content/posts/[id]/page.tsx` — `project` → `Project`
- `app/api/admin/posts/[id]/route.ts` — `project` → `Project`
- `app/api/admin/posts/route.ts` — `project` → `Project`, missing `id` + `updatedAt` in create
- `app/api/admin/projects/route.ts` — missing `id` + `updatedAt` in create
- `app/api/admin/scheduled-tasks/route.ts` — missing `id` in create
- `app/api/auth/change-password/route.ts` — missing `updatedAt` in create
- `app/api/projects/[slug]/route.ts` — `posts` → `Post`, `_count.posts` → `_count.Post`
- `app/api/projects/route.ts` — `_count.posts` → `_count.Post`
- `app/portfolio/[slug]/page.tsx` — `project.posts` → `project.Post`
- `lib/database.ts` — `posts` → `Post`, `metricsHistory` → `MetricsHistory`

---

## Data Format: plan/SPRINT.md

```markdown
# SPRINT.md — Current Focus

*Max 7 items. This is what we're working on RIGHT NOW.*
*Sprint: Feb 17 – Mar 2, 2026*

---

## Active Sprint

| # | Task | Owner | Product | Status |
|---|------|-------|---------|--------|
| 1 | Fix ESLint CI (PR #6) → merge develop → main | Marvin | LLMtxt | ⬜ TODO |
| 2 | Enable Railway backend in production | Marvin | AImpactScanner | ⬜ TODO |
...

## Sprint Goals
- **AI Search revenue path:** LLMtxt to production + outreach started
...

## Done This Sprint
*(move completed items here)*
```

## Data Format: plan/PORTFOLIO.md

```markdown
### 1. LLM-TXT-MASTERY 🔴
**One-liner:** AI visibility infrastructure
**URL:** llmtxtmastery.com
...
**Next actions:**
1. Fix CI (ESLint PR #6)
2. Merge develop → main
3. DM 20 prospects
```

---

## Success Criteria

1. Dashboard loads with Portfolio Overview showing all products
2. Sprint View shows current sprint items with progress
3. Sync script successfully reads from plan/ files
4. Build passes with no TypeScript errors
5. Deploys to production via Netlify

---

## Out of Scope

- Adding/editing projects from the dashboard (already exists via `/admin/projects`)
- Real-time MRR from Stripe (manual for now)
- Ace's workspace integration (future)
