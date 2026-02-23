# Sprint 1: Tab Navigation + Overview Tab + Kanban Tab

**PRD**: Mission Control v2
**Estimated Duration**: 1-2 weeks
**Status**: PLANNED
**Created**: 2026-02-23

---

## Objective

Replace the single scrolling MissionControl page with a tabbed dashboard, delivering an executive Overview tab with aggregated metrics and a read-only Kanban board for visual task management.

## Deliverables

- 6-tab navigation system within Mission Control replacing the stacked component layout
- Overview tab with metric cards (tasks, projects, agents, activity), priority list, and recent activity feed
- Kanban tab with column-based task board (Backlog, In Progress, Review, Done) using existing AgentTask data
- New /api/admin/overview aggregation endpoint
- All existing admin functionality preserved (Content, Projects, Metrics, Settings tabs unchanged)

---

## Tasks

### Phase 1A: Tab Navigation Infrastructure

#### Task 1.1: Create MissionControlTabs component with 6-tab navigation

**Estimated Hours**: 3-4

Build a new MissionControlTabs component that replaces the current MissionControl.tsx stacked layout. The current MissionControl renders PortfolioOverview, SprintView, TaskList, ScheduledTasks, MemoryBrowser, and ActivityFeed in a single scrolling column. Replace this with a tabbed interface using URL hash or state-based tab switching. Tabs: Overview, Goals, Kanban, Projects, Issues, Agents. Only Overview and Kanban will have content in Sprint 1; the others show a 'Coming Soon' placeholder. The existing AdminShell already provides top-level admin navigation (Mission Control, Content, Projects, Metrics, Settings) — the new tabs live INSIDE the Mission Control page, not replacing AdminShell.

