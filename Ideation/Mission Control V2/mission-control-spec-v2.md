# Mission Control System: Design Specification v2.0

**Version:** 2.0 (Final)
**Date:** 2026-03-19
**System Owner:** Marvin
**System Auditor:** Merlin
**Status:** Ready for prototype implementation
**Strategic Link:** Enables everything else. Implements Core Values #2 (Radical Transparency), #5 (Extreme Systemization), #6 (Ruthless Pruning), #7 (Speed Over Perfection).

---

## The Seven Questions Test

Mission Control passes if Jamie can answer all seven in under 60 seconds:

1. What matters now?
2. Who owns it?
3. What is blocked?
4. What is waiting on Jamie?
5. What shipped today?
6. Are the agents healthy and useful?
7. Are we making progress toward the quarter?

If the system cannot answer these, it is a report, not mission control.

---

## Jamie Mode

Jamie interacts with exactly 3 surfaces daily. Everything else is background machinery.

| Surface | When | Time |
|---------|------|------|
| **Command view** (dashboard or 05-PULSE.md) | AM check-in | 3 min |
| **HITL queue** (06-HITL.md) | AM + PM | 2 min each |
| **Today's 3** (top of 03-SPRINT.md) | AM, after HITL | 1 min |

Total daily system time: ~10 minutes. All other files are maintained by agents. Jamie edits only when resolving HITL items or making strategic decisions.

---

## Five-Layer Architecture

```
Layer 1: DIRECTION     -> Vision, values, yearly objectives, quarterly key results
Layer 2: PORTFOLIO     -> Products, programs, stage, health, economics, kill dates
Layer 3: EXECUTION     -> Projects, tasks (T-ids), dependencies, HITL queue, sprint
Layer 4: OPERATIONS    -> Agent health, daily pulse, handoffs, recurring ops, system health
Layer 5: LEARNING      -> Metrics, reviews, decisions, kill/park log, adaptation signals
                          ^ Feedback loop back to Direction ^
```

---

## File Architecture

```
~/shared/mission-control/          <- Git-tracked (Marvin inits, all agents commit)
|-- 00-DIRECTION.md                <- Yearly objectives + quarterly key results
|-- 01-PORTFOLIO.md                <- All products, one row each, with kill dates
|-- 02-PROJECTS.md                 <- Master index of all active projects
|-- 03-SPRINT.md                   <- Current 2-week battle plan (max 7 Jamie items)
|-- 04-BACKLOG.md                  <- Prioritised queue with T-ids
|-- 05-PULSE.md                    <- Real-time "what is happening now" (mostly generated)
|-- 06-HITL.md                     <- Human-in-the-loop queue (waiting on Jamie)
|-- 07-METRICS.md                  <- Weekly scorecard + performance data
|-- 08-LEARNING.md                 <- Decisions, kill/park log, adaptation, retrospectives
|-- 09-RECURRING.md                <- Recurring operations templates + schedule
|-- 10-HEALTH.md                   <- Automated system/infrastructure health
|-- events/
|   |-- YYYY-MM-DD.jsonl           <- Structured operational event log (append-only)
|-- projects/                      <- One file per active project
|   |-- project-lighthouse.md
|   |-- echo-mvp.md
|   |-- plebtest-mvp.md
|   |-- modeloptix-mvp.md
|   |-- benchmark-improvement.md
|   |-- aimpactmonitor-mvp.md
|   |-- mission-control-build.md
|-- agents/                        <- One file per agent (profile + current state)
|   |-- marvin.md
|   |-- ace.md
|   |-- merlin.md
|   |-- echo.md
|   |-- agent-11.md
|-- archive/                       <- Completed sprints, done tasks, historical data
    |-- sprints/
    |   |-- sprint-YYYY-MM-DD.md
    |-- pulse/
        |-- YYYY-MM-DD.md
```

**Numbered files:** Agents and Jamie see them in priority/reading order.

**Dual audit trail:**
- **Git:** Every file change = a commit. Format: `@Agent: T-123 status_change todo->in_progress`. Infrastructure-level history.
- **Event log (events/YYYY-MM-DD.jsonl):** One JSON line per business event. Structured, queryable, reliable. Operational-level history. Format:
```json
{"ts":"2026-03-19T14:30:00Z","actor":"Ace","entity":"task","id":"T-005","action":"status_change","from":"todo","to":"in_progress","reason":"Starting domain housekeeping","project":"P-2"}
```

