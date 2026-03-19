# Mission Control v2: Agent Operating Procedure

**For:** All agents (Marvin, Ace, Merlin, Echo, Agent-11, and future agents)
**Effective:** 2026-03-19
**Replaces:** Previous task-management.md SOP
**System owner:** Merlin (Mini) | **Weekly reviews:** Marvin (EC2)

---

## System architecture

```
Agents write (Mini) ──────────────────→ Mini parses → Neon (cloud)
Jamie/Agent-11 write (MacBook) → Syncthing → Mini parses → Neon (cloud)
Marvin writes (EC2) → Syncthing ─────→ Mini parses → Neon (cloud)
                                                           ↓
                                               jamiewatters.work/admin
                                               (phone, MacBook, anywhere)
```

The Mac Mini is the hub. The sync script runs there. Files from MacBook and EC2 arrive via Syncthing. The dashboard reads from Neon.

## Six-layer hierarchy

All work fits within this hierarchy. Every agent should understand where their tasks sit.

| Layer | What | Example | Who owns it | Dashboard location |
|-------|------|---------|-------------|-------------------|
| **L1: Vision + BHAG** | North star, reviewed annually | $10M ARR by 2030, truth-first | Jamie | Command View (North Star card) |
| **L2: Yearly Objectives** | 3-5 things true by Dec 31 | First $1 revenue, 4+ products above $1K MRR | Jamie sets, Marvin reviews | Command View + /admin/goals |
| **L3: Quarterly KRs** | Measurable outcomes per quarter | Launch AImpactMonitor, first paying customer | Jamie sets, all agents execute | Command View + /admin/goals |
| **L4: Programs + Projects** | Programs = ongoing, Projects = time-bound | AI Search Mastery (program), Project Lighthouse (project) | Jamie approves, Merlin tracks | /admin/portfolio (grouped by program) |
| **L5: Tasks** | Atomic units of work with T-ids | T-005: Update DNS records | Owner agent | /admin/execution |
| **L6: Audit Log** | Every status change timestamped | T-005 ready→in_progress by Ace | Auto-logged | /admin/audit |

**Every task (L5) links to a project (L4), which belongs to a program (L4), which serves a quarterly KR (L3), which advances a yearly objective (L2), which moves toward the BHAG (L1).**

When creating tasks, agents should note which project/KR it serves. If a task doesn't connect to any KR, question whether it should exist.

---

## The golden rule (updated)

**No sustained work proceeds outside the system.** Ideas can happen anywhere, but anything requiring more than 30 minutes of effort must have a T-id before work begins.

Before doing ANY work:
1. Check `~/shared/mission-control/03-SPRINT.md` — is it a current sprint task?
2. Check `~/shared/mission-control/04-BACKLOG.md` — is it a future task?
3. If not found → create the task with a T-id FIRST, then work on it
4. If found → update its status and work on it

---

## File locations

All canonical files are in `~/shared/mission-control/`. Git-tracked. Synced via Syncthing across Mini, EC2, and MacBook.

| File | Purpose | Who updates it |
|------|---------|----------------|
| 00-DIRECTION.md | Yearly objectives, quarterly key results (also managed via /admin/goals) | Marvin (weekly review) + Jamie (quarterly goal setting) |
| 01-PORTFOLIO.md | Product health, stages, kill dates | Marvin (weekly review) |
| 02-PROJECTS.md | Master project index | Any agent on status change |
| 03-SPRINT.md | Current 2-week battle plan | Task owners on status change |
| 04-BACKLOG.md | Prioritised future work queue | Any agent adds; Merlin grooms |
| 05-PULSE.md | Real-time status (auto-generated) | Merlin's cron on Mini |
| 06-HITL.md | Items waiting on Jamie | Any agent adds; Jamie resolves |
| 07-METRICS.md | Weekly performance scorecard | Marvin (weekly review) |
| 08-LEARNING.md | Decisions, kill/park log, adaptation | Any agent; reviewed weekly |
| 09-RECURRING.md | Recurring operations schedule | Merlin maintains |
| 10-HEALTH.md | System/infrastructure health | Merlin's cron on Mini |

