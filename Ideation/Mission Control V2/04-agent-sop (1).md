# Mission Control v2: Agent Operating Procedure

**For:** Every Claude Code session, vault or repo, and the Mini's scheduled scripts
**Effective:** 2026-03-19 | **Roster rewritten:** 2026-08-05
**Replaces:** Previous task-management.md SOP
**System owner:** Jamie | **Weekly reviews:** vault session with Jamie

> **2026-08-05 — the named agents are gone.** This SOP was written for a roster
> of persistent named agents (Marvin, Ace, Merlin, Echo, Scribe, Bob, Scout).
> None of them run. The OpenClaw stack on the Mini was killed on 2026-05-23
> (`~/shared/reference/devices.md`), the EC2 host that ran Marvin was stopped on
> the same date and removed as a Syncthing peer on 2026-05-30, `05-PULSE.md`'s
> agent tables are empty, and `09-RECURRING.md` lists no owner but Jamie,
> Claude and plain automation.
>
> The workflow in this document survived; only the roster was fiction. Duties
> below are assigned to what actually exists: **Jamie**, **Claude Code sessions**
> and the **Mini's cron scripts**. Every script this SOP references was checked
> and still exists.

---

## System architecture

```
Mini cron writes (Mini) ──────────────────→ Mini parses → Neon (cloud)
Jamie + Claude sessions write (MacBook) → Syncthing → Mini parses → Neon (cloud)
                                                           ↓
                                               jamiewatters.work/admin
                                               (phone, MacBook, anywhere)
```

The Mac Mini is the hub. The sync script runs there. Files from the MacBook arrive via Syncthing. The dashboard reads from Neon.

## Six-layer hierarchy

All work fits within this hierarchy. Every session should understand where its tasks sit.

| Layer | What | Example | Who owns it | Dashboard location |
|-------|------|---------|-------------|-------------------|
| **L1: Vision + BHAG** | North star, reviewed annually | $10M ARR by 2030, truth-first | Jamie | Command View (North Star card) |
| **L2: Yearly Objectives** | 3-5 things true by Dec 31 | First $1 revenue, 4+ products above $1K MRR | Jamie sets, reviewed weekly with Jamie | Command View + /admin/goals |
| **L3: Quarterly KRs** | Measurable outcomes per quarter | Launch AImpactMonitor, first paying customer | Jamie sets, sessions execute | Command View + /admin/goals |
| **L4: Programs + Projects** | Programs = ongoing, Projects = time-bound | AI Search Mastery (program), Project Lighthouse (project) | Jamie approves, vault session tracks | /admin/portfolio (grouped by program) |
| **L5: Tasks** | Atomic units of work with T-ids | T-005: Update DNS records | Owning session | /admin/execution |
| **L6: Audit Log** | Every status change timestamped | T-005 ready→in_progress by the session that took it | Auto-logged | /admin/audit |

**Every task (L5) links to a project (L4), which belongs to a program (L4), which serves a quarterly KR (L3), which advances a yearly objective (L2), which moves toward the BHAG (L1).**

When creating tasks, note which project or KR it serves. If a task doesn't connect to any KR, question whether it should exist.

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

All canonical files are in `~/shared/mission-control/`. Git-tracked. Synced via Syncthing between the Mini and the MacBook.

| File | Purpose | Who updates it |
|------|---------|----------------|
| 00-DIRECTION.md | Yearly objectives, quarterly key results (also managed via /admin/goals) | Weekly review + Jamie (quarterly goal setting) |
| 01-PORTFOLIO.md | Product health, stages, kill dates | Weekly review |
| 02-PROJECTS.md | Master project index | Any session on status change |
| 03-SPRINT.md | Current 2-week battle plan | Task owners on status change |
| 04-BACKLOG.md | Prioritised future work queue | Any session adds; groomed in the weekly review |
| 05-PULSE.md | Real-time status (auto-generated) | Mini cron |
| 06-HITL.md | Items waiting on Jamie | Any session adds; Jamie resolves |
| 07-METRICS.md | Weekly performance scorecard | Weekly review |
| 08-LEARNING.md | Decisions, kill/park log, adaptation | Any session; reviewed weekly |
| 09-RECURRING.md | Recurring operations schedule | Maintained in the weekly review |
| 10-HEALTH.md | System/infrastructure health | Mini cron |

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
| `ready` | Triaged, assigned, can start | After triage assigns owner/priority |
| `in_progress` | Actively being worked on | When you start working |
| `waiting_on_jamie` | Needs Jamie's input | When you need approval/decision/review |
| `waiting_on_agent` | Depends on work owned elsewhere | When blocked by another session's task |
| `waiting_external` | Depends on outside service | Blocked by external API, vendor, etc. |
| `blocked` | Cannot proceed, unclear how | Stuck with no clear path forward |
| `done` | Completed with proof | Finished — must include concrete output |
| `archived` | Sprint over, moved to archive | Set at end of sprint |