**Sync conflict prevention:** Each agent owns specific sections of shared files. For 05-PULSE.md: each agent writes only to their own row. For 06-HITL.md: agents append only; Jamie resolves. Marvin's cron handles file-wide regeneration.

---

## Canonical File Schemas

### 00-DIRECTION.md

```markdown
# Direction

## Guiding star
"Truth is the Currency of the Future."

## 2026 yearly objectives

| ID | Objective | Metric | Target | Current | Status | Confidence |
|----|-----------|--------|--------|---------|--------|------------|
| O-1 | First dollar revenue | MRR | >$0 | $0 | not_started | medium |
| O-2 | 4+ products above $1K MRR | count | 4 | 0 | not_started | medium |
| O-3 | 5K+ engaged followers | followers | 5000 | -- | not_started | low |
| O-4 | 10-15 products launched | count | 10 | 3 | in_progress | medium |

## Q2 2026 key results

| ID | Key result | Parent | Metric | Target | Current | Due | Status |
|----|-----------|--------|--------|--------|---------|-----|--------|
| KR-1 | Launch AImpactMonitor | O-1 | live + 1 user | 1 | 0 | 2026-04-30 | not_started |
| KR-2 | First paying customer | O-1 | paying users | 1 | 0 | 2026-06-30 | not_started |
| KR-3 | Lighthouse phase 1 done | O-2 | phase complete | 1 | 0 | 2026-05-15 | in_progress |
| KR-4 | PlebTest MVP live | O-4 | live | yes | no | 2026-03-24 | in_progress |

Updated: weekly by Marvin during review
```

### 01-PORTFOLIO.md

```markdown
# Portfolio

| Product | Owner | Program | Stage | Tier | Health | Next milestone | Kill date | Next proof point | MRR |
|---------|-------|---------|-------|------|--------|----------------|-----------|------------------|-----|
| LLMtxt Mastery | Ace | AI Search | launch | NOW | green | Homepage live | 2026-07-01 | First organic signup | $0 |
| AImpactScanner | Ace | AI Search | launch | NOW | green | Fix This lists | 2026-07-01 | First scan by non-Jamie user | $0 |
| AImpactMonitor | Ace | AI Search | build | NOW | amber | MVP live | 2026-07-01 | Working citation tracker | $0 |
| AI Search Arena | -- | AI Search | launch | NOW | green | Benchmark v2 | 2026-07-01 | Second benchmark published | $0 |
| PlebTest | Jamie | -- | build | NEXT | at_risk | MVP launch | 2026-07-01 | First simulated interview | $0 |
| ModelOptix | Jamie | -- | build | NEXT | at_risk | MVP launch (overdue) | 2026-07-01 | Working dashboard | $0 |
| Evolve-7 | -- | -- | idea | LATER | -- | Scope definition | -- | -- | $0 |
| SoloMarket | -- | -- | idea | LATER | -- | PRD review | -- | -- | $0 |

Definitions:
- Health: green (on track) | amber (at risk) | red (blocked/failing)
- Stage: idea -> build -> launch -> growth -> parked -> killed
- Tier: NOW -> NEXT -> LATER (from Priority Stack)
- Kill date: Hard date. Marvin sends alert 7 days before. Product must show traction or gets parked/killed.
- Next proof point: The single most important evidence milestone for this stage.

Updated: weekly by Marvin
```

### 02-PROJECTS.md

```markdown
# Projects

| ID | Project | Program | Owner | Key result | Tier | Status | Progress | Due | Blocker |
|----|---------|---------|-------|-----------|------|--------|----------|-----|---------|
| P-1 | Project Lighthouse | AI Search | Jamie + Ace | KR-3 | NOW | active | 3/10 phases | 2026-06-08 | -- |
| P-2 | Benchmark Improvement | AI Search | Ace | KR-3 | NOW | at_risk | 0/4 phases | 2026-03-13 | OVERDUE |
| P-3 | AImpactMonitor MVP | AI Search | Ace | KR-1 | NOW | not_started | 0/4 scope items | 2026-03-13 | OVERDUE |
| P-4 | ECHO MVP | AI Search | Marvin/Ace | -- | NOW | design | 0/6 setup steps | -- | Jamie: polling freq decision |
| P-5 | PlebTest MVP | -- | Jamie | KR-4 | NEXT | active | 3/4 scope items | 2026-03-24 | -- |
| P-6 | ModelOptix MVP | -- | Jamie | O-4 | NEXT | at_risk | 3/4 scope items | 2026-03-16 | OVERDUE |
| P-7 | Mission Control Build | Infra | Marvin | -- | NOW | active | -- | 2026-03-21 | -- |

Progress: expressed as concrete counts (3/10 phases, 2/4 features), never percentages.
Justification: Each project must answer: Why now? What happens if delayed 14 days?

Updated: as status changes (any agent), reviewed weekly by Marvin
```