---

## How to get a T-id

```bash
~/shared/scripts/next-tid.sh
```

Returns e.g. `T-021` and increments the counter. Use this T-id everywhere: sprint, backlog, memory logs, git commits, event log.

---

## Task statuses (9 states)

| Status | Meaning | When to use it |
|--------|---------|----------------|
| `inbox` | New, untriaged | Creating a task that hasn't been assigned |
| `ready` | Triaged, assigned, can start | After Merlin assigns owner/priority |
| `in_progress` | Actively being worked on | When you start working |
| `waiting_on_jamie` | Needs Jamie's input | When you need approval/decision/review |
| `waiting_on_agent` | Depends on another agent | When blocked by another agent's task |
| `waiting_external` | Depends on outside service | Blocked by external API, vendor, etc. |
| `blocked` | Cannot proceed, unclear how | Stuck with no clear path forward |
| `done` | Completed with proof | Finished — must include concrete output |
| `archived` | Sprint over, moved to archive | Set by Merlin at end of sprint |

**Rollout (Days 1-5):**
- Day 1-2: Start using `waiting_on_jamie` immediately (highest value)
- Day 3: Add `ready` and `inbox` (Merlin begins triaging)
- Day 5: Full 9-status model active

---

## The 5 things you must do every session

### 1. Check your tasks at session start

Open `~/shared/mission-control/03-SPRINT.md` → find your tasks.
Check `~/shared/mission-control/06-HITL.md` → anything resolved that unblocks you?

### 2. Update status when you start work

- Change status to `in_progress` in 03-SPRINT.md
- Git commit: `@YourName: T-XXX in_progress`
- Log event:
  ```bash
  ~/shared/scripts/log-event.sh "YourName" "task" "T-XXX" "status_change" "ready" "in_progress" "Starting work" "P-X"
  ```

### 3. Handle blockers immediately

**If blocked on Jamie:**
- Change status to `waiting_on_jamie` in sprint
- Add entry to 06-HITL.md:

| Priority | T-ID | What's needed | Type | Requesting agent | Project | Waiting since | Blocks |
|----------|------|---------------|------|------------------|---------|---------------|--------|
| P1 | T-XXX | Specific ask | review_and_edit | YourName | P-X | today's date | T-YYY |

- Types: `quick_yes_no` | `review_and_edit` | `decision` | `approve_with_conditions`
- Git commit + event log

**If blocked on another agent:**
- Change status to `waiting_on_agent`
- Set `Blocked by` to the T-id of the blocking task
- Git commit + event log

### 4. Log completion with proof

- Change status to `done` in sprint
- Git commit: `@YourName: T-XXX done — output: [concrete description]`
- Event log with output
- Memory log: `- Completed: (T-XXX) [concrete output with counts]`

**Good:** `- Completed: (T-005) Domain housekeeping for AImpactScanner — 3 DNS records updated, SSL verified`
**Bad:** `- Completed: (T-005) Did domain housekeeping`

### 5. End-of-session summary

- Update all task statuses (commit + event log)
- Write memory log with T-id references
- Final commit: `@YourName: Session end — X tasks progressed, Y completed`

---

## How to create a new task

1. Get T-id: `~/shared/scripts/next-tid.sh`
2. Add to 04-BACKLOG.md:
   ```
   - [ ] (T-XXX) Description @context #type -- Project: P-X
   ```
3. Git commit: `@YourName: T-XXX created — description`
4. Event log: action=created

If urgent: tell Merlin to assess for sprint inclusion.

---

## Memory log format

Daily memory file must use T-id references:

