# Mission Control v2: Agent Implementation Spec

**For:** Merlin (Mac Mini — primary builder) + Marvin (EC2 — backup/alerts)
**From:** Jamie
**Date:** 2026-03-19
**Priority:** P0 — This enables everything else
**Reference:** Mission Control System Design Specification v2.0

---

## Architecture overview

```
Agents write (Mini) ──────────────────→ Mini parses → Neon (cloud)
Jamie/Agent-11 write (MacBook) → Syncthing → Mini parses → Neon (cloud)
Marvin writes (EC2) → Syncthing ─────→ Mini parses → Neon (cloud)
                                                           ↓
                                               jamiewatters.work reads
                                               (phone, MacBook, anywhere)
```

The Mac Mini is the hub. Most agents write files here directly. The sync script runs here. Files from MacBook and EC2 arrive via Syncthing. The Mini parses everything and pushes to Neon Postgres. The dashboard at jamiewatters.work reads from Neon.

---

## Ownership split

| Responsibility | Owner | Machine |
|----------------|-------|---------|
| File structure creation | Merlin | Mini |
| Sync script + crons | Merlin | Mini |
| Pulse generation | Merlin | Mini |
| Git repo (mission-control/) | Merlin | Mini |
| Event log writer utility | Merlin (creates), all agents (use) | Mini |
| Backup sync health check | Marvin | EC2 |
| Kill date + P0 Telegram alerts | Marvin | EC2 |
| Weekly review automation | Marvin | EC2 (writes files, Syncthing delivers to Mini) |
| Dashboard development | Agent-11 + Jamie | MacBook |
| Website deployment | Agent-11 | MacBook → GitHub → Netlify |

---

## Phase 1: File structure (Merlin, Day 1)

### 1.1 Create the directory

On the Mac Mini:

```bash
mkdir -p ~/shared/mission-control/{projects,agents,archive/sprints,archive/pulse,events}
cd ~/shared/mission-control
git init
echo "*.swp" > .gitignore
echo ".DS_Store" >> .gitignore
```

Syncthing will replicate this to EC2 and MacBook automatically.

### 1.2 Create the T-id counter

```bash
echo "21" > ~/shared/mission-control/.counter
```

This is the next available T-id number (T-001 through T-020 are pre-assigned below).

**Script to get next T-id** — save as `~/shared/scripts/next-tid.sh`:

```bash
#!/bin/bash
COUNTER_FILE=~/shared/mission-control/.counter
NUM=$(cat "$COUNTER_FILE")
printf "T-%03d\n" "$NUM"
echo $((NUM + 1)) > "$COUNTER_FILE"
```

```bash
chmod +x ~/shared/scripts/next-tid.sh
```

### 1.3 Create all 11 canonical files

Create each file in `~/shared/mission-control/`. Content below is pre-populated from Jamie's existing project files.

---

**00-DIRECTION.md:**

```markdown
# Direction

## Guiding star
"Truth is the Currency of the Future."

## 2026 yearly objectives

| ID | Objective | Metric | Target | Current | Status | Confidence |
|----|-----------|--------|--------|---------|--------|------------|
| O-1 | First dollar revenue | MRR | >$0 | $0 | not_started | medium |
| O-2 | 4+ products above $1K MRR | count | 4 | 0 | not_started | medium |
| O-3 | 5K+ engaged followers | followers | 5000 | 0 | not_started | low |
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

---

**01-PORTFOLIO.md:**

```markdown
# Portfolio