### 03-SPRINT.md

```markdown
# Sprint: 2026-03-17 -> 2026-03-30

Max 7 active Jamie items. Max 5 per agent. WIP limits are initial defaults -- tune based on throughput.

## Today's 3 (Jamie)
1. T-001 Apply entity fixes (Lighthouse)
2. T-002 Approve homepage copy (Lighthouse) -- HITL
3. T-006 PlebTest payment setup

## Full sprint

| T-ID | Task | Owner | Project | Mode | Size | Status | Blocked by | Due |
|------|------|-------|---------|------|------|--------|------------|-----|
| T-001 | Apply entity fixes (Actions 1-5) | Jamie | P-1 | build | M | in_progress | -- | 03-20 |
| T-002 | Implement homepage rewrite | Agent-11 | P-1 | build | L | waiting_on_jamie | Jamie: approve copy | -- |
| T-003 | Schema markup implementation | Agent-11 | P-1 | build | M | ready | T-002 | -- |
| T-004 | Run baseline measurement | Ace | P-1 | build | M | ready | -- | -- |
| T-005 | AS-5 domain housekeeping | Ace | P-2 | build | S | in_progress | -- | 03-20 |
| T-006 | PlebTest payment setup | Jamie | P-5 | build | M | todo | -- | 03-24 |
| T-007 | Create ECHO workspace | Ace | P-4 | build | S | todo | -- | -- |

Mode: build | growth | content | admin
Size: S (< 1h) | M (1-3h) | L (3h+)
Context tags on backlog items: @home @mini @ec2 @anywhere

Updated: by task owner on every status change (git commit + event log entry required)
```

### 04-BACKLOG.md

```markdown
# Backlog

## P0 -- Next sprint candidates

- [ ] (T-008) LT-4 LLMtxt Mastery domain housekeeping @mini #ai-search #build -- Project: P-2
- [ ] (T-009) Set up ECHO SOUL.md and AGENTS.md @mini #ai-search #build -- Project: P-4
- [ ] (T-010) AImpactMonitor citation tracking MVP @mini #ai-search #build -- Project: P-3

## P1 -- Important but not urgent

- [ ] (T-011) Dogfood llms.txt on own properties @anywhere #ai-search #build -- Project: P-1
- [ ] (T-012) Content publishing automation setup @mini #growth #build -- Project: ASM Marketing
- [ ] (T-013) PlebTest first 10 user interviews @anywhere #validation -- Project: P-5

## P2 -- Someday/later

- [ ] (T-014) Evolve-7 scope definition @anywhere #portfolio #strategy
- [ ] (T-015) SoloMarket PRD review @anywhere #portfolio #strategy
- [ ] (T-016) FreeCalcHub strategy review @anywhere #portfolio #strategy

Format: (T-id) Description @context #product #type -- Project: P-id
Contexts: @home @mini @ec2 @anywhere
Types: #build #growth #content #research #support #strategy

T-id counter: stored in .counter file. Next available: T-017.

Updated: any agent adds items; Merlin grooms weekly
```

### 05-PULSE.md

```markdown
# Daily pulse: 2026-03-19
*Mostly generated by Marvin's cron from task statuses. Agents add freeform notes only.*
*Reset daily at 06:00 UK time.*

## Active now
(Auto-generated from tasks with status = in_progress)

| Agent | Task | Project | Since | Notes |
|-------|------|---------|-------|-------|
| Ace | T-005 AS-5 domain housekeeping | Benchmark | 09:15 | Running DNS checks |
| Marvin | T-007 Mission Control build | MC Build | 08:00 | -- |
| Echo | -- | -- | -- | Not yet deployed |
| Merlin | -- | -- | -- | Awaiting first assignment |
| Agent-11 | -- | -- | -- | Awaiting T-002 approval |

## Completed today
(Auto-generated from tasks moved to done today + agent freeform additions)

| Agent | Task | Project | Completed | Output |
|-------|------|---------|-----------|--------|
| Jamie | T-001 (partial) Updated LTM description | Lighthouse | 10:30 | 2 of 5 properties done |

## Waiting on Jamie
(Auto-generated from 06-HITL.md)

| Priority | Task | Agent | Waiting since |
|----------|------|-------|---------------|
| P0 | T-002 Approve homepage copy | Agent-11 | 03-18 |

## Agent health
(Auto-generated from agent heartbeats + task statuses)

| Agent | Machine | Status | Last activity | Queue | Exceptions |
|-------|---------|--------|---------------|-------|------------|
| Marvin | EC2 | healthy | 5 min ago | 2 | 0 |
| Ace | Mini | healthy | 15 min ago | 3 | 0 |
| Merlin | Mini | idle | -- | 0 | 0 |
| Echo | Mini | not_deployed | -- | 0 | -- |
| Agent-11 | Local | waiting_approval | -- | 1 | 0 |

## System health
(Auto-generated from 10-HEALTH.md)

| System | Status | Last check |
|--------|--------|------------|
| Syncthing | green | 5 min ago |
| MC sync cron | green | 06:00 |
| Product uptime | green | 15 min ago |
```

