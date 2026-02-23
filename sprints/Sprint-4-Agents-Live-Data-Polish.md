# Sprint 4: Agents Tab + Live Data + Polish

**PRD**: Mission Control v2
**Estimated Duration**: 1-2 weeks
**Status**: PLANNED
**Created**: 2026-02-23

---

## Objective

Add agent monitoring with status tracking and cron schedule grid, implement polling-based live data across all tabs, add Kanban drag-drop interaction, and polish the entire dashboard for production quality.

## Deliverables

- AgentStatus Prisma model and database migration
- Agents API endpoint with live status data
- Agents tab with agent cards, cron schedule grid, and live activity
- Kanban drag-drop for task status changes (read-write upgrade from Sprint 1)
- Polling system for real-time data freshness across all tabs
- Dashboard-wide polish: consistent loading states, error handling, responsive refinements, keyboard navigation

---

## Tasks

### Phase 4A: Database — AgentStatus Model

#### Task 4.1: Add AgentStatus model to Prisma schema and run migration

**Estimated Hours**: 1

Add a new AgentStatus model to track agent instances and their current state. Fields: id (String, cuid), agentId (String — unique identifier like 'strategist', 'developer', 'tester'), name (String — display name, e.g., 'The Strategist'), machine (String — which machine the agent is running on, e.g., 'macbook-pro', 'server-1'), model (String — Claude model being used, e.g., 'claude-sonnet-4-20250514', 'opus'), status (String — 'active', 'idle', 'offline', 'error'), lastActiveAt (DateTime), currentTask (String, optional — description of what agent is currently doing), tasksCompleted (Int, default 0 — count of tasks completed), tasksThisWeek (Int, default 0 — rolling weekly count), projectId (String, optional — FK to Project for current project focus), createdAt (DateTime), updatedAt (DateTime). Unique constraint on agentId to prevent duplicates.

**Files to Modify:**
```
website/prisma/schema.prisma
```

**Acceptance Criteria:**
- [ ] AgentStatus model added to schema.prisma with all specified fields
- [ ] Unique constraint on agentId field
- [ ] Optional relation to Project via projectId
- [ ] Migration runs successfully: npx prisma migrate dev --name add-agent-status-model
- [ ] npx prisma generate completes without errors
- [ ] Database has empty AgentStatus table with correct columns
- [ ] Indexes on: status, lastActiveAt, agentId

---

### Phase 4B: Agents API

#### Task 4.2: Create GET /api/admin/agents endpoint

**Estimated Hours**: 2-3
**Dependencies**: 4.1

Build the agents listing endpoint. Returns all AgentStatus records sorted by lastActiveAt desc (most recently active first). Enriches each agent with: recent activity (last 5 AgentActivity records for that agent), scheduled tasks (AgentSchedule records for that agent), and computed fields: isOnline (lastActiveAt within last 15 minutes), activityLevel (based on tasks this week — 'high' if > 10, 'medium' if > 3, 'low' otherwise). Also returns aggregated stats: totalAgents, activeAgents, totalTasksThisWeek.

**Files to Create:**
```
website/app/api/admin/agents/route.ts
```

**Acceptance Criteria:**
- [ ] GET /api/admin/agents returns { agents: [...], stats: { totalAgents, activeAgents, totalTasksThisWeek } }
- [ ] Each agent includes: all AgentStatus fields + recentActivity (last 5), scheduledTasks (cron entries), isOnline boolean, activityLevel string
- [ ] Agents sorted by lastActiveAt desc
- [ ] isOnline computed as lastActiveAt within last 15 minutes
- [ ] activityLevel: high (>10 tasks/week), medium (>3), low (<=3)
- [ ] Returns empty state gracefully: { agents: [], stats: { totalAgents: 0, ... } }
- [ ] Requires admin authentication

---

#### Task 4.3: Create PATCH /api/admin/tasks/[id] for Kanban status updates

**Estimated Hours**: 1-2

Build an endpoint to update task status, enabling Kanban drag-drop in Sprint 4. When a task's status is changed, also update the updatedAt timestamp. Validate that the new status is one of the canonical statuses. This endpoint powers the drag-drop interaction where moving a card to a new column triggers a status change.

**Files to Create:**
```
website/app/api/admin/tasks/[id]/route.ts
```

**Acceptance Criteria:**
- [ ] PATCH /api/admin/tasks/[id] with { status: 'new_status' } returns 200 with updated task
- [ ] Validates status is one of: backlog, pending, in_progress, active, review, testing, done, completed
- [ ] Updates updatedAt timestamp automatically
- [ ] Returns 404 if task id not found
- [ ] Requires admin authentication
- [ ] Supports updating other fields too (priority, assignedTo) for future flexibility