| Product | Owner | Program | Stage | Tier | Health | Next milestone | Kill date | Next proof point | MRR |
|---------|-------|---------|-------|------|--------|----------------|-----------|------------------|-----|
| LLMtxt Mastery | Ace | AI Search | launch | NOW | green | Homepage live | 2026-07-01 | First organic signup | $0 |
| AImpactScanner | Ace | AI Search | launch | NOW | green | Fix This lists | 2026-07-01 | First non-Jamie scan | $0 |
| AImpactMonitor | Ace | AI Search | build | NOW | amber | MVP live | 2026-07-01 | Working citation tracker | $0 |
| AI Search Arena | -- | AI Search | launch | NOW | green | Benchmark v2 | 2026-07-01 | Second benchmark published | $0 |
| PlebTest | Jamie | -- | build | NEXT | at_risk | MVP launch | 2026-07-01 | First simulated interview | $0 |
| ModelOptix | Jamie | -- | build | NEXT | at_risk | MVP launch | 2026-07-01 | Working dashboard | $0 |
| Evolve-7 | -- | -- | idea | LATER | -- | Scope definition | -- | -- | $0 |
| SoloMarket | -- | -- | idea | LATER | -- | PRD review | -- | -- | $0 |

Updated: weekly by Marvin
```

---

**02-PROJECTS.md:**

```markdown
# Projects

| ID | Project | Program | Owner | Key result | Tier | Status | Progress | Due | Blocker |
|----|---------|---------|-------|-----------|------|--------|----------|-----|---------|
| P-1 | Project Lighthouse | AI Search | Jamie + Ace | KR-3 | NOW | active | 3/10 phases | 2026-06-08 | -- |
| P-2 | Benchmark Improvement | AI Search | Ace | KR-3 | NOW | at_risk | 0/4 phases | 2026-03-13 | OVERDUE |
| P-3 | AImpactMonitor MVP | AI Search | Ace | KR-1 | NOW | not_started | 0/4 items | 2026-03-13 | OVERDUE |
| P-4 | ECHO MVP | AI Search | Merlin/Ace | -- | NOW | design | 0/6 steps | -- | Jamie: polling freq |
| P-5 | PlebTest MVP | -- | Jamie | KR-4 | NEXT | active | 3/4 items | 2026-03-24 | -- |
| P-6 | ModelOptix MVP | -- | Jamie | O-4 | NEXT | at_risk | 3/4 items | 2026-03-16 | OVERDUE |
| P-7 | Mission Control Build | Infra | Merlin | -- | NOW | active | 0/5 phases | 2026-03-24 | -- |

Updated: as status changes (any agent), reviewed weekly
```

---

**03-SPRINT.md:**

```markdown
# Sprint: 2026-03-17 -> 2026-03-30

## Today's 3 (Jamie)
1. T-001 Apply entity fixes (Lighthouse)
2. T-002 Approve homepage copy (Lighthouse)
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
| T-008 | Create MC file structure | Merlin | P-7 | build | M | in_progress | -- | 03-20 |
| T-009 | Build MC sync script | Merlin | P-7 | build | L | todo | T-008 | 03-22 |
| T-010 | MC dashboard update spec | Jamie | P-7 | build | M | done | -- | 03-19 |

Updated: by task owner on every status change
```

---

**04-BACKLOG.md:**

```markdown
# Backlog

## P0 -- Next sprint candidates

- [ ] (T-011) LT-4 LLMtxt Mastery domain housekeeping @mini #ai-search #build -- Project: P-2
- [ ] (T-012) Set up ECHO SOUL.md and AGENTS.md @mini #ai-search #build -- Project: P-4
- [ ] (T-013) AImpactMonitor citation tracking MVP @mini #ai-search #build -- Project: P-3
- [ ] (T-014) Wire P0 HITL to Telegram notification @ec2 #infra #build -- Project: P-7

## P1 -- Important but not urgent

- [ ] (T-015) Dogfood llms.txt on own properties @anywhere #ai-search #build -- Project: P-1
- [ ] (T-016) Content publishing automation setup @mini #growth #build
- [ ] (T-017) PlebTest first 10 user interviews @anywhere #validation -- Project: P-5

## P2 -- Someday/later

- [ ] (T-018) Evolve-7 scope definition @anywhere #portfolio #strategy
- [ ] (T-019) SoloMarket PRD review @anywhere #portfolio #strategy
- [ ] (T-020) FreeCalcHub strategy review @anywhere #portfolio #strategy

