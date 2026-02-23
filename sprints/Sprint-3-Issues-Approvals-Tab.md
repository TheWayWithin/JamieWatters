# Sprint 3: Issues Tab + Approvals System

**PRD**: Mission Control v2
**Estimated Duration**: 1 week
**Status**: PLANNED
**Created**: 2026-02-23

---

## Objective

Add an Issues tab for tracking blockers, errors, and approval requests with severity-based prioritization and status workflow, giving the operator a clear view of everything that needs attention.

## Deliverables

- Issue Prisma model and database migration
- Issues CRUD API endpoints with filtering and status transitions
- Issues tab with severity-based categorization, approval workflow, and status management
- Blocker and error auto-detection in sync script
- Overview tab updated with issues count metric and urgent items

---

## Tasks

### Phase 3A: Database — Issue Model

#### Task 3.1: Add Issue model to Prisma schema and run migration

**Estimated Hours**: 1

Add a new Issue model to track blockers, errors, and approval requests. Fields: id (String, cuid), type (String — 'approval', 'blocker', 'error', 'warning', 'question'), title (String), description (String, optional), severity (String — 'critical', 'high', 'medium', 'low'), status (String — 'open', 'in_progress', 'resolved', 'dismissed'), source (String — where the issue came from, e.g., 'sync', 'agent:developer', 'manual'), projectId (String, optional — FK to Project), assignedTo (String, optional — agent name), resolution (String, optional — how it was resolved), createdAt (DateTime), updatedAt (DateTime), resolvedAt (DateTime, optional). Run migration.

**Files to Modify:**
```
website/prisma/schema.prisma
```

**Acceptance Criteria:**
- [ ] Issue model added to schema.prisma with all specified fields
- [ ] Optional relation to Project model via projectId
- [ ] Migration runs successfully: npx prisma migrate dev --name add-issue-model
- [ ] npx prisma generate completes without errors
- [ ] Database has empty Issue table with correct columns
- [ ] Indexes on: type, severity, status, createdAt for efficient queries

---

### Phase 3B: Issues API

#### Task 3.2: Create GET /api/admin/issues endpoint with filtering

**Estimated Hours**: 2
**Dependencies**: 3.1

Build the issues listing endpoint. Supports query params: type (filter by issue type), severity (filter by severity), status (filter by status, defaults to 'open,in_progress' to hide resolved by default), projectId (filter by project), since (ISO date string — only issues created after this date). Returns issues sorted by severity (critical first), then by createdAt desc. Include counts by type and severity in the response for the summary bar.

**Files to Create:**
```
website/app/api/admin/issues/route.ts
```

**Acceptance Criteria:**
- [ ] GET /api/admin/issues returns 200 with { issues: [...], counts: { byType: {...}, bySeverity: {...}, total: N, open: N } }
- [ ] Supports ?type=blocker filter
- [ ] Supports ?severity=critical,high filter (comma-separated)
- [ ] Supports ?status=open (defaults to showing open + in_progress)
- [ ] Supports ?status=all to show everything including resolved
- [ ] Supports ?projectId=xxx filter
- [ ] Supports ?since=2025-01-01T00:00:00Z filter
- [ ] Results sorted by severity weight (critical=0, high=1, medium=2, low=3) then createdAt desc
- [ ] Requires admin authentication
- [ ] Empty state returns { issues: [], counts: { byType: {}, bySeverity: {}, total: 0, open: 0 } }

---

#### Task 3.3: Create POST /api/admin/issues endpoint

**Estimated Hours**: 1
**Dependencies**: 3.2

Build the issue creation endpoint. Accepts JSON body with required fields: type, title, severity. Optional fields: description, source, projectId, assignedTo. Validates type is one of the allowed values. Auto-sets status to 'open' and createdAt to now.

**Files to Modify:**
```
website/app/api/admin/issues/route.ts
```

**Acceptance Criteria:**
- [ ] POST /api/admin/issues with valid body returns 201 with created issue
- [ ] Validates type is one of: approval, blocker, error, warning, question
- [ ] Validates severity is one of: critical, high, medium, low
- [ ] Auto-sets status='open' and createdAt=now
- [ ] Returns 400 with descriptive error for invalid/missing fields
- [ ] Requires admin authentication

---

#### Task 3.4: Create PATCH /api/admin/issues/[id] for status transitions

**Estimated Hours**: 1-2
**Dependencies**: 3.2