---

### Phase 4C: Agents Tab UI

#### Task 4.4: Build AgentCard component

**Estimated Hours**: 2-3

Create an AgentCard component displaying an agent's status and activity. Shows: agent name with role icon, status indicator (pulsing green dot for active, yellow for idle, gray for offline, red for error), machine name, model being used, current task (if active), tasks completed this week as a small bar chart or number, last active timestamp as relative time. The card should feel like a 'health card' for each agent — at a glance you know if the agent is working and what it's doing.

**Files to Create:**
```
website/components/admin/mission-control/AgentCard.tsx
```

**Acceptance Criteria:**
- [ ] AgentCard renders agent name, status dot, machine, model, current task, tasks this week, last active time
- [ ] Status indicator: green pulsing dot for active, amber for idle, gray for offline, red for error
- [ ] Current task shows truncated description when agent is active, 'No active task' when idle
- [ ] Tasks this week shows as a bold number with small label
- [ ] Last active shows relative time ('3 min ago', '2 hours ago', 'Offline')
- [ ] Card has left border color matching status
- [ ] Model name is displayed as a subtle badge (e.g., 'Sonnet' or 'Opus')
- [ ] Card hover reveals more detail (recent activity list expanding inline)

---

#### Task 4.5: Build CronScheduleGrid component

**Estimated Hours**: 2-3

Create a grid component that visualizes the cron/scheduled task configuration. Uses existing AgentSchedule data (which includes schedule, agent, project, task description). Display as a weekly grid: rows are agents, columns are days of the week, cells show scheduled tasks. Alternatively, display as a timeline view showing upcoming scheduled executions. Keep it simple — this is a read-only schedule visualization, not a scheduler editor.

**Files to Create:**
```
website/components/admin/mission-control/CronScheduleGrid.tsx
```

**Acceptance Criteria:**
- [ ] CronScheduleGrid displays scheduled tasks in a visual format
- [ ] Shows which agents have scheduled tasks and when
- [ ] Each schedule entry shows: task name, agent, frequency, next run time if calculable
- [ ] Grid or timeline view — whichever is clearer for the data volume
- [ ] Empty state: 'No scheduled tasks configured'
- [ ] Uses existing /api/admin/scheduled-tasks data (already fetched by admin page)
- [ ] Matches admin dark theme styling
- [ ] Responsive: scrollable on mobile

---

#### Task 4.6: Build AgentsTab component

**Estimated Hours**: 3-4
**Dependencies**: 4.2, 4.4, 4.5, 1.1

Create the AgentsTab that combines agent monitoring, the cron schedule grid, and live activity. Layout: (1) Top summary bar with MetricCards — Total Agents, Active Now, Tasks This Week, (2) Agent cards in a responsive grid (1 col mobile, 2-3 cols desktop), (3) Below agents: CronScheduleGrid for scheduled tasks, (4) Below grid: Live Activity section showing the most recent AgentActivity entries with auto-refresh. The existing MemoryBrowser component data could be linked from agent cards if relevant (e.g., 'View Memories' link).

**Files to Create:**
```
website/components/admin/mission-control/AgentsTab.tsx
```

