# Sprint 2: Goals Tab + Enhanced Projects Tab

**PRD**: Mission Control v2
**Estimated Duration**: 1 week
**Status**: PLANNED
**Created**: 2026-02-23

---

## Objective

Add strategic goal tracking with progress visualization and migrate the existing PortfolioOverview into an enhanced Projects tab with summary metrics and improved project cards.

## Deliverables

- Goal Prisma model and database migration
- Goals CRUD API endpoints
- Goals tab with progress bars, categories, and deadline tracking
- Enhanced Projects tab with summary bar and improved project cards reusing PortfolioOverview data
- Sync script updated to support goal data from workspace files

---

## Tasks

### Phase 2A: Database — Goal Model

#### Task 2.1: Add Goal model to Prisma schema and run migration

**Estimated Hours**: 1-2

Add a new Goal model to the Prisma schema that tracks strategic targets. Fields: id (String, cuid), name (String), description (String, optional), metric (String — what is being measured, e.g., 'Monthly Revenue', 'Active Users'), currentValue (Float), targetValue (Float), unit (String — e.g., '$', 'users', '%'), category (String — e.g., 'Revenue', 'Growth', 'Product', 'Infrastructure'), status (String — 'on_track', 'at_risk', 'behind', 'achieved'), deadline (DateTime, optional), startDate (DateTime, default now), projectId (String, optional — FK to Project), createdAt (DateTime), updatedAt (DateTime). Run migration with a descriptive name.

**Files to Modify:**
```
website/prisma/schema.prisma
```

**Acceptance Criteria:**
- [ ] Goal model added to schema.prisma with all fields listed above
- [ ] Optional relation to Project model via projectId
- [ ] Migration runs successfully: npx prisma migrate dev --name add-goal-model
- [ ] npx prisma generate completes without errors
- [ ] Database has empty Goal table with correct columns
- [ ] Index on category and status fields for efficient filtering

---

### Phase 2B: Goals API

#### Task 2.2: Create GET /api/admin/goals endpoint

**Estimated Hours**: 1-2
**Dependencies**: 2.1

Build the goals listing endpoint. Supports query params: category (filter by goal category), status (filter by status), projectId (filter by associated project). Returns goals sorted by deadline ascending (most urgent first), then by status priority (behind > at_risk > on_track > achieved). Include computed field: progressPercent (currentValue / targetValue * 100, capped at 100). Use the existing verifyAdminAuth pattern.

**Files to Create:**
```
website/app/api/admin/goals/route.ts
```

**Acceptance Criteria:**
- [ ] GET /api/admin/goals returns 200 with array of goals
- [ ] Each goal includes computed progressPercent field
- [ ] Supports ?category=Revenue filter
- [ ] Supports ?status=at_risk filter
- [ ] Supports ?projectId=xxx filter
- [ ] Returns empty array (not error) when no goals exist
- [ ] Requires admin authentication (401 without cookie)
- [ ] Goals sorted by deadline asc, then status severity

---

#### Task 2.3: Create POST /api/admin/goals endpoint

**Estimated Hours**: 1-2
**Dependencies**: 2.2

Build the goal creation endpoint on the same route file. Accepts JSON body with required fields: name, metric, currentValue, targetValue, unit, category. Optional fields: description, deadline, projectId, status (defaults to 'on_track'). Validates that targetValue > 0 and currentValue >= 0. Auto-computes initial status based on progress percentage and deadline proximity.

**Files to Modify:**
```
website/app/api/admin/goals/route.ts
```

**Acceptance Criteria:**
- [ ] POST /api/admin/goals with valid body returns 201 with created goal
- [ ] Validates required fields (returns 400 with descriptive error if missing)
- [ ] Validates targetValue > 0 and currentValue >= 0
- [ ] Defaults status to 'on_track' if not provided
- [ ] Auto-sets status to 'achieved' if currentValue >= targetValue
- [ ] Requires admin authentication
- [ ] Returns the created goal with computed progressPercent

---

#### Task 2.4: Create PATCH /api/admin/goals/[id] endpoint for updates

**Estimated Hours**: 1-2
**Dependencies**: 2.2

Build a dynamic route endpoint for updating individual goals. Supports partial updates — any subset of goal fields can be sent. If currentValue or targetValue is updated, auto-recalculate status: achieved if currentValue >= targetValue, behind if deadline is past and progress < 50%, at_risk if deadline is within 7 days and progress < 80%. This auto-status can be overridden by explicitly passing a status field.

**Files to Create:**
```
website/app/api/admin/goals/[id]/route.ts
```