**Files to Create:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
website/components/admin/mission-control/TabPlaceholder.tsx
```

**Files to Modify:**
```
website/app/admin/page.tsx
```

**Acceptance Criteria:**
- [ ] 6 tabs render horizontally below the AdminShell header: Overview, Goals, Kanban, Projects, Issues, Agents
- [ ] Active tab is visually highlighted with a blue-500 bottom border and white text
- [ ] Inactive tabs show gray-400 text with hover state
- [ ] Tab state persists in URL search params (?tab=overview, ?tab=kanban, etc.) so refresh preserves tab
- [ ] Default tab is Overview when no param specified
- [ ] Goals, Projects, Issues, and Agents tabs show a styled placeholder with 'Coming in Sprint N' message
- [ ] Tab bar is sticky below the admin header during scroll
- [ ] Responsive: tabs scroll horizontally on mobile with overflow-x-auto
- [ ] Existing admin page data fetching (the useEffect calls in current page.tsx) still works — data is passed into tab content components

---

#### Task 1.2: Refactor admin page.tsx to use MissionControlTabs

**Estimated Hours**: 2-3
**Dependencies**: 1.1

The current website/app/admin/page.tsx fetches all data (tasks, scheduledTasks, memories, activities) in useEffect hooks and passes them as props to MissionControl. Refactor this page to: (1) keep the same data fetching, (2) replace the <MissionControl> component with <MissionControlTabs>, (3) pass the fetched data down so Overview and Kanban tabs can consume it. The old MissionControl.tsx file should NOT be deleted yet — keep it as reference until all components are migrated. Add a comment marking it as deprecated.

**Files to Modify:**
```
website/app/admin/page.tsx
website/components/admin/MissionControl.tsx
```

**Acceptance Criteria:**
- [ ] Admin page renders MissionControlTabs instead of MissionControl
- [ ] All existing data fetching (tasks, scheduledTasks, memories, activities) still executes
- [ ] Data is passed to MissionControlTabs which routes it to the active tab's component
- [ ] No console errors or TypeScript compilation errors
- [ ] MissionControl.tsx has a @deprecated JSDoc comment at the top
- [ ] Loading states still work (the existing isLoading state and skeleton UI)
- [ ] Error states still work (the existing error handling with retry)

---

### Phase 1B: Overview Aggregation API

#### Task 1.3: Create /api/admin/overview aggregation endpoint

**Estimated Hours**: 2-3

Build a new API endpoint that aggregates data from existing tables to power the Overview tab's metric cards and summary widgets. This endpoint queries AgentTask (for task counts by status), Project (for project count and health), AgentActivity (for recent activity count and agent activity), and AgentSchedule (for scheduled task counts). Returns a single JSON payload with all overview metrics to minimize client-side API calls. The endpoint must use the existing verifyAdminAuth middleware pattern from other admin routes.

**Files to Create:**
```
website/app/api/admin/overview/route.ts
```

**Acceptance Criteria:**
- [ ] GET /api/admin/overview returns 200 with aggregated metrics JSON
- [ ] Response includes: totalTasks, tasksByStatus (backlog/in_progress/review/done counts), totalProjects, activeProjects, recentActivityCount (last 24h), scheduledTaskCount, agentCount (distinct agents from AgentActivity), topPriorities (top 5 tasks by priority not done)
- [ ] Response includes: recentActivity (last 10 AgentActivity entries with timestamp, agent, action, description)
- [ ] Endpoint requires admin authentication (returns 401 without valid cookie)
- [ ] Response time under 500ms with reasonable data volumes
- [ ] Handles empty database gracefully (returns zeros, empty arrays)

---

### Phase 1C: Overview Tab

#### Task 1.4: Build MetricCard reusable component

**Estimated Hours**: 1-2

Create a reusable MetricCard component that displays a single KPI with icon, label, value, and optional trend indicator. This will be used across Overview and other tabs. Design follows the existing admin dark theme (gray-800/900 backgrounds, white text). Each card should support: title string, value (number or string), icon (React node), optional subtitle, optional trend (up/down/neutral with percentage).

**Files to Create:**
```
website/components/admin/mission-control/MetricCard.tsx
```

**Acceptance Criteria:**
- [ ] MetricCard renders with title, value, and icon in a rounded gray-800 card with border border-gray-700
- [ ] Value renders in text-2xl font-bold, title in text-sm text-gray-400
- [ ] Optional trend indicator shows green arrow-up for positive, red arrow-down for negative, gray dash for neutral
- [ ] Component accepts className prop for layout flexibility
- [ ] Responsive: cards work in CSS grid with auto-fill
- [ ] Loading state shows animated pulse placeholder

---

#### Task 1.5: Build OverviewTab component

**Estimated Hours**: 4-5
**Dependencies**: 1.3, 1.4

Create the main Overview tab content that serves as the executive dashboard. Layout: (1) Top row of 4-6 MetricCards showing key numbers (Total Tasks, Active Projects, Agent Sessions Today, Tasks Completed This Week), (2) Middle section split into two columns — left: Priority List (top 5 highest-priority open tasks), right: Quick Stats (tasks by status as a simple bar or mini horizontal bars), (3) Bottom: Recent Activity feed reusing existing ActivityFeed component data but in a compact 5-item format. This component fetches from /api/admin/overview on mount.

**Files to Create:**
```
website/components/admin/mission-control/OverviewTab.tsx
website/components/admin/mission-control/PriorityList.tsx
```

**Acceptance Criteria:**
- [ ] OverviewTab fetches from /api/admin/overview and renders metric cards in a 2x2 grid (mobile) or 4-column grid (desktop)
- [ ] Metric cards show: Total Tasks, Active Projects, Activity Today, Completed This Week
- [ ] Priority List shows top 5 non-done tasks sorted by priority with task title, project name, status badge, and priority indicator
- [ ] Each priority item is clickable (navigates to ?tab=kanban in future, for now just highlights)
- [ ] Task status distribution shows as simple horizontal bar segments (backlog=gray, in_progress=blue, review=yellow, done=green) with counts
- [ ] Recent Activity section shows last 5 activities with relative timestamps (e.g., '2 hours ago'), agent name, and action description
- [ ] Loading state shows skeleton cards while /api/admin/overview is fetching
- [ ] Error state shows retry button if overview fetch fails
- [ ] Auto-refreshes every 60 seconds via setInterval
- [ ] Responsive layout: stacks vertically on mobile

---

### Phase 1D: Kanban Tab

#### Task 1.6: Build KanbanColumn component

**Estimated Hours**: 3-4

Create a KanbanColumn component that renders a single column in the Kanban board. Each column has a header (column name + task count badge), and a scrollable list of KanbanCard components. Columns represent task statuses: Backlog, In Progress, Review, Done. The column header should use status-appropriate colors (gray for Backlog, blue for In Progress, yellow for Review, green for Done). Column takes an array of tasks as prop and renders them as cards. This sprint is read-only — no drag-drop.

**Files to Create:**
```
website/components/admin/mission-control/KanbanColumn.tsx
website/components/admin/mission-control/KanbanCard.tsx
```

**Acceptance Criteria:**
- [ ] KanbanColumn renders column header with name and count badge (e.g., 'In Progress (4)')
- [ ] Column header color matches status: Backlog=gray-500, In Progress=blue-500, Review=amber-500, Done=green-500
- [ ] Column body is scrollable with max-height (calc(100vh - 280px)) and custom scrollbar styling
- [ ] KanbanCard shows: task title (truncated to 2 lines), project name as subtle label, priority indicator (P0=red, P1=orange, P2=yellow, P3=gray dot), agent name if assigned, relative timestamp of last update
- [ ] KanbanCard has hover effect (slight border glow or brightness increase)
- [ ] KanbanCard click expands inline or shows a simple detail popover with full description
- [ ] Empty column shows 'No tasks' placeholder with muted icon
- [ ] Cards render in priority order within each column (P0 first)

---

#### Task 1.7: Build KanbanTab component with board layout

**Estimated Hours**: 3-4
**Dependencies**: 1.6

Create the KanbanTab component that renders 4 KanbanColumns side by side in a horizontal scrollable board. This component receives the tasks data (already fetched by admin page.tsx) and sorts them into columns by status. Map existing AgentTask status values to Kanban columns: status 'backlog' or 'pending' -> Backlog column, 'in_progress' or 'active' -> In Progress, 'review' or 'testing' -> Review, 'done' or 'completed' -> Done. Include a filter bar at the top with project filter dropdown and optional search input for task titles.

**Files to Create:**
```
website/components/admin/mission-control/KanbanTab.tsx
```

**Acceptance Criteria:**
- [ ] KanbanTab renders 4 columns (Backlog, In Progress, Review, Done) in a horizontal flex layout
- [ ] Columns take equal width on desktop (min-width: 280px each) with horizontal scroll if viewport is narrow
- [ ] Tasks are correctly distributed into columns based on their status field
- [ ] Filter bar at top includes: project dropdown (populated from distinct project values in tasks), search input for title filtering
- [ ] Filters apply client-side instantly (no API call for filtering)
- [ ] Board header shows total task count and breakdown
- [ ] Loading state shows 4 skeleton columns
- [ ] Empty state (no tasks at all) shows centered message 'No tasks synced yet'
- [ ] Column widths are consistent and the board scrolls horizontally on mobile
- [ ] Read-only: no drag-drop interaction, cards are static within their columns

---

### Phase 1E: Integration and Migration

#### Task 1.8: Wire tabs to data and verify full integration

**Estimated Hours**: 2-3
**Dependencies**: 1.2, 1.5, 1.7

Connect all the pieces: (1) MissionControlTabs routes data to OverviewTab and KanbanTab based on active tab, (2) OverviewTab fetches its own data from /api/admin/overview, (3) KanbanTab receives tasks from the parent page.tsx data fetch, (4) Verify the existing ActivityFeed component data is available to OverviewTab for the recent activity section. Test all tabs render correctly with real database data. Ensure tab switching is smooth without re-fetching data unnecessarily (use the parent's already-fetched data where possible, let OverviewTab manage its own aggregation fetch).

**Files to Modify:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
website/app/admin/page.tsx
```