**Rollout (Days 1-5):**
- Day 1-2: Start using `waiting_on_jamie` immediately (highest value)
- Day 3: Add `ready` and `inbox` (triage begins)
- Day 5: Full 9-status model active

---

## The 5 things you must do every session

### 1. Check your tasks at session start

Open `~/shared/mission-control/03-SPRINT.md` → find your tasks.
Check `~/shared/mission-control/06-HITL.md` → anything resolved that unblocks you?

### 2. Update status when you start work

- Change status to `in_progress` in 03-SPRINT.md
- Git commit: `@session: T-XXX in_progress`
- Log event:
  ```bash
  ~/shared/scripts/log-event.sh "session" "task" "T-XXX" "status_change" "ready" "in_progress" "Starting work" "P-X"
  ```

### 3. Handle blockers immediately

**If blocked on Jamie:**
- Change status to `waiting_on_jamie` in sprint
- Add entry to 06-HITL.md:

| Priority | T-ID | What's needed | Type | Requesting session | Project | Waiting since | Blocks |
|----------|------|---------------|------|------------------|---------|---------------|--------|
| P1 | T-XXX | Specific ask | review_and_edit | session | P-X | today's date | T-YYY |

- Types: `quick_yes_no` | `review_and_edit` | `decision` | `approve_with_conditions`
- Git commit + event log

**If blocked on work another session owns:**
- Change status to `waiting_on_agent`
- Set `Blocked by` to the T-id of the blocking task
- Git commit + event log

### 4. Log completion with proof

- Change status to `done` in sprint
- Git commit: `@session: T-XXX done — output: [concrete description]`
- Event log with output
- Memory log: `- Completed: (T-XXX) [concrete output with counts]`

**Good:** `- Completed: (T-005) Domain housekeeping for AImpactScanner — 3 DNS records updated, SSL verified`
**Bad:** `- Completed: (T-005) Did domain housekeeping`

### 5. End-of-session summary

- Update all task statuses (commit + event log)
- Write memory log with T-id references
- Final commit: `@session: Session end — X tasks progressed, Y completed`

---

## How to create a new task

1. Get T-id: `~/shared/scripts/next-tid.sh`
2. Add to 04-BACKLOG.md:
   ```
   - [ ] (T-XXX) Description @context #type -- Project: P-X
   ```
3. Git commit: `@YourName: T-XXX created — description`
4. Event log: action=created