```markdown
### HH:MM UTC — Session summary

- Completed: (T-005) Domain housekeeping — 3 DNS records updated
- In progress: (T-007) ECHO workspace — directory structure created
- Blocked: (T-004) Baseline measurement — waiting on T-002 approval
- Created: (T-021) Content publishing automation task
- Next: Continue T-007, start T-011 if T-002 unblocks
```

T-id references are mandatory. Without them, metrics cannot count your output.

---

## Git commit format

```
@AgentName: T-XXX action — description
```

Examples:
```
@Ace: T-005 in_progress — starting domain housekeeping
@Ace: T-005 done — 3 DNS records updated, SSL verified
@Merlin: Triaged 4 inbox items in backlog
@Marvin: Weekly review 2026-03-23 complete
@Agent-11: T-002 waiting_on_jamie — homepage copy ready for review
```

---

## Event log

```bash
~/shared/scripts/log-event.sh "AgentName" "entity" "id" "action" "from" "to" "reason" "project"
```

Examples:
```bash
~/shared/scripts/log-event.sh "Ace" "task" "T-005" "status_change" "ready" "in_progress" "Starting domain work" "P-2"
~/shared/scripts/log-event.sh "Ace" "task" "T-005" "status_change" "in_progress" "done" "3 DNS records updated" "P-2"
```

---

## Decision-rights matrix

| Decision | Jamie | Merlin | Marvin | Execution agents |
|----------|-------|--------|--------|------------------|
| Strategic priorities | Decides | Recommends | -- | -- |
| Create projects | Approves | Proposes | Proposes | Proposes |
| Kill/park a product | Decides | Recommends | Flags | -- |
| Move work into sprint | Approves | Proposes | Proposes | -- |
| Task priority (P0) | Approves | -- | -- | -- |
| Task priority (P1-P2) | -- | Decides | -- | Own tasks |
| Triage inbox | -- | Decides | -- | -- |
| Enforce WIP limits | -- | Enforces | -- | -- |
| Approve agent outputs | Decides | -- | -- | -- |
| System/infra changes | Approves | Executes (Mini) | Executes (EC2) | -- |

---

## Agent-specific duties

### Merlin (Mac Mini) — COO + System Builder + Auditor
- **Own the sync pipeline:** sync script, pulse generation, crons on Mini
- **Daily triage:** assign owners/priorities to inbox backlog items
- **Stale detection:** flag tasks in_progress >3 days with no update
- **WIP enforcement:** max 7 Jamie, 5 per agent, 8 projects
- **Strategic alignment:** every task should link to a project/KR

### Marvin (EC2) — Infrastructure + Weekly Reviews + Alerts
- **Weekly review:** update 00-DIRECTION, 01-PORTFOLIO, 07-METRICS, 08-LEARNING
- **Kill date alerts:** Telegram notification 7 days before kill date
- **P0 HITL alerts:** Telegram notification when P0 items added
- **Backup health:** monitor Mini sync is running (alert if >30 min stale)
- **Product uptime:** HTTP checks on 5 sites

### Ace (Mac Mini) — Marketing + Growth
- Own AI Search product tasks (LTM, AIS, AIM, ASA)
- Execute marketing and growth work
- Update statuses with T-ids and event log entries

### Echo (Mac Mini) — Social Media
- Post approval requests to 06-HITL.md (type: quick_yes_no)
- Log engagement metrics in memory
- Update pulse with social activity notes

### Agent-11 (MacBook) — Development + Dashboard + Goals
- Technical build tasks across all dev repos (AImpactMonitor, LLMTxtMastery, IsoTracker, Evolve-7, AISearchArena, AISearchMastery, SoloMarket, FreeCalcHub, AImpactScanner, BOS-AI, etc.)
- Dashboard development for jamiewatters.work/admin (Mission Control V2)
- Goals management: support Jamie during quarterly goal setting/review via /admin/goals
- Update statuses with T-ids
- Deployed on Jamie's MacBook via Claude Code — one instance across all repos

---

## Changes to agent files

### Add to SOUL.md or AGENTS.md