**Acceptance Criteria:**
- [ ] PATCH /api/admin/goals/[id] with valid body returns 200 with updated goal
- [ ] Supports partial updates (only sent fields are changed)
- [ ] Auto-recalculates status when currentValue or targetValue changes
- [ ] Explicit status field overrides auto-calculation
- [ ] Returns 404 if goal id not found
- [ ] Requires admin authentication
- [ ] Updates updatedAt timestamp automatically

---

### Phase 2C: Goals Tab UI

#### Task 2.5: Build GoalCard component with progress visualization

**Estimated Hours**: 2-3

Create a GoalCard component that displays a single goal with its progress. Shows: goal name, metric description, progress bar (currentValue / targetValue as percentage), current/target values with unit (e.g., '$2,400 / $5,000'), status badge (on_track=green, at_risk=amber, behind=red, achieved=blue), deadline with countdown (e.g., '14 days left'), category tag. The progress bar should use status-appropriate colors and animate on mount.

**Files to Create:**
```
website/components/admin/mission-control/GoalCard.tsx
```

**Acceptance Criteria:**
- [ ] GoalCard renders goal name, metric, progress bar, values, status badge, deadline, category
- [ ] Progress bar fills to correct percentage with smooth CSS transition on mount
- [ ] Progress bar color matches status: on_track=green-500, at_risk=amber-500, behind=red-500, achieved=blue-500
- [ ] Status badge has matching background color with white text
- [ ] Deadline shows relative countdown ('14 days left', '3 days overdue')
- [ ] Category renders as a subtle pill/tag below the goal name
- [ ] Values formatted with unit: '$2,400 / $5,000' or '145 / 500 users'
- [ ] Card matches admin dark theme (gray-800 bg, gray-700 border)

---

#### Task 2.6: Build GoalsTab component

**Estimated Hours**: 4-5
**Dependencies**: 2.2, 2.5, 1.1

Create the GoalsTab that displays all goals organized by category. Layout: (1) Top summary row with quick metrics — total goals, on-track count, at-risk count, achieved count as MetricCards, (2) Category filter tabs or chips (All, Revenue, Growth, Product, Infrastructure), (3) Goal cards in a responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop), (4) Add Goal button that opens a simple inline form or modal for creating new goals. Fetches from /api/admin/goals with category filter support.

**Files to Create:**
```
website/components/admin/mission-control/GoalsTab.tsx
website/components/admin/mission-control/GoalForm.tsx
```

**Files to Modify:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
website/components/admin/mission-control/types.ts
```

**Acceptance Criteria:**
- [ ] GoalsTab fetches goals from /api/admin/goals and renders GoalCards in a grid
- [ ] Summary row shows 4 MetricCards: Total Goals, On Track, At Risk, Achieved
- [ ] Category filter chips filter goals client-side (All selected by default)
- [ ] Add Goal button opens GoalForm (inline expandable section or modal)
- [ ] GoalForm has fields for: name, metric, currentValue, targetValue, unit (dropdown), category (dropdown), deadline (date picker), description (textarea)
- [ ] GoalForm submits to POST /api/admin/goals and refreshes list on success
- [ ] GoalForm shows validation errors from API
- [ ] Loading state shows skeleton grid
- [ ] Empty state shows 'No goals defined yet. Add your first strategic target.'
- [ ] MissionControlTabs updated to render GoalsTab when Goals tab is active (remove placeholder)

---

### Phase 2D: Enhanced Projects Tab

#### Task 2.7: Build ProjectSummaryBar component

**Estimated Hours**: 1-2

Create a summary bar component for the top of the Projects tab that shows aggregated project metrics. Displays: total project count, projects by status breakdown (active/paused/completed as colored badges with counts), total tasks across all projects, and a simple health indicator (what percentage of projects are 'green' — on schedule). This data comes from the existing /api/admin/projects endpoint combined with task count from /api/admin/tasks.

**Files to Create:**
```
website/components/admin/mission-control/ProjectSummaryBar.tsx
```

**Acceptance Criteria:**
- [ ] ProjectSummaryBar renders a horizontal bar with: Total Projects count, Active/Paused/Completed breakdowns, Total Tasks count, Health percentage
- [ ] Status breakdowns use color-coded badges (active=green, paused=amber, completed=blue)
- [ ] Health percentage shows in a small circular or linear progress indicator
- [ ] Responsive: wraps to 2 rows on mobile
- [ ] Matches admin dark theme styling

---

#### Task 2.8: Build ProjectsTab component wrapping enhanced PortfolioOverview

**Estimated Hours**: 3-4
**Dependencies**: 2.7, 1.1

Create a ProjectsTab component that combines the new ProjectSummaryBar with an enhanced version of the existing PortfolioOverview content. The current PortfolioOverview.tsx renders project cards with name, description, status, and recent activity. The new ProjectsTab should: (1) render ProjectSummaryBar at top, (2) render project cards below with improved layout — add task count per project, last activity timestamp, and a link to filter the Kanban by that project, (3) add a status filter (All, Active, Paused, Completed). Do NOT rewrite PortfolioOverview from scratch — import and enhance it, or create an EnhancedProjectCard that extends the existing card's data display.

**Files to Create:**
```
website/components/admin/mission-control/ProjectsTab.tsx
website/components/admin/mission-control/EnhancedProjectCard.tsx
```

**Files to Modify:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
website/components/admin/mission-control/types.ts
```

