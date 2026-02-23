# Mission Control v2 - Sprint Plan

**PRD**: `/Users/jamiewatters/shared/1-Projects/products/mission-control-v2/PRD.md`
**Created**: 2026-02-23
**Total Estimated Duration**: 4-6 weeks

---

## Sprint Overview

| Sprint | Title | Duration | Status | Tasks |
|--------|-------|----------|--------|-------|
| 1 | [Tab Navigation + Overview + Kanban](Sprint-1-Tab-Navigation-Overview-Kanban.md) | 1-2 weeks | PLANNED | 9 |
| 2 | [Goals + Enhanced Projects](Sprint-2-Goals-Projects-Tabs.md) | 1 week | PLANNED | 9 |
| 3 | [Issues + Approvals](Sprint-3-Issues-Approvals-Tab.md) | 1 week | PLANNED | 8 |
| 4 | [Agents + Live Data + Polish](Sprint-4-Agents-Live-Data-Polish.md) | 1-2 weeks | PLANNED | 13 |

**Total Tasks**: 39

---

## PRD Phase Mapping

| PRD Phase | Sprint | Notes |
|-----------|--------|-------|
| Phase 1: Navigation + Overview + Kanban | Sprint 1 | Foundation - tab system + two most-used views |
| Phase 2: Projects + Goals | Sprint 2 | Strategic visibility - goal tracking + enhanced portfolio |
| Phase 3: Issues + Approvals | Sprint 3 | Attention management - blockers, approvals, error log |
| Phase 4: Agents + Live Data | Sprint 4 | Agent monitoring + real-time polling |
| Phase 5: Polish + Bidirectional Sync | Sprint 4 | Combined with Phase 4 for delivery efficiency |

---

## New Database Models (across all sprints)

| Model | Sprint | Purpose |
|-------|--------|---------|
| Goal | 2 | Strategic target tracking (MRR, users, velocity) |
| Issue | 3 | Blockers, approvals, errors, warnings |
| AgentStatus | 4 | Agent monitoring and live status |

## New API Endpoints (across all sprints)

| Endpoint | Sprint | Method |
|----------|--------|--------|
| `/api/admin/overview` | 1 | GET |
| `/api/admin/goals` | 2 | GET, POST |
| `/api/admin/goals/[id]` | 2 | PATCH, DELETE |
| `/api/admin/issues` | 3 | GET, POST |
| `/api/admin/issues/[id]` | 3 | PATCH |
| `/api/admin/agents` | 4 | GET |

---

## Dependencies Between Sprints

```
Sprint 1 (Tab Navigation + Overview + Kanban)
    |
    ├── Sprint 2 (Goals + Projects) — requires tab system from Sprint 1
    |
    ├── Sprint 3 (Issues + Approvals) — requires tab system from Sprint 1
    |
    └── Sprint 4 (Agents + Live Data + Polish) — requires all previous sprints
```

Sprint 1 is the foundation. Sprints 2 and 3 can run in parallel if needed. Sprint 4 depends on all previous sprints being complete.

---

## How to Execute

```bash
# Start Sprint 1
/coord build sprints/Sprint-1-Tab-Navigation-Overview-Kanban.md

# After Sprint 1 complete, start Sprint 2
/coord build sprints/Sprint-2-Goals-Projects-Tabs.md

# Then Sprint 3
/coord build sprints/Sprint-3-Issues-Approvals-Tab.md

# Finally Sprint 4
/coord build sprints/Sprint-4-Agents-Live-Data-Polish.md
```
