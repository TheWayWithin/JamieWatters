# Mission Control v2 Dashboard Sprint

**Sprint:** 2026-03-19 → 2026-03-26
**Mission:** Implement Mission Control v2 dashboard per developer spec
**Owner:** Agent-11 (MacBook) + Jamie
**Reference:** `/Ideation/Mission Control V2/02-developer-spec (2).md`

## Executive Summary

Upgrade the admin dashboard from a basic tabbed Mission Control view to a 6-view command center. The system must let Jamie answer 7 strategic questions in under 60 seconds. MVP = Command View + HITL Queue + Execution Board (phases 1-4).

## Technical Architecture

- **Stack:** Next.js 15 / Tailwind / Prisma / Neon Postgres / Netlify
- **Data flow:** Mini sync script → Neon → Dashboard reads
- **Dashboard scope:** Read-only except HITL resolution (PATCH)
- **Nav change:** Sub-tabs → dedicated routes (/admin, /admin/hitl, etc.)

---

## Phase 1: Prisma Schema Migration
*Unblocks everything. Must complete first.*

- [ ] 1.1 Add new models: HitlItem, RecurringOp, SystemHealth, EventLog, Decision, Metric
- [ ] 1.2 Extend AgentTask: add tid, project, mode, size, status (9-state), blockedBy, dueDate
- [ ] 1.3 Extend AgentStatus: add role, queueSize, exceptions, mcDuties
- [ ] 1.4 Extend Goal: add goalId, parentId, horizon, confidence, dueDate
- [ ] 1.5 Extend Project: add projectId, program, keyResult, tier, health, killDate, nextProofPoint, progress, blocker
- [ ] 1.6 Run `npx prisma migrate dev --name mission-control-v2`
- [ ] 1.7 Copy schema to ~/shared/mission-control-assets/ for Merlin
- [ ] 1.8 Verify build passes with new schema

## Phase 2: API Endpoints
*New endpoints + updates to existing ones.*

- [ ] 2.1 `GET /api/admin/command` — Aggregated command view data (KRs, HITL count, agent summary, weekly score, blockers, completions)
- [ ] 2.2 `GET /api/admin/hitl` — HITL items with status/priority filters
- [ ] 2.3 `PATCH /api/admin/hitl/[id]` — Resolve HITL item (outcome, notes, timestamp)
- [ ] 2.4 `GET /api/admin/recurring` — Recurring operations list
- [ ] 2.5 `GET /api/admin/health` — System health checks
- [ ] 2.6 `GET /api/admin/events` — Event log with actor/entity/date filters, pagination
- [ ] 2.7 `GET /api/admin/decisions` — Decision register
- [ ] 2.8 `GET /api/admin/metrics-v2` — Metrics grouped by type
- [ ] 2.9 Update `GET /api/admin/tasks` — Add status/owner/project filters, return tid/mode/size/blockedBy
- [ ] 2.10 Update `PATCH /api/admin/tasks/[id]` — Support 9-status transitions

## Phase 3: Navigation Restructure
*Move from sub-tabs to dedicated routes.*

- [ ] 3.1 Update AdminTabs: replace Mission Control single tab with 6 MC routes (Command, HITL, Execution, Portfolio, Agents, Audit) + secondary nav (Projects, Content, Settings)
- [ ] 3.2 Create route files: `/admin/page.tsx` (Command), `/admin/hitl/page.tsx`, `/admin/execution/page.tsx`, `/admin/portfolio/page.tsx`, `/admin/agents/page.tsx`, `/admin/audit/page.tsx`
- [ ] 3.3 Add HITL badge (red count) to navigation
- [ ] 3.4 Mobile responsive nav (stack vertically, HITL first)

## Phase 4: Command View (MVP Core)
*Jamie's 60-second morning check-in. Default at /admin.*

- [ ] 4.1 Q2 Key Results section — 4 progress indicators with status colors
- [ ] 4.2 Waiting on Jamie section — red count badge, P0 items listed, click opens resolve
- [ ] 4.3 Completed Today section — list with T-ids and agents
- [ ] 4.4 Agent Status section — 5 cards with green/amber/red dots
- [ ] 4.5 Weekly Scorecard section — 4 metric cards (sprint completion, HITL wait, effort %, tasks done)
- [ ] 4.6 Blockers section — count + top items with age
- [ ] 4.7 Mobile layout — stack all sections, HITL first

## Phase 5: HITL Queue (MVP Core)
*The single place to see what's waiting on Jamie.*

- [ ] 5.1 HITL table — sorted P0 first then by wait time
- [ ] 5.2 Resolve dialog — outcome dropdown + notes textarea, calls PATCH endpoint
- [ ] 5.3 Priority styling — P0 red border, P1 amber, P2 default
- [ ] 5.4 Wait time display — "2d 4h" format, amber >48h, red >5d
- [ ] 5.5 Resolved Today section below main table
- [ ] 5.6 Mobile card layout with prominent resolve button

## Phase 6: Execution Board
*Kanban mapped to 9-status task model.*

- [ ] 6.1 Kanban columns: Ready, In Progress, Waiting on Jamie (amber), Waiting on Agent, Blocked (red), Done Today (green)
- [ ] 6.2 Task cards: T-id (monospace), description, owner badge, project badge, mode/size tags, days in status
- [ ] 6.3 Filters: project, owner, priority (top of board)
- [ ] 6.4 Mobile: filtered list with status tabs instead of horizontal columns

## Phase 7: Portfolio, Agent Ops, Audit
*Post-MVP views. Can ship incrementally.*

- [ ] 7.1 Portfolio table — sortable columns, tier/health filters, kill date countdown (amber <30d, red <7d), expandable rows
- [ ] 7.2 Agent Operations — per-agent cards (name, machine, role, status dot, current task, queue, exceptions, MC duties), system health table, recurring ops table (overdue in red)
- [ ] 7.3 Audit Timeline — reverse-chron EventLog stream, paginated 50/page, actor/entity/date filters, T-id search, format: "14:30 · Ace · T-005 todo → in_progress · Benchmark"

---

## Implementation Priority

**MVP (ship first, phases 1-6):** Schema + APIs + Nav + Command View + HITL Queue + Execution Board
**Post-MVP (phase 7):** Portfolio, Agent Ops, Audit

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Schema migration breaks existing features | Run build after migration, test existing pages |
| Nav restructure breaks bookmarks | /admin redirects to command view (same URL) |
| No data in new tables until sync runs | Show "awaiting first sync" empty states |
| Large diff size | Ship in phases, commit per phase |

## Success Criteria

- [ ] Jamie can answer all 7 questions in under 60 seconds from Command View
- [ ] HITL items resolvable from dashboard
- [ ] All admin pages mobile-responsive (44px tap targets)
- [ ] Existing features (Content, Projects, Settings) still work
- [ ] Build passes on Netlify