Build the issue update endpoint. Primary use case is status transitions: open -> in_progress -> resolved/dismissed. When status changes to 'resolved' or 'dismissed', auto-set resolvedAt to now. Supports updating: status, assignedTo, resolution, severity, description. Validates status transitions are valid (cannot go from resolved back to open — must create a new issue if it recurs).

**Files to Create:**
```
website/app/api/admin/issues/[id]/route.ts
```

**Acceptance Criteria:**
- [ ] PATCH /api/admin/issues/[id] returns 200 with updated issue
- [ ] Status transitions validated: open->in_progress, open->resolved, open->dismissed, in_progress->resolved, in_progress->dismissed
- [ ] Invalid transitions return 400 (e.g., resolved->open)
- [ ] When status becomes 'resolved' or 'dismissed', resolvedAt is auto-set to now
- [ ] Resolution field is required when status is set to 'resolved'
- [ ] Returns 404 if issue id not found
- [ ] Requires admin authentication

---

### Phase 3C: Issues Tab UI

#### Task 3.5: Build IssueCard component

**Estimated Hours**: 2-3

Create an IssueCard component for displaying a single issue. Shows: type icon (approval=checkmark-circle, blocker=stop-sign, error=exclamation-triangle, warning=alert, question=question-mark), title, severity badge (critical=red, high=orange, medium=yellow, low=gray), status badge, source label, creation timestamp, assigned agent, and action buttons (Resolve, Dismiss, Assign). Resolution action should expand to show a text input for the resolution description.

**Files to Create:**
```
website/components/admin/mission-control/IssueCard.tsx
```

**Acceptance Criteria:**
- [ ] IssueCard renders type icon, title, severity badge, status badge, source, timestamp, assignee
- [ ] Type icons are distinct and recognizable (use Heroicons or similar)
- [ ] Severity badge colors: critical=red-500 bg, high=orange-500, medium=amber-500, low=gray-500
- [ ] Status badge: open=blue, in_progress=yellow, resolved=green, dismissed=gray
- [ ] Action buttons: 'Start' (open->in_progress), 'Resolve' (->resolved), 'Dismiss' (->dismissed)
- [ ] Resolve action expands inline text input for resolution description + confirm button
- [ ] Actions call PATCH /api/admin/issues/[id] and update card state on success
- [ ] Card has left border color matching severity (4px solid)
- [ ] Resolved/dismissed cards have reduced opacity (0.6) to visually de-emphasize

---

#### Task 3.6: Build IssuesTab component

**Estimated Hours**: 4-5
**Dependencies**: 3.2, 3.5, 1.1

Create the IssuesTab component that displays all issues with filtering and summary. Layout: (1) Top summary bar with counts — Critical (red), High (orange), Medium (yellow), Low (gray) as colored count badges, plus total open count, (2) Filter row with: type filter chips (All, Approvals, Blockers, Errors, Warnings, Questions), status toggle (Open/All), severity filter dropdown, (3) Issue cards in a vertical list (not grid — issues need full width for readability), (4) 'Report Issue' button that opens an inline form for manual issue creation. Group issues by type when showing 'All', or flat list when filtered to a specific type.

**Files to Create:**
```
website/components/admin/mission-control/IssuesTab.tsx
website/components/admin/mission-control/IssueForm.tsx
```

**Files to Modify:**
```
website/components/admin/mission-control/MissionControlTabs.tsx
website/components/admin/mission-control/types.ts
```

**Acceptance Criteria:**
- [ ] IssuesTab fetches from /api/admin/issues and renders IssueCards
- [ ] Summary bar shows count badges for each severity level with color coding
- [ ] Type filter chips filter by issue type (client-side from fetched data or re-fetch with param)
- [ ] Status toggle switches between showing open+in_progress only vs all including resolved
- [ ] Issues grouped by type when 'All' is selected, with section headers
- [ ] Issues sorted by severity within each group (critical first)
- [ ] Report Issue button opens IssueForm with fields: title, type (dropdown), severity (dropdown), description (textarea), project (dropdown)
- [ ] IssueForm submits to POST /api/admin/issues and refreshes list
- [ ] Loading state shows skeleton list
- [ ] Empty state: 'No open issues. Everything is running smoothly.'
- [ ] MissionControlTabs renders IssuesTab when Issues tab active
- [ ] Auto-refreshes every 30 seconds

---

### Phase 3D: Sync Script + Overview Integration

#### Task 3.7: Add issue auto-detection to sync script