### 06-HITL.md (Human-in-the-loop queue)

```markdown
# Waiting on Jamie

*Sorted by impact. P0 items trigger Telegram notification. Address P0 same-day.*

| Priority | T-ID | What's needed | Type | Requesting agent | Project | Waiting since | Blocks |
|----------|------|---------------|------|------------------|---------|---------------|--------|
| P0 | T-002 | Approve homepage copy | review_and_edit | Agent-11 | Lighthouse | 03-18 | T-003 (schema) |
| P1 | T-005 | Verify domain DNS changes | quick_yes_no | Ace | Benchmark | 03-19 | Phase 1 |
| P1 | -- | Decide ECHO polling frequency | decision | Marvin | ECHO MVP | 03-16 | ECHO Phase 0 |
| P2 | -- | Review ModelOptix MVP scope | review_and_edit | -- | ModelOptix | 03-10 | MVP launch |

Approval types: quick_yes_no | review_and_edit | decision | approve_with_conditions
Resolution outcomes: approved | approved_with_changes | rework_requested | deferred | rejected

## Resolved today

| T-ID | What was needed | Resolved | Outcome | Notes |
|------|-----------------|----------|---------|-------|
| -- | -- | -- | -- | -- |

Rules:
- Any task moving to waiting_on_jamie MUST add an entry here.
- P0 items trigger Telegram notification via notify_jamie skill.
- Items waiting >48 hours are flagged amber in weekly review.
- Items waiting >5 days are flagged red and escalated.

Updated: by any agent when they need Jamie; by Jamie when resolved
```

### 07-METRICS.md

```markdown
# Metrics: Week of 2026-03-17

## Strategic (are we doing the right things?)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Q2 key results on track | 1/4 | 4/4 | at_risk |
| Active work linked to a goal | 70% | 90% | needs_attention |
| Effort in NOW tier | 65% | 80% | needs_attention |
| Active projects vs WIP limit (8) | 7 | <=8 | ok |

## Execution (are things moving?)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Tasks completed this week | 8 | 15 | below |
| HITL queue avg wait time | 2.1 days | <1 day | needs_attention |
| Blocked items count | 3 | <=2 | needs_attention |
| Oldest blocker age | 4 days | <3 days | needs_attention |
| Sprint completion rate | 40% | 80% | below |

## Agent performance (are agents healthy and useful?)

| Agent | Tasks done | Acceptance rate | Exceptions | Stale (>3d) | Status |
|-------|-----------|-----------------|------------|-------------|--------|
| Marvin | 5 | 100% | 0 | 0 | healthy |
| Ace | 3 | 100% | 0 | 1 | healthy |
| Merlin | 0 | -- | 0 | 0 | idle |
| Echo | 0 | -- | -- | 0 | not_deployed |
| Agent-11 | 0 | -- | 0 | 1 | waiting_approval |

## Product/business (are products earning their place?)

| Product | Stage | MRR | Users | This week tasks | Kill date | Days remaining |
|---------|-------|-----|-------|-----------------|-----------|----------------|
| LLMtxt Mastery | launch | $0 | 0 | 3 | 2026-07-01 | 103 |
| AImpactScanner | launch | $0 | 0 | 2 | 2026-07-01 | 103 |
| PlebTest | build | $0 | 0 | 1 | 2026-07-01 | 103 |

## Drift alert
Tasks completed this week not linked to any active project or goal: 2/8 (25%)
-> Review these in weekly to determine if they should be linked or dropped.

## Throughput by mode
| Owner | Build | Growth | Content | Admin | Total |
|-------|-------|--------|---------|-------|-------|
| Jamie | 3 | 0 | 0 | 2 | 5 |
| Ace | 3 | 0 | 0 | 0 | 3 |
| Total | 6 | 0 | 0 | 2 | 8 |

Updated: Mondays by Marvin's weekly review script
```