**Acceptance Criteria:**
- [ ] ProjectsTab renders ProjectSummaryBar at top with real data
- [ ] Project cards show: name, description, status badge, task count, last activity relative time, progress indicator
- [ ] Status filter (All/Active/Paused/Completed) filters cards client-side
- [ ] Each project card has a 'View Tasks' link/button that switches to Kanban tab with project filter applied
- [ ] Cards arranged in responsive grid (1 col mobile, 2 cols desktop)
- [ ] Loading state shows skeleton cards
- [ ] Empty state shows appropriate message
- [ ] MissionControlTabs updated to render ProjectsTab when Projects tab is active
- [ ] Existing PortfolioOverview data (from /api/admin/projects) is reused, not re-fetched

---

### Phase 2E: Sync Script Update

#### Task 2.9: Extend sync-mission-control.js to sync goals from workspace

**Estimated Hours**: 2-3
**Dependencies**: 2.1, 2.3

Update the sync script to parse goal data from the Clawdbot workspace. Goals might be defined in project-plan.md files, progress.md files, or a dedicated goals.md file in the workspace. Add a new sync function that: (1) scans for goal-related content (lines matching patterns like 'Goal:', 'Target:', 'KPI:'), (2) creates or updates Goal records in the database via the new /api/admin/goals endpoint or direct Prisma calls, (3) updates currentValue for existing goals when progress data is found. This is additive — it does not break existing task/schedule/memory sync functions.

**Files to Modify:**
```
website/scripts/sync-mission-control.js
```

**Acceptance Criteria:**
- [ ] Sync script has a new syncGoals() function called in the main sync flow
- [ ] Goals are parsed from workspace files (project-plan.md, goals.md, or similar)
- [ ] Existing goals are updated (upsert by name + project combination)
- [ ] New goals are created with reasonable defaults
- [ ] Progress values are updated when found in progress tracking files
- [ ] Existing sync functions (tasks, schedules, memories, activities) are unchanged and still work
- [ ] Sync script logs goal sync results (created: N, updated: N, errors: N)
- [ ] Graceful handling if no goal data is found (skip without error)

---

## Technical Notes

- The Goal model is kept simple intentionally. We track a single numeric metric per goal (currentValue toward targetValue). Complex multi-metric goals should be split into separate Goal records.
- Auto-status calculation logic: achieved if currentValue >= targetValue; behind if deadline is past and progressPercent < 50; at_risk if deadline is within 7 days and progressPercent < 80; otherwise on_track. Explicit status override takes precedence.
- The ProjectsTab should reuse the data already fetched by admin/page.tsx for the projects list (passed via props from parent), not make its own API call. The ProjectSummaryBar can compute its metrics from that same data client-side.
- The 'View Tasks' button on project cards should update the URL to ?mc_tab=kanban&project=<projectId> and the KanbanTab should read this param to pre-apply the project filter from Sprint 1.
- Unit field in Goal is free-text but the GoalForm should offer common presets: $, users, %, tasks, sessions as a select with an 'Other' option for custom entry.
- The PortfolioOverview component can be kept as-is for the other admin pages (if used elsewhere). The EnhancedProjectCard is a new component specifically for the Mission Control Projects tab.

## Risks & Mitigations

- {'risk': 'Goal data format in workspace files might be inconsistent or not machine-parseable', 'mitigation': 'Define a simple structured format for goals in workspace files (YAML frontmatter or structured markdown), and have the sync script fall back to manual goal creation via the UI if parsing fails'}
- {'risk': 'Goal status auto-calculation might be wrong for goals without deadlines', 'mitigation': 'Without a deadline, skip deadline-based status checks and only use progress-based status (achieved if >= target, on_track otherwise). User can always override manually.'}
- {'risk': 'Adding new Prisma model might require database downtime or migration issues', 'mitigation': 'The Goal table is additive (new table, no FK constraints on existing tables). Migration should be zero-downtime. Test migration on development database before production.'}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 9 |
| Files to Create | 8 |
| Files to Modify | 7 |
| Estimated Duration | 1 week |
| Phases | 5 |
