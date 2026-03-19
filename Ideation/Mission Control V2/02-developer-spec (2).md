# Mission Control Dashboard: Developer Specification

**For:** Agent-11 + Jamie (MacBook, Claude Code, VS Code)
**Date:** 2026-03-19
**Priority:** P0
**Repo:** jamiewatters.work (Next.js 15 / Netlify / Neon Postgres / Prisma)
**Reference:** Mission Control System Design Specification v2.0

---

## Summary

The Mission Control dashboard at `jamiewatters.work/admin` needs to be upgraded from a basic kanban + goals view to a 6-view command center. The data pipeline changes:

**Old:** EC2 sync script reads `~/clawd/plan/` → parses → writes to Neon → dashboard reads
**New:** Mini sync script reads `~/shared/mission-control/` → parses → writes to Neon → dashboard reads

Your scope (Agent-11 on MacBook): Prisma schema migration, API endpoint updates, and frontend dashboard views. The sync script on the Mini is built separately by Merlin.

**Coordination:** After you run `prisma migrate dev`, share the updated schema file with Merlin so the Mini sync script can generate a matching Prisma client. Put it at `~/shared/mission-control-assets/schema.prisma`.

---

## 1. Prisma Schema Changes

### New models

```prisma
model HitlItem {
  id              String    @id @default(cuid())
  tid             String?
  description     String
  type            String    // quick_yes_no | review_and_edit | decision | approve_with_conditions
  priority        String    // P0 | P1 | P2
  requestingAgent String?
  project         String?
  waitingSince    DateTime
  blocks          String?
  status          String    @default("open") // open | resolved
  outcome         String?   // approved | approved_with_changes | rework_requested | deferred | rejected
  resolvedAt      DateTime?
  resolvedNotes   String?
  syncedAt        DateTime  @default(now())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model RecurringOp {
  id            String    @id @default(cuid())
  rid           String    @unique
  operation     String
  owner         String
  machine       String?
  cadence       String
  lastCompleted DateTime?
  nextDue       DateTime?
  sla           String?
  status        String    @default("active")
  syncedAt      DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model SystemHealth {
  id               String    @id @default(cuid())
  system           String    @unique
  owner            String
  machine          String?
  checkMethod      String?
  expectedInterval String?
  lastSuccess      DateTime?
  status           String    @default("unknown") // green | amber | red | unknown
  alertThreshold   String?
  syncedAt         DateTime  @default(now())
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model EventLog {
  id        String   @id @default(cuid())
  timestamp DateTime
  actor     String
  entity    String   // task | project | goal | hitl | decision
  entityId  String
  action    String   // status_change | created | resolved | completed
  fromValue String?
  toValue   String?
  reason    String?
  project   String?
  createdAt DateTime @default(now())

  @@index([timestamp])
  @@index([entityId])
  @@index([actor])
}

model Decision {
  id         String    @id @default(cuid())
  did        String    @unique
  date       DateTime
  title      String
  owner      String
  context    String?
  chosen     String?
  reviewDate DateTime?
  syncedAt   DateTime  @default(now())
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Metric {
  id       String   @id @default(cuid())
  group    String   // strategic | execution | agent_performance | product_business
  name     String
  current  String?
  target   String?
  status   String?  // ok | needs_attention | below | at_risk
  syncedAt DateTime @default(now())

  @@unique([group, name])
}
```

### Extend existing AgentTask model

Add these fields:

```prisma
model AgentTask {
  // ... existing fields ...
  tid       String?   @unique
  project   String?
  mode      String?   // build | growth | content | admin
  size      String?   // S | M | L
  status    String?   // inbox | ready | in_progress | waiting_on_jamie | waiting_on_agent | waiting_external | blocked | done | archived
  blockedBy String?
  dueDate   DateTime?
}
```

### Extend existing AgentStatus model

Add:

```prisma
model AgentStatus {
  // ... existing fields ...
  machine      String?
  role         String?
  currentTask  String?
  queueSize    Int      @default(0)
  exceptions   Int      @default(0)
  mcDuties     String?
}
```

### Extend existing Goal model

Add:

```prisma
model Goal {
  // ... existing fields ...
  goalId     String?  @unique
  parentId   String?
  horizon    String?
  confidence String?
  dueDate    DateTime?
}
```