### 08-LEARNING.md

```markdown
# Learning log

## Decision register

| ID | Date | Decision | Owner | Context | Options considered | Chosen | Review date | Impact |
|----|------|----------|-------|---------|-------------------|--------|-------------|--------|
| D-1 | 2026-03-19 | Mission Control architecture | Jamie | System design | File-based vs DB, 8 vs 11 files | 11-file markdown + event log | 2026-04-19 | Enables all tracking |

## Kill/park decisions

| Date | Product/Project | Decision | Reason | Lesson |
|------|----------------|----------|--------|--------|
| -- | -- | -- | -- | -- |

## Adaptation insights

| Date | Observation | Action taken | Outcome |
|------|-------------|--------------|---------|
| 2026-03-19 | HITL queue avg wait too high | Added P0 Telegram alerts + approval types | TBD |

## Process improvements

| Date | What changed | Why | Measured impact |
|------|-------------|-----|-----------------|
| 2026-03-19 | Moved to 11-file mission control system | Strategic alignment gap, no HITL visibility | TBD |

## Weekly review notes

### Week of 2026-03-17
- Strategy: 70% of effort on NOW -- need to push to 80%
- Execution: HITL queue is the #1 bottleneck
- Operations: Echo not deployed, Merlin idle -- capacity wasted
- Economics: No revenue yet -- KR-1 (AImpactMonitor) is critical path

## Auto-generated learning candidates
(Marvin appends these automatically for review)
- Tasks blocked >5 days: [list]
- KRs past due: [list]
- Projects with no activity in 7 days: [list]

Updated: weekly during review + as decisions happen
```

### 09-RECURRING.md

```markdown
# Recurring operations

| ID | Operation | Owner | Cadence | Last completed | Next due | SLA | Status |
|----|-----------|-------|---------|----------------|----------|-----|--------|
| R-1 | Echo social monitoring heartbeat | Echo | 30 min | -- | -- | <30 min | not_started |
| R-2 | Ace daily check-in | Ace | daily | -- | -- | by 09:00 UK | not_started |
| R-3 | Marvin morning brief | Marvin | daily | -- | -- | by 07:00 UK | not_started |
| R-4 | Pulse regeneration | Marvin | daily | -- | 2026-03-20 06:00 | by 06:00 UK | active |
| R-5 | Weekly review | Marvin + Jamie | weekly (Sun) | -- | 2026-03-23 | by EOD Sun | active |
| R-6 | Sprint planning | Marvin + Jamie | biweekly (Mon) | 2026-03-17 | 2026-03-31 | by EOD Mon | active |
| R-7 | Portfolio health check | Marvin | weekly | -- | 2026-03-23 | during review | active |
| R-8 | Content publishing | Ace/Echo | 2-3x/week | -- | -- | per calendar | not_started |
| R-9 | Metrics update | Marvin | weekly (Mon) | -- | 2026-03-24 | by EOD Mon | active |
| R-10 | Kill date alerts | Marvin | daily | -- | -- | 7 days before kill date | active |
| R-11 | Monthly revenue reconciliation | Marvin | monthly | -- | 2026-04-01 | by 3rd of month | not_started |
| R-12 | Quarterly strategy review | Jamie + Marvin | quarterly | -- | 2026-06-30 | end of quarter | not_started |

Overdue rule: If last_completed + cadence > now, status = overdue.
Overdue items for Jamie-owned ops surface in 06-HITL.md.
Overdue items for agent-owned ops surface in agent health (05-PULSE.md).

Updated: Marvin maintains; Merlin audits for staleness
```

### 10-HEALTH.md

```markdown
# System health

| System | Owner | Check method | Expected interval | Last success | Status | Alert threshold |
|--------|-------|-------------|-------------------|-------------|--------|-----------------|
| Syncthing (EC2 <-> Mini) | Marvin | folder sync timestamp | 5 min | -- | -- | >15 min |
| MC sync cron | Marvin | cron log | daily 06:00 UK | -- | -- | missed run |
| Product uptime (5 sites) | Marvin | HTTP check | 15 min | -- | -- | any 5xx or timeout |
| Git push (MC repo) | Marvin | last push timestamp | daily | -- | -- | >24h no push |
| Dashboard sync | Marvin | dashboard last_updated | hourly | -- | -- | >2h stale |
| Daily backup | Marvin | backup log | daily | -- | -- | missed run |

Status: green (within threshold) | amber (approaching threshold) | red (past threshold)

On red: Marvin auto-creates a T-id task in 03-SPRINT.md with P0 priority.
On amber: Marvin logs to events/ and flags in weekly review.

Updated: Marvin via cron
```