**Acceptance Criteria:**
- [ ] Clicking Overview tab shows OverviewTab with live metrics from /api/admin/overview
- [ ] Clicking Kanban tab shows KanbanTab with tasks distributed into columns
- [ ] Tab switching does not trigger full page reload
- [ ] OverviewTab manages its own data fetch (aggregation endpoint)
- [ ] KanbanTab receives tasks from parent state (no redundant fetch)
- [ ] Placeholder tabs (Goals, Projects, Issues, Agents) render their 'Coming Soon' content
- [ ] No TypeScript errors, no console errors
- [ ] Page load time not significantly worse than previous stacked layout
- [ ] Browser back/forward works with tab URL params

---

#### Task 1.9: Add shared types file for Mission Control v2

**Estimated Hours**: 1-2
**Dependencies**: 1.3

Create a shared TypeScript types file that defines all interfaces used across the new Mission Control tabs. This avoids type duplication and ensures consistency. Include: OverviewMetrics (response shape from /api/admin/overview), KanbanTask (task with column assignment), MetricCardProps, TabConfig (tab name, icon, component), and re-export existing types from the Prisma client for AgentTask, AgentActivity, etc.

**Files to Create:**
```
website/components/admin/mission-control/types.ts
```

**Acceptance Criteria:**
- [ ] Types file exports: OverviewMetrics, KanbanTask, KanbanColumn type, MetricCardProps, PriorityItem, MissionControlTab, TabConfig
- [ ] OverviewMetrics matches the exact response shape of /api/admin/overview
- [ ] KanbanTask extends or wraps the Prisma AgentTask type with column assignment
- [ ] TabConfig includes: id, label, icon component, and 'available' boolean
- [ ] All new components import types from this file instead of defining inline
- [ ] No 'any' types — everything is properly typed