Format: (T-id) Description @context #type -- Project: P-id
Contexts: @home @mini @ec2 @anywhere
```

---

**05-PULSE.md:**

```markdown
# Daily pulse: 2026-03-19
*Auto-generated by Merlin's cron from task statuses. Agents add freeform notes only.*
*Reset daily at 06:00 UK time.*

## Active now

| Agent | Task | Project | Since | Notes |
|-------|------|---------|-------|-------|
| Merlin | T-008 Create MC file structure | P-7 | 14:00 | Building directory structure |

## Completed today

| Agent | Task | Project | Completed | Output |
|-------|------|---------|-----------|--------|
| Jamie | T-010 MC dashboard update spec | P-7 | 13:00 | v2 spec complete |

## Waiting on Jamie

| Priority | Task | Agent | Waiting since |
|----------|------|-------|---------------|
| P0 | T-002 Approve homepage copy | Agent-11 | 03-18 |
| P1 | Decide ECHO polling frequency | Merlin | 03-16 |

## Agent health

| Agent | Machine | Status | Last activity | Queue | Exceptions |
|-------|---------|--------|---------------|-------|------------|
| Marvin | EC2 | healthy | -- | 0 | 0 |
| Ace | Mini | idle | -- | 3 | 0 |
| Merlin | Mini | healthy | now | 2 | 0 |
| Echo | Mini | not_deployed | -- | 0 | -- |
| Agent-11 | MacBook | waiting_approval | -- | 1 | 0 |

## System health

| System | Status | Last check |
|--------|--------|------------|
| Syncthing | -- | -- |
| MC sync cron | -- | not yet configured |
| Product uptime | -- | -- |
```

---

**06-HITL.md:**

```markdown
# Waiting on Jamie

| Priority | T-ID | What's needed | Type | Requesting agent | Project | Waiting since | Blocks |
|----------|------|---------------|------|------------------|---------|---------------|--------|
| P0 | T-002 | Approve homepage copy | review_and_edit | Agent-11 | P-1 | 03-18 | T-003 |
| P1 | -- | Decide ECHO polling frequency | decision | Merlin | P-4 | 03-16 | P-4 Phase 0 |
| P2 | -- | Review ModelOptix MVP scope | review_and_edit | -- | P-6 | 03-10 | MVP launch |

## Resolved today

| T-ID | What was needed | Resolved | Outcome | Notes |
|------|-----------------|----------|---------|-------|
```

---

**07-METRICS.md:**

```markdown
# Metrics: Week of 2026-03-17

## Strategic

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Q2 key results on track | 1/4 | 4/4 | at_risk |
| Active work linked to a goal | -- | 90% | -- |
| Effort in NOW tier | -- | 80% | -- |
| Active projects vs WIP limit (8) | 7 | <=8 | ok |

## Execution

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Tasks completed this week | -- | 15 | -- |
| HITL queue avg wait time | -- | <1 day | -- |
| Blocked items count | -- | <=2 | -- |
| Sprint completion rate | -- | 80% | -- |

## Agent performance

| Agent | Tasks done | Acceptance rate | Exceptions | Stale (>3d) | Status |
|-------|-----------|-----------------|------------|-------------|--------|
| Marvin | -- | -- | 0 | 0 | healthy |
| Ace | -- | -- | 0 | 0 | idle |
| Merlin | -- | -- | 0 | 0 | healthy |
| Echo | -- | -- | -- | 0 | not_deployed |

## Product/business

| Product | Stage | MRR | Kill date | Days remaining |
|---------|-------|-----|-----------|----------------|
| LLMtxt Mastery | launch | $0 | 2026-07-01 | 103 |
| AImpactScanner | launch | $0 | 2026-07-01 | 103 |

## Throughput by mode

| Owner | Build | Growth | Content | Admin | Total |
|-------|-------|--------|---------|-------|-------|
| Jamie | -- | -- | -- | -- | -- |
| Agents | -- | -- | -- | -- | -- |

Updated: Mondays by Marvin
```

---

**08-LEARNING.md:**

```markdown
# Learning log