---

## Task Status Model

9 states that map to real workflow:

```
inbox -> ready -> in_progress -> done -> archived
                     |
               waiting_on_agent -> in_progress
               waiting_on_jamie -> in_progress (adds to 06-HITL.md)
               waiting_external -> in_progress
               blocked -> in_progress
```

| Status | Meaning | Who sets it |
|--------|---------|-------------|
| inbox | New, untriaged | Any agent |
| ready | Triaged, assigned, can start | Merlin (grooming) or Marvin (sprint) |
| in_progress | Someone is actively working | Task owner |
| waiting_on_agent | Depends on another agent's output | Task owner |
| waiting_on_jamie | Needs Jamie input/approval/decision | Any agent (auto-adds to 06-HITL.md) |
| waiting_external | Depends on something outside the system | Task owner |
| blocked | Cannot proceed, unclear resolution | Task owner |
| done | Completed with concrete output description | Task owner |
| archived | Sprint over, moved to archive | Marvin (end of sprint) |

**Transition to 9 states:** Agents currently use 4 states (TODO/IN_PROGRESS/DONE/BLOCKED). The key additions are `waiting_on_jamie` and `ready`. Roll out over 1 week:
- Day 1: Introduce `waiting_on_jamie` (highest value, simplest change)
- Day 3: Introduce `ready` and `inbox` (Merlin begins triaging)
- Day 5: Introduce `waiting_on_agent` and `waiting_external` (full model)

---

## Project Status Model

| Status | Meaning |
|--------|---------|
| proposed | Idea stage, not approved |
| approved | Approved, waiting for sprint slot |
| active | Has tasks in current sprint |
| at_risk | Behind schedule or unresolved blockers |
| blocked | Cannot proceed |
| complete | All deliverables shipped |
| parked | Deliberately paused (reason in 08-LEARNING.md) |
| killed | Shut down (reason in 08-LEARNING.md) |

---

## Agent Status Model

| Status | Meaning |
|--------|---------|
| healthy | Running, completing tasks, no exceptions |
| busy | High queue, no issues |
| waiting_approval | Has items in HITL queue |
| error | Had exceptions in last run |
| stalled | No activity in >24h with assigned tasks |
| idle | No assigned tasks |
| offline | Not deployed or unreachable |

---

## Decision-Rights Matrix

| Decision | Jamie | Merlin | Marvin | Ace/Echo/others |
|----------|-------|--------|--------|-----------------|
| Set/change strategic priorities | Decides | Recommends | -- | -- |
| Create projects | Approves | Proposes | Proposes | Proposes |
| Kill or park a product/project | Decides | Recommends | Flags | -- |
| Move work into sprint | Approves | Proposes | Proposes | -- |
| Change task priority | Approves (P0) | Decides (P1-P2) | -- | Own tasks only |
| Triage inbox items | -- | Decides | -- | -- |
| Enforce WIP limits | -- | Enforces | -- | -- |
| Approve agent outputs | Decides | -- | -- | -- |
| System/infra changes | Approves | -- | Proposes + executes | -- |
| Resolve conflicts between agents | Decides | Escalates | -- | -- |

Merlin can act without Jamie on: triaging inbox, setting P1/P2 priority, enforcing WIP limits, grooming backlog, flagging stale work. Merlin cannot: change strategic priorities, kill products, approve agent outputs, or override Jamie's decisions.

---

## Agent Roles in Mission Control

| Agent | Machine | Role | MC duties |
|-------|---------|------|-----------|
| Marvin | EC2 | Infra + System Owner | Git, crons, sync, weekly review automation, health monitoring, pulse generation, kill date alerts |
| Merlin | Mini | COO + System Auditor | Groom backlog, triage inbox, flag stale tasks (>3d no update), validate strategic alignment, route tasks, enforce WIP, recommend reprioritization |
| Ace | Mini | Marketing + Growth | Own AI Search product tasks, commit status changes, log with T-ids |
| Echo | Mini | Social Media | Post approval requests to HITL, log engagement metrics |
| Agent-11 | Local (Claude Code) | Dev execution | Own technical build tasks (Lighthouse code), commit status changes |
| Jamie | Laptop | Owner + Bottleneck | Check HITL AM+PM, resolve P0 same-day, pick Today's 3, make strategic decisions |
| Future agents | Mini | Content/Research/CS | Own domain tasks, follow same commit + event log rules |