### Extend existing Project model

Add:

```prisma
model Project {
  // ... existing fields ...
  projectId      String?  @unique
  program        String?
  keyResult      String?
  tier           String?
  health         String?
  killDate       DateTime?
  nextProofPoint String?
  progress       String?
  blocker        String?
}
```

### Run migration

```bash
npx prisma migrate dev --name mission-control-v2
```

After migration, copy the schema for Merlin:
```bash
cp prisma/schema.prisma ~/shared/mission-control-assets/schema.prisma
```

---

## 2. API Endpoint Changes

### New endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/command` | Aggregated command view data (see section 3.1) |
| GET | `/api/admin/hitl` | HITL items. Filter: `?status=open`, `?priority=P0` |
| PATCH | `/api/admin/hitl/[id]` | Resolve HITL item: `{outcome, notes}` |
| GET | `/api/admin/recurring` | Recurring operations list |
| GET | `/api/admin/health` | System health checks |
| GET | `/api/admin/events` | Event log. Filter: `?actor=`, `?entity=`, `?since=`, `?limit=50` |
| GET | `/api/admin/decisions` | Decision register |
| GET | `/api/admin/metrics-v2` | Metrics by group |

### HITL resolve with write-back

When Jamie resolves a HITL item from the dashboard:

1. Update `HitlItem` in DB (status=resolved, outcome, resolvedAt, notes)
2. Write a JSON entry to `pending-changes.json` in a location accessible to the Mini sync script

The Mini sync script reads `pending-changes.json` and applies the resolution back to `06-HITL.md` (moves the row from the active table to "Resolved today"). This keeps markdown as source of truth.

```json
[
  {
    "type": "hitl_resolve",
    "tid": "T-002",
    "outcome": "approved",
    "notes": "Copy looks good, ship it",
    "resolvedAt": "2026-03-19T15:00:00Z"
  }
]
```

The API endpoint writes this file. The write-back location should be configurable via environment variable (`PENDING_CHANGES_PATH`). Default: write to the Neon database in a `PendingChange` table that the sync script polls.

Alternative (simpler for v1): skip write-back entirely. Jamie resolves in the dashboard (DB update only) and also edits 06-HITL.md manually or tells an agent to do it. Add write-back in v2 once the basic flow works.

### Updated endpoints

| Method | Path | Change |
|--------|------|--------|
| GET | `/api/admin/tasks` | Add filters: `?status=`, `?owner=`, `?project=`. Return tid, mode, size, blockedBy. Group by status. |
| PATCH | `/api/admin/tasks/[id]` | Support 9-status model transitions. |

---

## 3. Dashboard Views

### 3.1 Command View (default: `/admin`)

Jamie's 60-second morning check-in. Must answer 7 questions at a glance.

**Data source:** `GET /api/admin/command` returns:

```typescript
interface CommandView {
  quarterlyKRs: {
    id: string; name: string; current: string;
    target: string; status: string; due: string;
  }[];
  todaysCompletions: {
    tid: string; task: string; agent: string; completedAt: string;
  }[];
  hitlCount: number;
  hitlP0: {
    tid: string; description: string;
    waitingSince: string; blocks: string;
  }[];
  agentSummary: {
    name: string; status: string;
    currentTask: string; queueSize: number;
  }[];
  weeklyScore: {
    sprintCompletion: string;
    hitlAvgWait: string;
    effortInNowTier: string;
    tasksCompleted: number;
  };
  blockedCount: number;
  topBlockers: {
    tid: string; task: string;
    blockedBy: string; ageDays: number;
  }[];
}
```

**Layout (desktop):**

```
+---------------------------------------------------+
|  Q2 Key Results           [4 progress indicators]  |
+------------------------+--------------------------+
|  Waiting on Jamie      |  Completed today         |
|  [red count badge]     |  [list with T-ids]       |
|  [P0 items listed]     |                          |
+------------------------+--------------------------+
|  Agent status          |  Weekly scorecard        |
|  [5 status cards]      |  [4 metric cards]        |
+------------------------+--------------------------+
|  Blockers  [count + top items]                     |
+---------------------------------------------------+
```

**Mobile:** Stack all sections vertically. HITL section first (most actionable).