## Decision register

| ID | Date | Decision | Owner | Context | Chosen | Review date |
|----|------|----------|-------|---------|--------|-------------|
| D-1 | 2026-03-19 | MC architecture | Jamie | 7 LLM proposals evaluated | 11-file markdown + Mini-driven sync + jamiewatters.work integration | 2026-04-19 |
| D-2 | 2026-03-19 | Sync runs on Mini not EC2 | Jamie | Mini has most agents, less lag | Merlin owns sync on Mini, Marvin backup on EC2 | 2026-04-19 |

## Kill/park decisions

| Date | Product/Project | Decision | Reason | Lesson |
|------|----------------|----------|--------|--------|

## Adaptation insights

| Date | Observation | Action taken | Outcome |
|------|-------------|--------------|---------|

## Weekly review notes

### Week of 2026-03-17
- Mission Control v2 design completed
- Implementation starting — Merlin leads build on Mini

## Auto-generated learning candidates
(Marvin appends automatically during weekly review)
```

---

**09-RECURRING.md:**

```markdown
# Recurring operations

| ID | Operation | Owner | Machine | Cadence | Last completed | Next due | SLA | Status |
|----|-----------|-------|---------|---------|----------------|----------|-----|--------|
| R-1 | Pulse regeneration | Merlin | Mini | 15 min | -- | -- | <15 min lag | active |
| R-2 | MC sync to Neon | Merlin | Mini | 15 min | -- | -- | <15 min lag | active |
| R-3 | Daily pulse archive | Merlin | Mini | daily 06:00 UK | -- | 2026-03-20 | by 06:00 UK | active |
| R-4 | Weekly review | Marvin + Jamie | EC2 | weekly (Sun) | -- | 2026-03-23 | by EOD Sun | active |
| R-5 | Sprint planning | Marvin + Jamie | EC2 | biweekly (Mon) | 2026-03-17 | 2026-03-31 | by EOD Mon | active |
| R-6 | Kill date alerts | Marvin | EC2 | daily | -- | -- | 7d before kill date | active |
| R-7 | Backlog grooming | Merlin | Mini | daily | -- | -- | by 09:00 UK | not_started |
| R-8 | Stale task detection | Merlin | Mini | daily | -- | -- | flag >3d items | not_started |
| R-9 | Metrics update | Marvin | EC2 | weekly (Mon) | -- | 2026-03-24 | by EOD Mon | active |
| R-10 | Backup sync health check | Marvin | EC2 | 30 min | -- | -- | alert if Mini sync >30 min stale | active |
| R-11 | Content publishing | Ace/Echo | Mini | 2-3x/week | -- | -- | per calendar | not_started |
```

---

**10-HEALTH.md:**

```markdown
# System health