**Files to Modify:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
website/components/admin/mission-control/types.ts
```

**Acceptance Criteria:**
- [ ] AgentsTab fetches from /api/admin/agents and renders content
- [ ] Summary bar shows: Total Agents, Active Now (green count), Tasks This Week
- [ ] Agent cards rendered in responsive grid with all agent data
- [ ] CronScheduleGrid renders below agent cards with schedule data
- [ ] Live Activity section shows last 15 activities with agent name, action, timestamp
- [ ] Activity section auto-refreshes every 15 seconds
- [ ] Loading state shows skeleton layout
- [ ] Empty state: 'No agents registered yet. Agents appear when they run tasks.'
- [ ] MissionControlTabs updated to render AgentsTab when Agents tab active

---

### Phase 4D: Kanban Drag-Drop Upgrade

#### Task 4.7: Add drag-drop to Kanban with status persistence

**Estimated Hours**: 4-5
**Dependencies**: 4.3, 1.6, 1.7

Upgrade the read-only Kanban from Sprint 1 to support drag-and-drop card movement between columns. When a card is dropped in a new column, call PATCH /api/admin/tasks/[id] to update the status. Use a lightweight drag-drop library (react-beautiful-dnd is deprecated, use @hello-pangea/dnd or dnd-kit). Implement optimistic UI update — move the card immediately and revert if the API call fails. Add visual feedback during drag (card elevation, column highlight on dragover).

**Files to Modify:**
```
website/components/admin/mission-control/KanbanTab.tsx
website/components/admin/mission-control/KanbanColumn.tsx
website/components/admin/mission-control/KanbanCard.tsx
website/package.json
```

**Acceptance Criteria:**
- [ ] Cards can be dragged from one column and dropped into another
- [ ] Dropping a card in a new column triggers PATCH /api/admin/tasks/[id] with the new status
- [ ] Optimistic update: card moves immediately on drop, reverts to original column if API fails
- [ ] Visual feedback during drag: card has elevation shadow, cursor changes to grabbing, target column has highlighted border
- [ ] Cards can be reordered within a column (visual only, order not persisted — sorted by priority)
- [ ] Drop zones are clearly indicated (column background lightens on dragover)
- [ ] Error handling: toast notification if status update fails with 'Task update failed' message
- [ ] Mobile: cards can still be tapped to expand (drag-drop is desktop-only, no touch drag required)
- [ ] Drag-drop library added to package.json (recommend @hello-pangea/dnd or @dnd-kit/core)

---

### Phase 4E: Polling System + Live Data

#### Task 4.8: Implement unified polling system for all tabs

**Estimated Hours**: 3-4
**Dependencies**: 1.5, 1.7, 2.6, 2.8, 3.6, 4.6

Create a custom React hook (usePolling or useLiveData) that manages polling intervals for data freshness across all tabs. The hook should: (1) only poll when the tab is visible (use document.visibilitychange API to pause when tab is hidden), (2) use different intervals per tab (Overview: 60s, Kanban: 30s, Issues: 30s, Agents: 15s, Goals: 120s, Projects: 120s), (3) show a subtle 'Last updated: N seconds ago' indicator, (4) allow manual refresh via a refresh button in the tab header. Replace the individual setInterval calls in each tab with this unified hook.

**Files to Create:**
```
website/components/admin/mission-control/hooks/usePolling.ts
website/components/admin/mission-control/LiveIndicator.tsx
```

**Files to Modify:**
```
website/components/admin/mission-control/OverviewTab.tsx
website/components/admin/mission-control/KanbanTab.tsx
website/components/admin/mission-control/GoalsTab.tsx
website/components/admin/mission-control/ProjectsTab.tsx
website/components/admin/mission-control/IssuesTab.tsx
website/components/admin/mission-control/AgentsTab.tsx
```

**Acceptance Criteria:**
- [ ] usePolling hook accepts: fetchFn, interval (ms), enabled (boolean)
- [ ] Hook pauses polling when browser tab is not visible (visibilitychange API)
- [ ] Hook resumes polling when browser tab becomes visible again (with immediate fetch)
- [ ] LiveIndicator component shows 'Updated 15s ago' with relative time
- [ ] LiveIndicator has a refresh button (circular arrow icon) for manual refresh
- [ ] LiveIndicator shows subtle pulse animation when actively fetching
- [ ] All 6 tabs use usePolling hook instead of individual setInterval calls
- [ ] Polling intervals: Overview 60s, Kanban 30s, Issues 30s, Agents 15s, Goals 120s, Projects 120s
- [ ] Polling only active for the currently visible Mission Control tab (not all tabs simultaneously)
- [ ] Cleanup: polling stops when component unmounts

---

### Phase 4F: Sync Script — Agent Status Updates

#### Task 4.9: Extend sync script to populate AgentStatus data

**Estimated Hours**: 2-3
**Dependencies**: 4.1

Update the sync script to create and maintain AgentStatus records. The sync script already processes AgentActivity records — use this data to derive agent status. Logic: (1) scan AgentActivity for distinct agent names, (2) for each agent, create or update AgentStatus record with: lastActiveAt from most recent activity, tasksCompleted from count of 'completed' activities, currentTask from most recent in_progress activity, status based on recency (active if activity in last 15 min, idle if last 2 hours, offline otherwise), (3) derive machine and model from activity metadata if available. Also parse the AGENT-11 agent profiles to populate agent display names.

**Files to Modify:**
```
website/scripts/sync-mission-control.js
```

**Acceptance Criteria:**
- [ ] Sync script creates AgentStatus records for each unique agent found in AgentActivity
- [ ] lastActiveAt set from most recent activity timestamp for each agent
- [ ] status derived: active if activity < 15min ago, idle if < 2h ago, offline otherwise
- [ ] tasksCompleted counted from completed activities
- [ ] tasksThisWeek counted from activities in last 7 days
- [ ] currentTask set from most recent non-completed activity
- [ ] Upsert behavior: updates existing AgentStatus if agentId already exists
- [ ] Sync script logs agent status results (agents found: N, updated: N)
- [ ] Existing sync functions unchanged and still work

---

### Phase 4G: Dashboard Polish

#### Task 4.10: Consistent loading and error states across all tabs

**Estimated Hours**: 2-3
**Dependencies**: 4.8

Audit all 6 tabs and ensure consistent loading and error handling UX. Create shared LoadingState and ErrorState components. Loading state should show tab-appropriate skeleton layout (not just a spinner). Error state should show the error message, a Retry button, and not crash the entire dashboard. Add error boundaries around each tab so one tab's error does not break others.

**Files to Create:**
```
website/components/admin/mission-control/LoadingState.tsx
website/components/admin/mission-control/ErrorState.tsx
website/components/admin/mission-control/TabErrorBoundary.tsx
```

**Files to Modify:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
```