If urgent: raise it with Jamie for sprint inclusion.

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
@vault: T-005 in_progress — starting domain housekeeping
@vault: T-005 done — 3 DNS records updated, SSL verified
@vault: Triaged 4 inbox items in backlog
@vault: Weekly review 2026-03-23 complete
@jamiewatters: T-002 waiting_on_jamie — homepage copy ready for review
```

Inside a repo, use that repo's own convention instead. The live repos use
Conventional Commits with the T-id or issue ID in the body, not this `@name`
form, and the machine-readable status lives in Mission Control via
`repo-done.py`, not in the commit subject:

```
fix(website): replace the last 16 explicit `any` types (JW-ISS-21)
```

---

## Event log

```bash
~/shared/scripts/log-event.sh "SessionName" "entity" "id" "action" "from" "to" "reason" "project"
```

Examples:
```bash
~/shared/scripts/log-event.sh "vault" "task" "T-005" "status_change" "ready" "in_progress" "Starting domain work" "P-2"
~/shared/scripts/log-event.sh "vault" "task" "T-005" "status_change" "in_progress" "done" "3 DNS records updated" "P-2"
```

---

## Decision-rights matrix

| Decision | Jamie | Vault session | Repo session |
|----------|-------|---------------|--------------|
| Strategic priorities | Decides | Recommends | -- |
| Create projects | Approves | Proposes | Proposes |
| Kill/park a product | Decides | Recommends + flags | -- |
| Move work into sprint | Approves | Proposes | -- |
| Task priority (P0) | Approves | -- | -- |
| Task priority (P1-P2) | -- | Decides | Own tasks |
| Triage inbox | -- | Decides | -- |
| Enforce WIP limits | -- | Enforces | -- |
| Approve session output | Decides | -- | -- |
| System/infra changes | Approves | Proposes | Executes in its own repo |
| Edit a quality gate | Only Jamie | Blocked | Blocked |

---

## Who does what

There are three actors, not a roster of named agents. Which one you are depends
on where the session was started, not on an identity you carry between sessions.

### Vault session — Claude Code in `~/shared`
The second brain and Mission Control itself.
- **Triage:** assign owners and priorities to inbox backlog items
- **Stale detection:** flag tasks `in_progress` more than 3 days with no update
- **WIP enforcement:** max 7 for Jamie, 8 projects
- **Strategic alignment:** every task should link to a project or KR
- **Weekly review with Jamie:** update 00-DIRECTION, 01-PORTFOLIO, 07-METRICS, 08-LEARNING
- **Kill date and P0 flags:** surface them in the daily plan, since nothing pushes notifications now
- **Capture and reconcile:** `mc-task.py`, `mc-issue.py`, `mc-done.py`, `repo-reconcile.py`
- Hands repo changes to a repo session rather than editing a live repo from here

### Repo session — Claude Code inside a repo
- Technical build work in that repo, and only that repo
- Dashboard work for jamiewatters.work/admin
- Content: blog posts, product pages, help docs, email copy, via the `jamie-voice`
  and `jamie-content` skills; publish with `jpub`, which also posts to X and
  LinkedIn, so there is no separate posting step or posting agent
- **Capture at source:** `repo-issue.py` to raise, `repo-done.py` to close, never
  a hand-written status cell
- Raise anything cross-cutting to Mission Control rather than minting local IDs

### Mini automation — cron on the Mac Mini
No judgement, only scheduled scripts.
- `new-day.sh` (06:00 ET) — pre-creates the day's skeleton with the deadline radar
- `eod-nudge.sh` (20:00 ET) — pushes Jamie's phone if the reflection is still empty
- `mc-shipped.py` — computes the real day rather than what anyone remembers
- Sync script and pulse generation
- `readwise-pull.py` (06:30 ET)

### Jamie
Decides, approves, and does anything that must be a deliberate human action,
including editing quality gates, which agents are blocked from touching.

### Open gaps

These were Marvin's, and are deliberately not reassigned to the Mini, because
both were watching the Mini from outside it. A watcher running on the box it
watches reports nothing when that box is the thing that failed.

- **Sync health:** alert if the Mini's sync goes stale (was: >30 min). Unowned.
  Needs an off-box checker, not a Mini cron. Raised as ISS-51.
- **Product uptime:** HTTP checks on the five sites. Unowned. Same gap as
  JW-ISS-17 in the JamieWatters repo, which proposes an external UptimeRobot
  check with phone alerts. Close it there, not here.
- **Push notifications generally:** kill-date and P0 alerts used to arrive by
  Telegram from EC2. Nothing pushes them now except `eod-nudge.sh`, so they
  depend on someone reading the daily plan.

---

## Changes to session context files

### Add to SOUL.md or AGENTS.md

```markdown
## Mission Control integration

This session operates within Mission Control at ~/shared/mission-control/.

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

## Transition timeline (historical, March 2026)

_Kept for the record. This rollout was carried out by the agent roster that has
since been decommissioned. The file structure and the nine-status model it
describes are still live._

**Day 1-2:** Build the file structure on the Mini. Old plan/ files work via symlinks. Start using T-ids in memory logs immediately.

**Day 3:** Circulate this SOP. Start using 06-HITL.md for items waiting on Jamie. Start using `waiting_on_jamie` status. Overnight.md usage stops.

**Day 5:** Full 9-status model. Daily triage begins. Everything following this SOP.

**Day 14:** Old plan/ symlinks retired. Overnight.md deleted. System fully operational.

---

## Quarterly goals cadence

Every quarter has a review/setting cycle. This is Jamie's responsibility, supported by a Claude session.

| When | What | Who | Dashboard |
|------|------|-----|-----------|
| Last week of quarter | Review outgoing quarter's KRs | Jamie + Claude session | /admin/goals → Review |
| Last week of quarter | Review yearly objectives, adjust if needed | Jamie + Claude session | /admin/goals → Review |
| Last week of quarter | Set incoming quarter's KRs, link to yearly objectives | Jamie + Claude session | /admin/goals → + Quarterly KR |
| Last week of Q4 | Set next year's yearly objectives + review BHAG | Jamie + Claude session | /admin/goals → + Yearly Objective |

**The vault session's role:** After Jamie sets goals, update 00-DIRECTION.md to match and carry them into the weekly review. Flag it if KRs don't connect to yearly objectives, or if yearly objectives drift from the BHAG.

**Every session:** At sprint planning, check that sprint tasks connect to the current quarter's KRs. If a task doesn't serve any KR, question its priority.

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