| System | Owner | Machine | Check method | Expected interval | Last success | Status | Alert threshold |
|--------|-------|---------|-------------|-------------------|-------------|--------|-----------------|
| Syncthing (EC2-Mini) | Merlin | Mini | folder sync timestamp | 5 min | -- | -- | >15 min |
| Syncthing (MacBook-Mini) | Merlin | Mini | folder sync timestamp | 5 min | -- | -- | >15 min |
| MC sync cron | Merlin | Mini | cron log | 15 min | -- | -- | missed run |
| MC sync to Neon | Merlin | Mini | last DB write timestamp | 15 min | -- | -- | >30 min stale |
| Product uptime (5 sites) | Marvin | EC2 | HTTP check | 15 min | -- | -- | any 5xx/timeout |
| Git push (MC repo) | Merlin | Mini | last push timestamp | daily | -- | -- | >24h no push |
| EC2 backup sync | Marvin | EC2 | check Neon last_synced_at | 30 min | -- | -- | Mini sync >30 min stale |
```

---

### 1.4 Create agent profile files

Create in `~/shared/mission-control/agents/`:

**marvin.md:**
```markdown
# Agent: Marvin
Machine: EC2 (Ubuntu)
Role: Infrastructure + Weekly Reviews + Alerts
Status: healthy
Capabilities: System admin, weekly review automation, Git operations, Telegram alerts
MC duties: Weekly review (update 00-DIRECTION, 01-PORTFOLIO, 07-METRICS), kill date alerts, P0 HITL Telegram notifications, backup sync health monitoring, product uptime checks
```

**ace.md:**
```markdown
# Agent: Ace
Machine: Mac Mini
Role: Marketing + Growth (AI Search Mastery)
Status: idle
Capabilities: Marketing execution, growth campaigns, product development, content creation
MC duties: Own AI Search product tasks, commit status changes with T-ids, log with T-id references
Products owned: LLMtxt Mastery, AImpactScanner, AImpactMonitor, AI Search Arena
```

**merlin.md:**
```markdown
# Agent: Merlin
Machine: Mac Mini
Role: COO + MC System Builder + System Auditor
Status: healthy
Capabilities: Operations management, system building, process optimization, Node.js scripting
MC duties: Own sync pipeline (Mini → Neon), pulse generation, daily backlog grooming, inbox triage, stale task detection (>3d), strategic alignment validation, WIP limit enforcement
```

**echo.md:**
```markdown
# Agent: Echo
Machine: Mac Mini
Role: Social Media Manager
Status: not_deployed
Capabilities: Social monitoring, comment classification, response drafting, approval queue management
MC duties: Post approval requests to 06-HITL.md, log engagement metrics, update pulse with social activity
```

**agent-11.md:**
```markdown
# Agent: Agent-11
Machine: MacBook (Claude Code via VS Code)
Role: Development execution + Dashboard development
Status: waiting_approval
Capabilities: Code development, technical implementation, React/Next.js, Prisma, schema markup
MC duties: Own technical build tasks, dashboard development for jamiewatters.work, commit status changes with T-ids
```

### 1.5 Create utility scripts

Save in `~/shared/scripts/`:

**log-event.sh:**
```bash
#!/bin/bash
# Usage: log-event.sh "Actor" "entity" "entity-id" "action" "from" "to" "reason" "project"
EVENTS_DIR=~/shared/mission-control/events
TODAY=$(date +%Y-%m-%d)
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
FILE="$EVENTS_DIR/$TODAY.jsonl"
echo "{\"ts\":\"$TS\",\"actor\":\"$1\",\"entity\":\"$2\",\"id\":\"$3\",\"action\":\"$4\",\"from\":\"$5\",\"to\":\"$6\",\"reason\":\"$7\",\"project\":\"$8\"}" >> "$FILE"
```

```bash
chmod +x ~/shared/scripts/log-event.sh
chmod +x ~/shared/scripts/next-tid.sh
```

### 1.6 Initial Git commit

```bash
cd ~/shared/mission-control
git add -A
git commit -m "@Merlin: Mission Control v2 initialized — 11 files, 5 agent profiles, T-001 through T-020 populated"
```

### 1.7 Verify Syncthing

Confirm `~/shared/mission-control/` is included in the Syncthing share between Mini, EC2, and MacBook. All three machines should see the files within minutes.

---

## Phase 2: Sync script + crons (Merlin, Day 2-3)

### 2.1 Install Node.js + Prisma on Mini

If not already installed:

```bash
# Node.js (if not present)
brew install node

# Clone or copy the website's Prisma schema (you need the schema, not the full repo)
mkdir -p ~/mc-sync
cp ~/shared/mission-control-assets/schema.prisma ~/mc-sync/prisma/schema.prisma
# OR: Jamie/Agent-11 will provide the updated schema after migration