**Acceptance Criteria:**
- [ ] LoadingState component accepts variant prop ('cards', 'list', 'kanban', 'grid') for tab-appropriate skeletons
- [ ] ErrorState component shows error message, Retry button, and 'Report Issue' link (goes to Issues tab)
- [ ] TabErrorBoundary wraps each tab content and catches render errors without crashing other tabs
- [ ] All 6 tabs use LoadingState for their loading state (not custom skeletons)
- [ ] All 6 tabs use ErrorState for their error state (not custom error messages)
- [ ] Error boundary shows friendly message: 'Something went wrong in [Tab Name]. Click Retry to refresh.'
- [ ] No unhandled promise rejections in console from any tab

---

#### Task 4.11: Responsive refinements and keyboard navigation

**Estimated Hours**: 2-3
**Dependencies**: 4.10

Polish the responsive design and add keyboard accessibility. (1) Tab bar: arrow keys switch between tabs, Enter/Space activates a tab, (2) All interactive elements have focus-visible outlines, (3) Screen reader announcements when tab changes, (4) Kanban cards: keyboard focusable with visible focus ring, (5) Mobile: verify all 6 tabs work on 375px viewport width (iPhone SE), (6) Tablet: optimize grid layouts for 768px-1024px range. Test and fix any overflow issues, truncation problems, or touch target sizes.