---

## Workflows

### 1. Intake

```
New work surfaces -> Agent creates task in 04-BACKLOG.md with T-id
                  -> Must include: project link, owner, mode, size, context tag
                  -> Git commit: "@Agent: T-XXX created -- description"
                  -> Event log entry: action=created
                  -> If urgent: flag for Merlin to assess sprint inclusion
```

**Rule:** No sustained work proceeds outside the system. Ideas and ad-hoc insights can happen anywhere, but anything requiring >30 minutes of effort gets a T-id first.

### 2. Triage (Merlin, daily)

```
Merlin checks 04-BACKLOG.md inbox items
-> Assigns: owner, priority, context, project link, mode, size
-> Validates: does this serve a current key result? If not, flag as "unlinked"
-> Moves ready items to ready status
-> Git commit + event log
```

### 3. Sprint planning (Marvin + Jamie, sprint boundaries)

```
Marvin proposes next sprint from top of groomed backlog
-> Jamie approves/adjusts
-> Max 7 Jamie items, max 5 per agent (initial defaults, tune based on throughput)
-> Every sprint item must link to a project or key result
-> Items moved from 04-BACKLOG.md to 03-SPRINT.md
-> Git commit + event log
```

### 4. Execution (all agents + Jamie)

```
Pick task from 03-SPRINT.md -> Update status to in_progress
-> Git commit + event log entry
-> Marvin's cron auto-updates 05-PULSE.md "Active now"

If blocked on Jamie:
-> Status to waiting_on_jamie
-> Add entry to 06-HITL.md (with approval type and impact)
-> If P0: trigger Telegram notification via notify_jamie
-> Git commit + event log

When done:
-> Status to done
-> Log in daily memory: "- Completed: (T-XXX) description / concrete output"
-> Git commit + event log with output description
-> Marvin's cron auto-updates 05-PULSE.md "Completed today"
```

### 5. Jamie's daily routine (10 minutes total)

```
AM (5 min):
-> Open 05-PULSE.md or dashboard Command view
-> Check 06-HITL.md -> address P0 immediately
-> Pick Today's 3 from 03-SPRINT.md

PM (5 min):
-> Check 06-HITL.md -> resolve any new items
-> Glance at 05-PULSE.md completed section
```

### 6. Daily close (all agents)

Each agent, end of session:
- Update own task statuses (git commit + event log)
- Write memory log with T-id references: `- Completed: (T-XXX) output description`
- Marvin's cron regenerates 05-PULSE.md from task statuses

### 7. Weekly review (Marvin-led, Sundays)

Four lenses, 30 minutes:

**Strategy:** Update 00-DIRECTION.md KR progress. Check effort distribution (target 80% NOW). Flag unlinked work (drift).

**Execution:** Update 02-PROJECTS.md progress (concrete counts). Review blocked items >3 days. Sprint completion rate.

**Operations:** Update agent health. Check 09-RECURRING.md for overdue ops. HITL queue review -- is Jamie the bottleneck?

**Economics:** Update 01-PORTFOLIO.md health and MRR. Check kill dates approaching. Auto-generate learning candidates for 08-LEARNING.md.

Output: Updated files + git commit + 07-METRICS.md refresh.

### 8. Monthly review (Jamie + Marvin)

- Review quarterly key results vs actual
- Portfolio kill/park/accelerate decisions (logged in 08-LEARNING.md)
- Update 00-DIRECTION.md if priorities shift

---

## Metrics That Matter

Four groups. See 07-METRICS.md for the full scorecard.

**Strategic:** KRs on/off track, % work linked to goal, effort by tier, project WIP.
**Execution:** Tasks completed, HITL wait time, blocked count/age, sprint completion, cycle time.
**Agent performance:** Tasks done, acceptance rate, exceptions, stale tasks, HITL friction (>48h).
**Product/business:** Stage progression, MRR, launches, kill dates, build-in-public content published.

---

## Design Principles

1. **Human-in-the-loop is explicit.** `waiting_on_jamie` is a separate state with its own queue, priority, aging, approval types, and resolution outcomes.

2. **Evidence beats narrative.** Progress = concrete counts ("3/10 phases"), never percentages. Kill criteria = hard dates, not text strings.