```markdown
## Mission Control integration

I operate within Mission Control at ~/shared/mission-control/.

At session start:
1. Check 03-SPRINT.md for my assigned tasks
2. Check 06-HITL.md for resolved items that unblock me
3. Update task status to in_progress when I begin work

During work:
- Log all status changes via Git commit and event log script
- Reference T-ids in all memory log entries
- Add items to 06-HITL.md when I need Jamie's input
- Be specific in HITL requests: "Approve copy draft" not "Need input"

At session end:
- Update all task statuses
- Write memory log with T-id references
- Final Git commit with session summary

I never start sustained work (>30 min) without a T-id.
```

### Add to USER.md

```markdown
## Mission Control preferences

Jamie checks 3 surfaces daily:
- Command view or 05-PULSE.md (AM)
- 06-HITL.md (AM + PM, P0 same-day)
- Today's 3 in 03-SPRINT.md (AM)

HITL requests: one clear ask per item, specific not vague.
Done descriptions: concrete with counts, not "did the work."
Jamie has ADHD — minimize cognitive load.
```

### Add to knowledge/

Create `knowledge/mission-control-quick-ref.md`:

```markdown
# Mission Control quick reference

Files: ~/shared/mission-control/
T-id script: ~/shared/scripts/next-tid.sh
Event log: ~/shared/scripts/log-event.sh

Statuses: inbox | ready | in_progress | waiting_on_jamie |
          waiting_on_agent | waiting_external | blocked | done | archived

Git: @AgentName: T-XXX action — description
Memory: - Completed: (T-XXX) concrete output with counts

HITL types: quick_yes_no | review_and_edit | decision | approve_with_conditions
HITL outcomes: approved | approved_with_changes | rework_requested | deferred | rejected

WIP limits: 7 Jamie, 5 per agent, 8 active projects
```

---

## Transition timeline

**Day 1-2:** Merlin builds file structure on Mini. Old plan/ files work via symlinks. Start using T-ids in memory logs immediately.

**Day 3:** Send this SOP to all agents. Start using 06-HITL.md for items waiting on Jamie. Start using `waiting_on_jamie` status. Overnight.md usage stops.

**Day 5:** Full 9-status model. Merlin begins daily triage. All agents following this SOP.

**Day 14:** Old plan/ symlinks retired. Overnight.md deleted. System fully operational.

---

## Quarterly goals cadence

Every quarter has a review/setting cycle. This is Jamie's responsibility with Agent-11 support.

| When | What | Who | Dashboard |
|------|------|-----|-----------|
| Last week of quarter | Review outgoing quarter's KRs | Jamie + Agent-11 | /admin/goals → Review |
| Last week of quarter | Review yearly objectives, adjust if needed | Jamie + Agent-11 | /admin/goals → Review |
| Last week of quarter | Set incoming quarter's KRs, link to yearly objectives | Jamie + Agent-11 | /admin/goals → + Quarterly KR |
| Last week of Q4 | Set next year's yearly objectives + review BHAG | Jamie + Agent-11 | /admin/goals → + Yearly Objective |

**Marvin's role:** After Jamie sets goals, Marvin updates 00-DIRECTION.md to match and incorporates into weekly reviews. Marvin should flag if KRs don't connect to yearly objectives or if yearly objectives drift from the BHAG.

**All agents:** At sprint planning, check that sprint tasks connect to the current quarter's KRs. If a task doesn't serve any KR, question its priority.

---

## What success looks like

**After 1 week:**
- Every sprint task has a T-id
- Every memory log references T-ids
- HITL queue is the single place to request Jamie's input
- Pulse shows real-time status without manual effort

**After 2 weeks:**
- Dashboard shows live mission control data
- Jamie's daily MC time is under 10 minutes
- Stale tasks caught within 24 hours
- Weekly metrics show throughput and strategic alignment

---

*Truth is the currency of the future. This system makes truth visible.*