**Files to Modify:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
website/components/admin/mission-control/KanbanCard.tsx
website/components/admin/mission-control/KanbanTab.tsx
```

**Acceptance Criteria:**
- [ ] Tab bar supports arrow key navigation (left/right to switch tabs)
- [ ] Tab bar has role='tablist', each tab has role='tab' and aria-selected
- [ ] Tab panels have role='tabpanel' with aria-labelledby
- [ ] Tab change announces to screen reader via aria-live region
- [ ] All buttons and interactive elements have focus-visible outlines (ring-2 ring-blue-500)
- [ ] All tabs render correctly on 375px width (no horizontal overflow, no cut-off content)
- [ ] Grid layouts adjust: 1 col at <640px, 2 col at 640-1024px, 3-4 col at >1024px
- [ ] Touch targets are at least 44px on mobile
- [ ] No truncated content without title or tooltip for full text
- [ ] Tab bar scrolls smoothly on mobile with scroll-snap-x

---

#### Task 4.12: Remove deprecated MissionControl component and clean up

**Estimated Hours**: 1-2
**Dependencies**: 4.11

Now that all 6 tabs are complete and the new tabbed dashboard is fully functional, remove the deprecated MissionControl.tsx component and any dead code from the migration. Verify that no other pages or components import the old MissionControl. Clean up any TODO comments left during the sprint. Update the admin page.tsx to remove any data fetching that is no longer needed at the parent level (if tabs handle their own data fetching now). Ensure imports are clean and there are no unused dependencies.

**Files to Modify:**
```
website/app/admin/page.tsx
website/components/admin/MissionControl.tsx
```

**Acceptance Criteria:**
- [ ] MissionControl.tsx is deleted (or moved to a /deprecated folder if preservation is desired)
- [ ] No other file imports from MissionControl.tsx
- [ ] admin/page.tsx data fetching is clean — only fetches what is needed by MissionControlTabs (or tabs fetch their own data)
- [ ] No TODO, FIXME, or @deprecated comments remain in the new mission-control/ directory
- [ ] No unused imports across all new components
- [ ] npm run build succeeds with zero warnings from the mission-control components
- [ ] All old component files that are fully superseded are identified and noted (SprintView.tsx, TaskList.tsx, ScheduledTasks.tsx, MemoryBrowser.tsx, ActivityFeed.tsx) — these may still be used elsewhere, so check before deleting

---

### Phase 4H: Update Overview Aggregation for Complete Dashboard

#### Task 4.13: Update /api/admin/overview with complete metrics from all models

**Estimated Hours**: 2-3
**Dependencies**: 4.2, 3.8, 2.2

Now that all models exist (Goal, Issue, AgentStatus), update the overview endpoint to include the complete picture. Add: goalsSummary (total, onTrack, atRisk, achieved), issuesSummary (open, critical, byType), agentsSummary (total, active, tasksThisWeek). This makes the Overview tab the true executive dashboard with a single-glance view of the entire operation.

**Files to Modify:**
```
website/app/api/admin/overview/route.ts
website/components/admin/mission-control/OverviewTab.tsx
```

**Acceptance Criteria:**
- [ ] GET /api/admin/overview includes: tasksSummary, projectsSummary, goalsSummary, issuesSummary, agentsSummary, recentActivity
- [ ] goalsSummary: { total, onTrack, atRisk, behind, achieved }
- [ ] issuesSummary: { total, open, critical, high, byType: { blocker, error, approval, warning, question } }
- [ ] agentsSummary: { total, active, idle, offline, tasksThisWeek }
- [ ] OverviewTab renders MetricCards for all 5 categories (Tasks, Projects, Goals, Issues, Agents)
- [ ] Overview layout: 2 rows of MetricCards (top), then Priority List + Issues Alert (middle), then Recent Activity (bottom)
- [ ] All metrics use real data from Prisma queries
- [ ] Response time still under 500ms with all the additional queries

---

## Technical Notes

- For drag-drop, @hello-pangea/dnd is the maintained fork of react-beautiful-dnd. Alternatively, @dnd-kit/core is lighter and more modern but has a steeper learning curve. Either works — choose based on developer familiarity.
- The polling system should be tab-aware: when the user switches Mission Control tabs, only the active tab's polling should be running. Inactive tabs should stop polling to reduce API load. When a tab becomes active again, do an immediate fetch before resuming the poll interval.
- AgentStatus is derived data — the sync script creates/updates records based on AgentActivity analysis. There is no separate 'agent registration' step. Agents appear in the Agents tab when they generate activity.
- The machine field in AgentStatus may not be derivable from existing data. If not available, default to 'unknown' and let it be updated manually or when the sync script is enhanced to read machine info.
- For the CronScheduleGrid, the existing AgentSchedule/AgentCronTrigger data may not have clean cron expressions. Parse what is available and show raw schedule text for unparseable entries.
- The final cleanup (task 4.12) should be careful about deleting old components. Some (like ActivityFeed) might be used in other admin pages. Check all imports before deleting. Components only used within the old MissionControl layout can be deleted; reusable ones should be kept.
- Consider adding a brief 'Dashboard Tour' tooltip system for first-time dashboard view — but this is a nice-to-have, not a Sprint 4 requirement.
- The Overview tab after Sprint 4 becomes the true 'command center' with all metrics in one view. Each metric card should be clickable to navigate to its detailed tab.

## Risks & Mitigations

- {'risk': 'Drag-drop library might conflict with existing scroll behavior on the Kanban board', 'mitigation': 'Test thoroughly with horizontal scrolling columns. Both @hello-pangea/dnd and @dnd-kit handle scrollable containers — configure the drag container boundaries correctly. If conflicts arise, disable drag-drop on mobile and keep it desktop-only.'}
- {'risk': 'Polling across multiple tabs could create too many API calls', 'mitigation': 'Only poll the active Mission Control tab. Use visibility API to pause when browser tab is hidden. The Overview endpoint is a single aggregation call, not multiple calls. Target: max 4 API calls per minute during active use.'}
- {'risk': 'AgentStatus data might be stale or inaccurate since it is derived from activity logs', 'mitigation': "Show 'Last synced: X minutes ago' in the Agents tab. Make the status derivation rules generous (15 min for 'active' is already generous). Add a manual 'Refresh Agents' button. Over time, enhance the sync script to get more accurate data."}
- {'risk': 'Removing deprecated MissionControl might break something unexpected', 'mitigation': 'Search all files for MissionControl imports before deleting. Keep the old components in a /deprecated folder for one release cycle rather than hard-deleting. Run full build verification before committing.'}
- {'risk': 'Sprint 4 is the largest sprint with multiple features — scope creep risk', 'mitigation': 'Prioritize tasks in this order: (1) Agent model + API + tab (core new feature), (2) Polling system (improves all tabs), (3) Kanban drag-drop (enhancement), (4) Polish (quality). If time is tight, drag-drop and polish items can be deferred to a Sprint 4.5 without blocking launch.'}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 13 |
| Files to Create | 10 |
| Files to Modify | 22 |
| Estimated Duration | 1-2 weeks |
| Phases | 8 |