**Interactions:**
- HITL count badge red if P0 items exist, amber if only P1/P2
- Clicking HITL item opens resolve dialog (same as HITL Queue view)
- Agent cards: green/amber/red dot. Click navigates to Agent Ops.
- Weekly scorecard: green/amber/red per metric based on target comparison

### 3.2 HITL Queue (`/admin/hitl`)

| Priority | T-ID | What's needed | Type | Agent | Project | Waiting | Blocks |

**Features:**
- Sorted: P0 first, then by wait time (oldest first)
- "Resolve" button per row opens dialog:
  - Outcome: dropdown (approved | approved_with_changes | rework_requested | deferred | rejected)
  - Notes: textarea
  - Submit calls `PATCH /api/admin/hitl/[id]`
- Colour: P0 rows red left border, P1 amber, P2 default
- Wait time as "2d 4h" with amber at >48h, red at >5d
- "Resolved today" section below

**Mobile:** Card layout instead of table. Resolve button prominent.

### 3.3 Execution Board (`/admin/execution`)

Kanban columns mapped to task statuses:

| Column | Statuses | Colour accent |
|--------|----------|---------------|
| Ready | `ready` | neutral |
| In progress | `in_progress` | blue |
| Waiting on Jamie | `waiting_on_jamie` | amber |
| Waiting on agent | `waiting_on_agent` | neutral |
| Blocked | `blocked` | red |
| Done today | `done` (today only) | green |

**Card content:** T-id (monospace), task description, owner badge, project badge, mode tag, size tag, days in current status.

**Filters:** Project, owner, priority (top of board).

**Drag-and-drop:** Moving to "Waiting on Jamie" prompts for HITL entry details.

**Mobile:** Show as filtered list (status tabs) instead of horizontal columns.

### 3.4 Portfolio (`/admin/portfolio`)

Table: Product | Owner | Program | Stage | Tier | Health | Next milestone | Kill date (days remaining) | Next proof point | MRR

**Features:**
- Sortable columns
- Tier filter (NOW/NEXT/LATER radio)
- Health filter (green/amber/red)
- Kill date: amber <30 days, red <7 days
- Click row to expand: linked projects, tasks, key results

### 3.5 Agent Operations (`/admin/agents`)

**Per-agent card:**
- Name, machine, role
- Status dot (green/amber/red)
- Current task (T-id + description)
- Queue size, tasks completed this week, exceptions
- Last activity timestamp
- MC duties summary

**Below agent cards:**
- System health table (from SystemHealth model)
- Recurring operations table (from RecurringOp model), overdue items in red

### 3.6 Audit Timeline (`/admin/audit`)

Reverse-chronological stream from EventLog.

- Paginated (50 per page) or infinite scroll
- Each entry: timestamp, actor badge, action description, entity link
- Filters: actor dropdown, entity type, date range
- Search by T-id
- Format: `14:30 · Ace · T-005 todo → in_progress · Benchmark`

---

## 4. Navigation

```
Mission Control (primary):
  +-- Command      (/admin)           [default]
  +-- HITL Queue   (/admin/hitl)      [red badge when >0 open]
  +-- Execution    (/admin/execution)
  +-- Portfolio    (/admin/portfolio)
  +-- Agents       (/admin/agents)
  +-- Audit        (/admin/audit)

Content (secondary, collapsed):
  +-- Projects     (/admin/projects)
  +-- Posts        (/admin/content/posts)
  +-- Settings     (/admin/settings)
```

---

## 5. Implementation priority

1. Prisma schema migration (unblocks everything, share schema with Merlin)
2. `/api/admin/command` endpoint + Command view
3. `/api/admin/hitl` endpoints + HITL Queue view
4. Updated `/api/admin/tasks` + Execution Board
5. Portfolio view
6. Agent Operations view
7. Audit Timeline

Items 1-3 are the MVP. Jamie can use the system effectively with just Command + HITL.

---

## 6. Technical notes

- Use `dynamic = 'force-dynamic'` on all admin pages (no ISR caching for admin views)
- Existing Tailwind setup is fine, no new CSS frameworks
- Existing auth (cookie-based session) is fine, no auth changes needed
- All admin pages should be mobile-responsive (44px minimum tap targets)
- The sync script on Mini handles all data ingestion. Dashboard is read-only except for HITL resolution.