cd ~/mc-sync
npm init -y
npm install @prisma/client prisma
npx prisma generate
```

Create `.env` in `~/mc-sync/`:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Use the same DATABASE_URL that jamiewatters.work uses (Jamie will provide this).

### 2.2 Build the sync script

Create `~/mc-sync/sync.js`. This script must:

1. Read all 11 mission-control files from `~/shared/mission-control/`
2. Parse markdown tables into structured data
3. Upsert into Neon Postgres via Prisma

**Key parsing requirements:**

| File | Parse method | Target table | Sync strategy |
|------|-------------|--------------|---------------|
| 00-DIRECTION.md | Two table parsers (objectives + KRs) | Goal | Upsert by goalId (O-1, KR-1) |
| 01-PORTFOLIO.md | Table parser | Project | Upsert by product name |
| 02-PROJECTS.md | Table parser | Project | Upsert by projectId (P-1) |
| 03-SPRINT.md | Table parser (10 columns) | AgentTask | Upsert by tid (T-001) |
| 04-BACKLOG.md | Checkbox parser with T-id extraction | AgentTask | Upsert by tid |
| 05-PULSE.md | Skip (generated file) | -- | -- |
| 06-HITL.md | Table parser | HitlItem | Upsert by tid + description |
| 07-METRICS.md | Multi-section table parser | Metric | Upsert by group + name |
| 08-LEARNING.md | Table parser (decision register) | Decision | Upsert by did (D-1) |
| 09-RECURRING.md | Table parser | RecurringOp | Upsert by rid (R-1) |
| 10-HEALTH.md | Table parser | SystemHealth | Upsert by system name |
| events/*.jsonl | Line-by-line JSON | EventLog | Append only (skip existing) |

**Critical: upsert by T-id, NOT destructive sync.** The old script deleted all tasks and recreated them every 15 minutes. The new script must upsert by T-id so dashboard state (notes, sort order) is preserved. Tasks that exist in DB but not in source files get status set to `archived`.

**Also sync agent statuses:** Read `agents/*.md` files, parse the Status field, upsert into AgentStatus table.

**Also check for pending dashboard changes:** Read `~/mc-sync/pending-changes.json` if it exists. Apply any HITL resolutions back to `06-HITL.md`. Delete the file after applying.

### 2.3 Build the pulse generator

Create `~/mc-sync/generate-pulse.js` (or integrate into sync.js). This script:

1. Reads 03-SPRINT.md for tasks with status `in_progress` → "Active now" section
2. Reads today's events/*.jsonl for `action=status_change` where `to=done` → "Completed today"
3. Reads 06-HITL.md → "Waiting on Jamie"
4. Reads agents/*.md → "Agent health"
5. Reads 10-HEALTH.md → "System health"
6. Writes assembled 05-PULSE.md

### 2.4 Set up crons

On the Mac Mini:

```cron
# MC sync to Neon (every 15 min)
*/15 * * * * cd ~/mc-sync && /usr/local/bin/node sync.js >> ~/logs/mc-sync.log 2>&1

# Pulse regeneration (every 15 min, offset by 5 min from sync)
5,20,35,50 * * * * cd ~/mc-sync && /usr/local/bin/node generate-pulse.js >> ~/logs/mc-pulse.log 2>&1

# Daily pulse archive (at 06:00 UK)
0 6 * * * cp ~/shared/mission-control/05-PULSE.md ~/shared/mission-control/archive/pulse/$(date -d yesterday +\%Y-\%m-\%d 2>/dev/null || date -v-1d +\%Y-\%m-\%d).md 2>/dev/null
```

Create the log directory:
```bash
mkdir -p ~/logs
```

### 2.5 Health check: update 10-HEALTH.md

Add to the sync script: after each successful sync, update the "MC sync to Neon" row in 10-HEALTH.md with the current timestamp and status=green.

---

## Phase 3: Marvin's EC2 setup (Marvin, Day 2-3)

### 3.1 Backup sync health check

Marvin runs a cron on EC2 that checks if the Mini's sync is working:

```bash
# ~/scripts/check-mini-sync.sh
#!/bin/bash
# Query Neon for the most recent sync timestamp
LAST_SYNC=$(psql "$DATABASE_URL" -t -c "SELECT MAX(\"syncedAt\") FROM \"AgentTask\";" 2>/dev/null | xargs)
if [ -z "$LAST_SYNC" ]; then
  echo "WARNING: No sync data found"
  # Send Telegram alert
  exit 1