**Estimated Hours**: 2-3
**Dependencies**: 3.1, 3.3

Update the sync script to automatically create Issue records when it detects problems in workspace data. Detection rules: (1) Tasks stuck in 'in_progress' for more than 48 hours -> create 'warning' issue, (2) Error entries in progress.md (lines containing 'ERROR', 'FAILED', 'BLOCKED') -> create 'error' or 'blocker' issue, (3) Questions or decision points in handoff-notes.md -> create 'question' issue. Each auto-created issue should have source='sync' and should not create duplicates (check for existing open issue with same title before creating).

**Files to Modify:**
```
website/scripts/sync-mission-control.js
```

**Acceptance Criteria:**
- [ ] Sync script detects tasks stuck in_progress > 48 hours and creates warning issues
- [ ] Sync script parses progress.md for error/failed/blocked keywords and creates issues
- [ ] All auto-created issues have source='sync' for identification
- [ ] Duplicate detection: skips creation if open issue with same title already exists
- [ ] Sync script logs issue detection results (detected: N, created: N, skipped duplicates: N)
- [ ] Existing sync functions unchanged and still work
- [ ] Does not create issues for resolved/completed items

---

#### Task 3.8: Update Overview tab to include issues metrics

**Estimated Hours**: 1-2
**Dependencies**: 3.1, 1.3, 1.5

Update the /api/admin/overview endpoint and the OverviewTab component to include issue-related metrics. Add to overview response: openIssueCount, criticalIssueCount, issuesByType counts. Update OverviewTab to show: (1) new MetricCard for 'Open Issues' with critical count as a red warning sub-metric, (2) if any critical issues exist, show a prominent alert banner at the top of the Overview tab with the critical issue titles.

**Files to Modify:**
```
website/app/api/admin/overview/route.ts
website/components/admin/mission-control/OverviewTab.tsx
```

**Acceptance Criteria:**
- [ ] GET /api/admin/overview now includes: openIssueCount, criticalIssueCount, issuesByType
- [ ] OverviewTab shows new 'Open Issues' MetricCard with count and red accent if critical > 0
- [ ] If criticalIssueCount > 0, a red alert banner appears at top of Overview with critical issue titles
- [ ] Alert banner has 'View Issues' button that switches to Issues tab
- [ ] MetricCard shows trend (comparing to last 7 days if possible, or just shows count)

---

## Technical Notes

- Issue status transitions are intentionally one-directional (open -> resolved, not resolved -> open). If an issue recurs, a new Issue should be created referencing the original. This preserves the audit trail.
- The severity ordering for display and sorting: critical (weight 0), high (1), medium (2), low (3). Store as strings but sort by this weight mapping.
- The sync script issue auto-detection is deliberately conservative — it only flags clear problems. False positives (creating issues that are not real problems) are worse than false negatives (missing some issues). Users can always create issues manually.
- The Issues tab refreshes every 30 seconds (more frequent than Overview's 60 seconds) because issues are more time-sensitive.
- The IssueCard resolve flow: click Resolve -> inline text input expands below the card -> user types resolution -> click Confirm -> PATCH API call with status='resolved' and resolution=text -> card fades to reduced opacity.
- For the 'approval' type, the resolution could be a simple Approve/Reject action. But in Phase 1, keep it as text-based resolve/dismiss to stay simple. Dedicated approval workflow can be enhanced later.
- Consider adding a 'snooze' action in a future sprint (temporarily dismiss for N hours). Not in scope for Sprint 3.

## Risks & Mitigations

- {'risk': 'Auto-detection in sync script might create noisy/false-positive issues', 'mitigation': "Start with high-confidence rules only (tasks stuck > 48h, explicit ERROR keywords). Include source='sync' so auto-generated issues can be easily filtered or bulk-dismissed. Add a 'muted' sources concept later if noise is excessive."}
- {'risk': 'Status transition validation might be too rigid for real-world use', 'mitigation': 'Keep validation simple in the API (warn but allow) and enforce in the UI (only show valid action buttons). If edge cases arise, transitions can be relaxed in a future update.'}
- {'risk': 'Issue volume could grow quickly, making the Issues tab unwieldy', 'mitigation': 'Default to showing only open + in_progress issues. Resolved issues hidden by default. Add pagination if the list grows beyond 50 items (not in Sprint 3 scope — monitor first).'}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 8 |
| Files to Create | 5 |
| Files to Modify | 7 |
| Estimated Duration | 1 week |
| Phases | 4 |