3. **Every active project justifies itself.** Must answer: Why now? What happens if delayed 14 days? Unlinked projects flagged weekly.

4. **WIP stays low.** Initial defaults: 7 Jamie, 5/agent, 8 projects. Tune based on throughput.

5. **Agents are operational units.** Health, queue metrics, exceptions, stale alerts, recurring op SLAs.

6. **No sustained work proceeds outside the system.** Ideas can happen anywhere; anything >30 min gets a T-id.

7. **Ruthless pruning is operationalized.** Kill dates, auto-generated learning candidates, decision register.

8. **Jamie Mode: 3 surfaces.** Command view, HITL queue, Today's 3. Everything else is background.

9. **Pulse is mostly generated.** Agents update task statuses; Marvin's cron assembles the picture. Minimal manual ceremony.

10. **Dual audit trail.** Git for file history. Event log (JSONL) for structured operational events. Both indexed by T-id.

---

## Implementation Plan

### Day 1: Foundation (Marvin, 2-3 hours)

- [ ] Create ~/shared/mission-control/ directory structure
- [ ] git init + .gitignore
- [ ] Create all 11 canonical files with initial content from existing project files
- [ ] Create agent profile files in agents/ (including agent-11.md)
- [ ] Set up T-id counter (.counter file, starting at T-017)
- [ ] Create events/ directory with today's JSONL file
- [ ] Set up daily cron: regenerate 05-PULSE.md at 06:00 UK time
- [ ] Set up daily cron: archive previous day's pulse
- [ ] Symlink from ~/shared/plan/ for backward compatibility

### Day 2: Workflows (Marvin + Merlin, 2-3 hours)

- [ ] Populate 03-SPRINT.md from current active work (add T-ids)
- [ ] Populate 04-BACKLOG.md from current backlog (add T-ids)
- [ ] Populate 06-HITL.md with known items waiting on Jamie
- [ ] Populate 09-RECURRING.md with all known recurring ops
- [ ] Update task-management SOP to reference mission-control/ as canonical
- [ ] Brief agents on: T-id references in memory logs, commit format, event log writes
- [ ] Introduce waiting_on_jamie status (Day 1 of rollout)

### Day 3: Automation + Dashboard (Marvin, 2-3 hours)

- [ ] Write pulse generation script (parse task statuses -> 05-PULSE.md)
- [ ] Write sync script (parse mission-control/*.md -> JSON for web dashboard)
- [ ] Wire P0 HITL items to Telegram via notify_jamie
- [ ] Set up health checks in 10-HEALTH.md
- [ ] Push initial data to jamiewatters.work/admin/mission-control
- [ ] Run first weekly review with Jamie to validate

### Day 5: Full status model (Merlin)

- [ ] Introduce ready and inbox statuses
- [ ] Begin daily triage workflow
- [ ] Introduce waiting_on_agent and waiting_external
- [ ] Confirm all agents are committing with T-ids and writing event log entries

### Success criteria

- [ ] Jamie can answer all 7 questions in under 60 seconds
- [ ] Jamie's daily MC time is under 10 minutes
- [ ] Every active task has a T-id and project link
- [ ] HITL queue shows all items with priority, type, and age
- [ ] P0 HITL items trigger Telegram notification
- [ ] 05-PULSE.md auto-regenerates from task statuses
- [ ] Git log + event JSONL provide complete audit trail
- [ ] Kill dates have hard dates with 7-day advance alerts
- [ ] No agent starts sustained work without a T-id

---

## What This System Does Not Do (by design, for now)

These are deferred to v2 based on review feedback. They are good ideas that would add complexity before the foundation is proven:

- Full ER data model (derive from file schemas when building dashboard)
- Tech stack specification for dashboard (already Next.js/Vercel)
- Dependency map visualization (blocked_by fields sufficient at 4 agents / 8 projects)
- Capacity model with planned vs actual hours (measure throughput, not utilization)
- YAML frontmatter / one-file-per-task storage (markdown tables work at <100 tasks)
- Per-agent API cost tracking (track monthly at portfolio level)
- Programs as separate file (Program column in PORTFOLIO.md is sufficient)
- Benchmark runs as structured data (keep as project tasks with T-ids)

Review these at the 30-day retrospective.

---

*Truth is the currency of the future. This system makes truth visible -- about what matters, what's moving, what's stuck, and whether effort is going where it should. Jamie Mode keeps it usable. The dual audit trail keeps it honest. The kill dates keep it ruthless.*