fi
# Check if last sync was more than 30 minutes ago
# (implement timestamp comparison)
```

Cron on EC2:
```cron
# Check Mini sync health (every 30 min)
*/30 * * * * ~/scripts/check-mini-sync.sh >> /var/log/mc-health.log 2>&1
```

### 3.2 Kill date alerts

Marvin runs a daily cron that reads 01-PORTFOLIO.md (via Syncthing), checks for kill dates within 7 days, and sends Telegram notifications.

### 3.3 P0 HITL Telegram alerts

Marvin runs a cron that reads 06-HITL.md (via Syncthing), checks for P0 items, and sends Telegram notifications using the existing `notify_jamie` skill.

```cron
# P0 HITL check (every 15 min)
*/15 * * * * ~/scripts/check-hitl-p0.sh >> /var/log/mc-alerts.log 2>&1

# Kill date alerts (daily at 08:00 UK)
0 8 * * * ~/scripts/check-kill-dates.sh >> /var/log/mc-alerts.log 2>&1
```

### 3.4 Weekly review

Marvin continues to own the weekly review (Sundays). Marvin writes updates to 00-DIRECTION.md, 01-PORTFOLIO.md, 07-METRICS.md, and 08-LEARNING.md on EC2. Syncthing delivers them to Mini. Mini's sync cron pushes them to Neon on the next cycle.

---

## Phase 4: Merlin's daily operations (Merlin, Day 3+)

### 4.1 Daily triage routine

At session start:

1. Open `~/shared/mission-control/04-BACKLOG.md`
2. Check for items without owner or priority assigned
3. For each: assign owner, priority (P0/P1/P2), mode, size, project link
4. Validate: does this task link to a key result in 00-DIRECTION.md? If not, add `UNLINKED` tag
5. Git commit: `@Merlin: Triaged X items in backlog`
6. Log events for each change

### 4.2 Stale task detection

Daily:

1. Open `~/shared/mission-control/03-SPRINT.md`
2. Check for tasks in `in_progress` with no Git commit or event log entry in >3 days
3. Flag stale tasks in the task's Blocked by column: `STALE`
4. If Jamie-owned and stale: add to 06-HITL.md as P1 type `decision`
5. Git commit: `@Merlin: Flagged X stale tasks`

### 4.3 WIP limit enforcement

- Jamie items in sprint: max 7. If over, flag in HITL.
- Per-agent items: max 5. If over, move excess back to backlog.
- Active projects in 02-PROJECTS.md: max 8. If over, recommend parking lowest-tier.

---

## Phase 5: Backward compatibility (Merlin, Day 1)

### 5.1 Symlinks

```bash
mkdir -p ~/shared/plan  # if doesn't exist
ln -sf ~/shared/mission-control/03-SPRINT.md ~/shared/plan/SPRINT.md
ln -sf ~/shared/mission-control/01-PORTFOLIO.md ~/shared/plan/PORTFOLIO.md
ln -sf ~/shared/mission-control/04-BACKLOG.md ~/shared/plan/BACKLOG.md
```

### 5.2 Deprecate overnight.md

Replaced by 06-HITL.md + task statuses. Keep for 2 weeks, then delete.

---

## Verification checklist

- [ ] All 11 files exist in ~/shared/mission-control/ on Mini
- [ ] Files visible on EC2 and MacBook via Syncthing
- [ ] Git repo initialized with initial commit
- [ ] T-id counter at 21
- [ ] All 5 agent profiles created
- [ ] next-tid.sh and log-event.sh scripts working
- [ ] Node.js + Prisma installed on Mini
- [ ] Sync script reads from new files and upserts by T-id
- [ ] Pulse generation cron running every 15 min
- [ ] Sync-to-Neon cron running every 15 min
- [ ] Marvin's backup health check running on EC2
- [ ] Marvin's P0 HITL alert cron running on EC2
- [ ] Symlinks in place for backward compatibility
- [ ] Dashboard at jamiewatters.work shows v2 data