---

## Technical Notes

- The current admin/page.tsx fetches tasks, scheduledTasks, memories, and activities in separate useEffect calls. Keep this pattern for now — the Overview tab adds one more fetch (/api/admin/overview) but the Kanban tab reuses the existing tasks data.
- The existing MissionControl.tsx renders 6 components in a grid. We are NOT deleting it in Sprint 1 — mark as @deprecated. It serves as reference for what data each component needs.
- AdminShell.tsx provides the top-level admin navigation (Mission Control, Content, Projects, Metrics, Settings). The new tab system is INSIDE Mission Control, not replacing AdminShell. This is a sub-navigation within the Mission Control page.
- The existing TaskList.tsx component has useful task rendering logic. The KanbanCard should borrow its status color mapping and priority display logic rather than reinventing.
- Status mapping needs care: the sync script writes statuses like 'pending', 'in_progress', 'completed'. The Kanban columns need to handle all possible status values gracefully with a default fallback to Backlog for unknown statuses.
- All new components go in website/components/admin/mission-control/ subdirectory to keep the flat admin/components folder from getting more crowded.
- The /api/admin/overview endpoint should use Prisma's aggregate and groupBy operations for efficiency rather than fetching all records and counting client-side.

## Risks & Mitigations

- {'risk': 'Existing data might have inconsistent status values that do not cleanly map to Kanban columns', 'mitigation': "Add a status normalization utility function that maps all known status strings to one of 4 canonical statuses (backlog, in_progress, review, done), with 'backlog' as the default for unknowns"}
- {'risk': 'The Overview aggregation endpoint could be slow if tables are large', 'mitigation': 'Use Prisma aggregation queries (count, groupBy) instead of fetching all records. Add database indexes on status and createdAt columns if needed'}
- {'risk': 'Tab URL params might conflict with existing admin routing', 'mitigation': 'Use ?mc_tab= prefix for Mission Control tab params to avoid collision with any future admin query params'}
- {'risk': 'Mobile experience might suffer with 6 tabs', 'mitigation': 'Use horizontal scroll on the tab bar with overflow-x-auto and scroll snap for mobile. Consider an icon-only mode below 640px breakpoint'}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 9 |
| Files to Create | 10 |
| Files to Modify | 5 |
| Estimated Duration | 1-2 weeks |
| Phases | 5 |
