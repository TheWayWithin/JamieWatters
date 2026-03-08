# Mission Control Operations SOP

Standard Operating Procedure for syncing live data from the Clawdbot server into the Mission Control dashboard at jamiewatters.work.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Sync Script Setup](#3-sync-script-setup)
4. [Cron Job Configuration](#4-cron-job-configuration)
5. [Data Sources & File Formats](#5-data-sources--file-formats)
6. [Dashboard Tab to Data Source Mapping](#6-dashboard-tab-to-data-source-mapping)
7. [Manual Operations via Admin UI](#7-manual-operations-via-admin-ui)
8. [API Endpoint Reference](#8-api-endpoint-reference)
9. [Troubleshooting](#9-troubleshooting)
10. [Monitoring & Verification](#10-monitoring--verification)

---

## 1. Architecture Overview

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  Clawdbot Server     │     │  Sync Script          │     │  jamiewatters.work│
│  (Ubuntu)            │     │  (Node.js + Prisma)   │     │  (Next.js)       │
│                      │     │                       │     │                  │
│  /home/ubuntu/clawd/ │────>│  sync-mission-control │────>│  PostgreSQL DB   │
│  ├── plan/           │     │  .js                  │     │  (Prisma ORM)    │
│  │   ├── SPRINT.md   │     │                       │     │                  │
│  │   ├── PORTFOLIO.md│     │  Reads markdown files  │     │  ┌────────────┐ │
│  │   ├── BACKLOG.md  │     │  Parses structured    │     │  │ Admin API  │ │
│  │   ├── GOALS.md    │     │  data from them       │     │  │ /api/admin │ │
│  │   └── progress.md │     │  Upserts into DB via  │     │  └─────┬──────┘ │
│  ├── memory/         │     │  Prisma               │     │        │        │
│  │   ├── MEMORY.md   │     │                       │     │  ┌─────▼──────┐ │
│  │   └── *.md        │     │  Also runs:           │     │  │ Dashboard  │ │
│  └── TASKS.md        │     │  `openclaw cron list`  │     │  │ /admin     │ │
│                      │     │  for scheduled tasks   │     │  └────────────┘ │
└──────────────────────┘     └──────────────────────┘     └──────────────────┘
```

**Data flow:**
1. Clawdbot writes structured markdown files to `/home/ubuntu/clawd/`
2. The sync script (`sync-mission-control.js`) runs on the same server
3. It parses those files and writes to PostgreSQL via Prisma
4. The Next.js admin API reads from PostgreSQL
5. The Mission Control dashboard fetches from the API

---

## 2. Prerequisites

### Environment Variables

The sync script needs a single environment variable:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

This is the same `DATABASE_URL` used by the Next.js app's Prisma client. It must point to the production PostgreSQL database that jamiewatters.work reads from.

### Dependencies

The sync script runs with Node.js and requires:

| Dependency | Purpose |
|-----------|---------|
| `node` (v18+) | Runtime |
| `@prisma/client` | Database ORM |
| `prisma` | Schema management / client generation |

These are already in the website's `package.json`. The script must run from the `website/` directory (or wherever `node_modules` with `@prisma/client` is installed).

### Server Access

- The script is designed to run **on the Ubuntu server** where Clawdbot lives
- It reads files from the hardcoded path: `/home/ubuntu/clawd/`
- It calls `openclaw cron list --json` for scheduled task data

### Required File Structure on Server

```
/home/ubuntu/clawd/
├── plan/
│   ├── SPRINT.md          # Active sprint tasks (table format)
│   ├── PORTFOLIO.md       # Per-product next actions
│   ├── BACKLOG.md         # Backlog tasks (checkbox format)
│   ├── GOALS.md           # Goal tracking (pipe-delimited format)
│   ├── project-plan.md    # Alternative goal source
│   └── progress.md        # Changelog, error detection source
├── memory/
│   ├── MEMORY.md          # Pinned memory file
│   ├── 2026-02-20.md      # Daily memory files (YYYY-MM-DD.md)
│   └── ...
└── TASKS.md               # Fallback task source (checkbox format)
```

---

## 3. Sync Script Setup

### Location

```
website/scripts/sync-mission-control.js
```

### Installation on the Server

1. Clone or copy the website repo (or at minimum the `website/` directory) to the server:

```bash
cd /home/ubuntu
git clone <repo-url> jamiewatters-website
cd jamiewatters-website/website
```

2. Install dependencies:

```bash
npm install
```

3. Generate the Prisma client:

```bash
npx prisma generate
```

4. Set the database URL:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Or create a `.env` file in the `website/` directory:

```bash
echo 'DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE' > .env
```

### Running Manually

```bash
cd /home/ubuntu/jamiewatters-website/website
node scripts/sync-mission-control.js
```

Expected output on success:

```
🔄 Starting Mission Control sync...
⚡ Processing pending cron triggers...
📅 Syncing scheduled tasks...
📋 Syncing tasks...
🎯 Syncing goals...
⚠️ Syncing issues...
🤖 Syncing agent statuses...
🧠 Syncing memory files...
📊 Syncing activity...
✅ Sync complete!
```

---

## 4. Cron Job Configuration

### Recommended Schedule

Add to crontab on the Ubuntu server:

```bash
crontab -e
```

Paste this entry for a sync every 15 minutes:

```cron
*/15 * * * * cd /home/ubuntu/jamiewatters-website/website && DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" /usr/bin/node scripts/sync-mission-control.js >> /var/log/mission-control-sync.log 2>&1
```

### Alternative: Every 5 Minutes

```cron
*/5 * * * * cd /home/ubuntu/jamiewatters-website/website && DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" /usr/bin/node scripts/sync-mission-control.js >> /var/log/mission-control-sync.log 2>&1
```

### With .env File (Simpler)

If you have a `.env` file in the website directory with `DATABASE_URL` set:

```cron
*/15 * * * * cd /home/ubuntu/jamiewatters-website/website && /usr/bin/node scripts/sync-mission-control.js >> /var/log/mission-control-sync.log 2>&1
```

### Log Rotation

Add log rotation to prevent the log file from growing indefinitely:

```bash
sudo tee /etc/logrotate.d/mission-control-sync << 'EOF'
/var/log/mission-control-sync.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF
```

### Verify Cron is Running

```bash
# Check crontab is saved
crontab -l | grep mission-control

# Check recent log output
tail -20 /var/log/mission-control-sync.log

# Check if it ran recently
ls -la /var/log/mission-control-sync.log
```

---

## 5. Data Sources & File Formats

The sync script parses 7 types of data from specific file formats. Each format must be followed exactly or the parser will skip the data silently.

### 5.1 SPRINT.md — Active Sprint Tasks (Table Format)

**Path:** `/home/ubuntu/clawd/plan/SPRINT.md`

**Format:** Markdown table with 5 columns.

```markdown
# Current Sprint

| # | Task | Owner | Product | Status |
|---|------|-------|---------|--------|
| 1 | Build authentication flow | dev | ISOTracker | todo |
| 2 | Design landing page | ui | AimpactScanner | in_progress |
| 3 | Write API tests | tester | ISOTracker | done |
| 4 | Deploy to staging | ops | Portfolio | complete |
```

**Parser rules:**
- The header row (containing "Task") is automatically skipped
- Each data row must start with `|` and have pipe-separated columns
- Column 2 = task content, Column 5 = status
- Status values `done`, `complete`, `completed` (case-insensitive) mark the task as completed
- All other status values = not completed
- All tasks get `section: 'Active Sprint'`

**Regex used:** `^\|\s*\d+\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|`

### 5.2 PORTFOLIO.md — Per-Product Next Actions

**Path:** `/home/ubuntu/clawd/plan/PORTFOLIO.md`

**Format:** H3 headings with numbered "Next actions" lists.

```markdown
## Product Portfolio

### 1. ISOTracker

**Status:** Active development
**Revenue:** $0 MRR

**Next actions:**
1. Implement order history page
2. Add risk calculator widget
3. Deploy beta to production

### 2. AimpactScanner

**Status:** MVP phase

**Next actions:**
1. Improve accuracy metrics
2. Add batch processing
```

**Parser rules:**
- Product headers must match `### N. ProductName` (e.g., `### 1. ISOTracker`)
- The `**Next actions:**` marker (case-insensitive) starts the task list
- Numbered items (`1. Task text`) under "Next actions" become tasks
- Parsing stops at the next bold heading (`**...**`) or section header (`## / ###`)
- Tasks get `section: 'Portfolio: ProductName'`
- All portfolio tasks are marked as not completed

### 5.3 BACKLOG.md / TASKS.md — Checkbox Tasks

**Path:** `/home/ubuntu/clawd/plan/BACKLOG.md` or `/home/ubuntu/clawd/TASKS.md` (fallback)

**Format:** Standard markdown checkbox lists under H2/H3 headings.

```markdown
## Infrastructure

- [ ] Set up CI/CD pipeline
- [x] Configure DNS records
- [ ] Add monitoring alerts

## Features

- [ ] User profile page
- [x] Password reset flow
- [ ] Email notifications
```

**Parser rules:**
- H2 or H3 headings become section names
- Tasks without a preceding heading go into section "Uncategorized"
- `- [ ]` or `* [ ]` = not completed
- `- [x]` or `- [X]` or `* [x]` = completed
- The `+` list marker also works (`+ [ ]`, `+ [x]`)

**Regex used:** `^[-*]\s+\[([xX\s])\]\s+(.+)`

### 5.4 GOALS.md — Goal Tracking (Two Formats)

**Path:** `/home/ubuntu/clawd/plan/GOALS.md`

**Full pipe-delimited format:**

```
Goal: Marketing Reach | Metric: Social followers | Current: 1250 | Target: 5000 | Unit: followers | Category: growth
Goal: Revenue Target | Metric: Monthly recurring | Current: 0 | Target: 500 | Unit: USD | Category: revenue
Goal: Launch MVP | Metric: Days to launch | Current: 45 | Target: 90 | Unit: days | Category: product
```

**Simple inline format:**

```markdown
- Goal: Launch MVP (45/90 days) [product]
- Goal: Marketing Reach (1250/5000 followers) [growth]
- Goal: Revenue Target (0/500 USD) [revenue]
```

**Parser rules (full format):**
- Each field separated by ` | `
- All 6 fields required: Goal, Metric, Current, Target, Unit, Category
- Current and Target must be numeric
- Goals are upserted by name (duplicate names update existing records)

**Parser rules (simple format):**
- Pattern: `- Goal: NAME (CURRENT/TARGET UNIT) [CATEGORY]`
- The goal name is also used as the metric
- Goals are upserted by name

**Status auto-computation:**
- `achieved` if currentValue >= targetValue
- Otherwise preserves existing status, or defaults to `on_track`

**Alternative sources:** The parser also checks `project-plan.md` and `progress.md` for goal lines.

### 5.5 progress.md — Error/Blocker Detection

**Path:** `/home/ubuntu/clawd/plan/progress.md`

**Format:** Any markdown. The parser scans every line for keywords.

```markdown
## 2026-02-23

### Completed
- Deployed auth system
- Fixed database migration

### Issues
- ERROR: Build failed on staging due to missing env var
- BLOCKED: Waiting for API key from vendor
- Deployment FAILED with timeout error

### Resolved
- Fixed the CORS error (resolved)
```

**Parser rules:**
- Scans for keywords: `ERROR`, `FAILED`, `BLOCKED` (case-insensitive, word-boundary match)
- Lines also containing `resolved`, `fixed`, `completed`, `done` are **excluded**
- `BLOCKED` creates an issue with type `blocker`, severity `high`
- `ERROR` or `FAILED` creates an issue with type `error`, severity `medium`
- Duplicate issues (same title, status `open` or `in_progress`) are skipped
- All auto-created issues get `source: 'sync'`

### 5.6 Memory Files — Agent Memory & Activity

**Path:** `/home/ubuntu/clawd/memory/*.md` and `/home/ubuntu/clawd/MEMORY.md`

**Format:** Any markdown. The full content is stored (up to 50,000 characters).

```markdown
# 2026-02-23

- Deployed authentication system to production
- Fixed 3 bugs in the payment flow
- Reviewed PR #42 for code quality
- Updated documentation for API endpoints
```

**Memory sync rules:**
- Files are upserted by filename
- Date extracted from filename if it matches `YYYY-MM-DD` pattern
- Content truncated to 50,000 characters

**Activity extraction rules:**
- Only processes memory files from the last 7 days (by filename date)
- Extracts bullet points (`- item` or `* item`)
- Bullet text must be between 10 and 500 characters
- Each bullet becomes an activity item with `action: 'note'`, `category: 'memory'`
- Only the most recent 50 activity items are kept

### 5.7 Scheduled Tasks — Clawdbot CLI

**Source:** Output of `openclaw cron list --json`

Not a file — the sync script runs this command and parses the JSON output.

**Expected JSON structure:**

```json
{
  "jobs": [
    {
      "id": "job-123",
      "name": "Daily Sync",
      "schedule": { "expr": "0 8 * * *", "tz": "America/New_York" },
      "enabled": true,
      "state": {
        "nextRunAtMs": 1708732800000,
        "lastRunAtMs": 1708646400000,
        "lastStatus": "success"
      }
    }
  ]
}
```

### 5.8 Stuck Task Detection (Auto-Generated Issues)

Not from a file — derived from database state.

**Rule:** Any task in the `Active Sprint` section that:
- Is not completed
- Was synced more than 48 hours ago

...automatically creates a warning issue with title `Stuck task: <first 80 chars of task>`.

---

## 6. Dashboard Tab to Data Source Mapping

| Dashboard Tab | Database Table(s) | Sync Source | API Endpoint |
|--------------|-------------------|-------------|--------------|
| **Overview** | All tables (aggregated) | All sources | `GET /api/admin/overview` |
| **Kanban** | `AgentTask` | SPRINT.md, PORTFOLIO.md, BACKLOG.md, TASKS.md | `GET /api/admin/tasks`, `PATCH /api/admin/tasks/[id]` |
| **Goals** | `Goal` | GOALS.md, project-plan.md, progress.md | `GET/POST /api/admin/goals`, `PATCH/DELETE /api/admin/goals/[id]` |
| **Issues** | `Issue` | progress.md (auto), manual via UI | `GET/POST /api/admin/issues`, `PATCH /api/admin/issues/[id]` |
| **Projects** | `Project` | Manual via UI only | `GET/POST /api/admin/projects`, `PATCH/DELETE /api/admin/projects/[id]` |
| **Agents** | `AgentStatus`, `AgentSchedule` | Derived from activity + `openclaw cron list` | `GET /api/admin/agents` |

### Overview Tab KPIs

The Overview tab aggregates from multiple tables:

| KPI | Source Table | Calculation |
|-----|-------------|-------------|
| Total Tasks / Completed | `AgentTask` | Count all / count where `completed=true` |
| Tasks by Status | `AgentTask` | Grouped by column (backlog, in_progress, review, done) |
| Active Projects | `Project` | Count where status is active |
| Open Issues | `Issue` | Count where `status` in (open, in_progress) |
| Critical Issues | `Issue` | Top 5 where `severity=critical` |
| Goals Summary | `Goal` | Count by status (on_track, at_risk, achieved) |
| Active Agents | `AgentStatus` | Count where `lastActiveAt` within 15 minutes |
| Recent Activity | `AgentActivity` | Last 10 items |

---

## 7. Manual Operations via Admin UI

The following can be done directly through the Mission Control dashboard at `jamiewatters.work/admin` without the sync script:

### Tasks (Kanban Tab)
- **Drag and drop** tasks between columns (backlog, in_progress, review, done)
- **Toggle completion** by clicking task checkboxes
- Reorder tasks within columns via drag-drop

### Goals (Goals Tab)
- **Create** new goals with name, metric, current/target values, unit, category, deadline
- **Update** goal progress (current value), status, description
- **Delete** goals
- Status auto-recomputes when values change

### Issues (Issues Tab)
- **Create** new issues with type, title, severity, description
- **Transition** issue status: open -> in_progress -> resolved/dismissed
- **Assign** issues to team members
- **Add resolution** notes when resolving

### Projects (Projects Tab)
- **Create** projects with full details (name, description, tech stack, URLs, etc.)
- **Update** project status, MRR, user count, phase
- **Toggle** featured status and progress tracking

### Blog Posts
- **Create/edit/publish** blog posts via `POST/PATCH /api/admin/posts`
- Posts auto-generate slug, excerpt, and read time

---

## 8. API Endpoint Reference

All endpoints require authentication via `Authorization: Bearer <token>` or `x-auth-token: <token>` header.

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth` | Login (returns JWT token) |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/check` | Check auth status |

### Overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/overview` | Aggregated KPIs for all dashboard data |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/tasks` | All tasks grouped by section |
| `PATCH` | `/api/admin/tasks` | Toggle task completion (by section + content match) |
| `PATCH` | `/api/admin/tasks/[id]` | Update task (column, section, completed, sortOrder) |

### Goals

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/goals` | List goals (filter: `?category=`, `?status=`, `?projectId=`) |
| `POST` | `/api/admin/goals` | Create goal |
| `PATCH` | `/api/admin/goals/[id]` | Update goal |
| `DELETE` | `/api/admin/goals/[id]` | Delete goal |

### Issues

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/issues` | List issues (filter: `?type=`, `?severity=`, `?status=`, `?since=`) |
| `POST` | `/api/admin/issues` | Create issue |
| `PATCH` | `/api/admin/issues/[id]` | Update issue (with state machine validation) |

**Issue status transitions:**
- `open` -> `in_progress`, `resolved`, `dismissed`
- `in_progress` -> `resolved`, `dismissed`
- `resolved`, `dismissed` -> (terminal, no further transitions)

### Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/projects` | List projects (filter: `?category=`, `?status=`, `?featured=`) |
| `POST` | `/api/admin/projects` | Create project |
| `PATCH` | `/api/admin/projects/[id]` | Update project |
| `DELETE` | `/api/admin/projects/[id]` | Delete project |

### Agents

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/agents` | Agent statuses, scheduled tasks, and stats |

### Activity

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/activity` | Activity feed (filter: `?category=`, `?limit=`) |

### Memory

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/memory` | List memory files (or `?file=FILENAME` for content) |

### Scheduled Tasks

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/scheduled-tasks` | List scheduled cron jobs |
| `POST` | `/api/admin/scheduled-tasks` | Trigger job or toggle enabled (`{action: 'trigger'\|'toggle', jobId, jobName}`) |

### Blog Posts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/posts` | List posts (filter: `?postType=`, `?published=`, `?limit=`) |
| `POST` | `/api/admin/posts` | Create post |
| `PATCH` | `/api/admin/posts/[id]` | Update post |
| `DELETE` | `/api/admin/posts/[id]` | Delete post |

---

## 9. Troubleshooting

### Sync script fails to connect to database

**Symptom:** `Error: Can't reach database server`

**Fix:**
1. Verify `DATABASE_URL` is set and correct:
   ```bash
   echo $DATABASE_URL
   ```
2. Test connectivity:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1"
   ```
3. Check if the database host allows connections from the server's IP (firewall/security group rules)

### Sync runs but dashboard shows no data

**Symptom:** Sync script reports success but dashboard tables are empty.

**Fix:**
1. Confirm the sync script is using the **same** `DATABASE_URL` as the production website
2. Check if the source markdown files exist:
   ```bash
   ls -la /home/ubuntu/clawd/plan/SPRINT.md
   ls -la /home/ubuntu/clawd/plan/GOALS.md
   ls -la /home/ubuntu/clawd/memory/
   ```
3. Check file contents aren't empty:
   ```bash
   wc -l /home/ubuntu/clawd/plan/SPRINT.md
   ```

### Tasks not appearing in Kanban

**Symptom:** SPRINT.md has tasks but Kanban is empty.

**Fix:**
1. Verify the table format is correct — the parser expects exactly 5 pipe-separated columns
2. Check for a header row containing the word "Task" (this row is skipped)
3. The first column must be a number: `| 1 | Task text | ... |`
4. Run the sync manually and check output:
   ```bash
   cd /home/ubuntu/jamiewatters-website/website
   node scripts/sync-mission-control.js 2>&1 | grep -i task
   ```

### Goals not syncing

**Symptom:** GOALS.md has goals but they don't appear.

**Fix:**
1. **Full format** — verify all 6 pipe-delimited fields are present on each line:
   ```
   Goal: NAME | Metric: METRIC | Current: NUMBER | Target: NUMBER | Unit: UNIT | Category: CATEGORY
   ```
2. **Simple format** — verify the exact pattern:
   ```
   - Goal: NAME (CURRENT/TARGET UNIT) [CATEGORY]
   ```
3. Current and Target values must be valid numbers (no commas, no currency symbols)

### Issues created unexpectedly

**Symptom:** Dashboard shows issues that weren't manually created.

**Explanation:** The sync script auto-creates issues from two sources:
1. **Stuck tasks** — any Active Sprint task not completed after 48 hours
2. **Error keywords** — lines in `progress.md` containing `ERROR`, `FAILED`, or `BLOCKED` (unless the same line also contains `resolved`, `fixed`, `completed`, or `done`)

**Fix:** Add resolution words to the progress.md line:
```markdown
- ERROR: Build failed on staging (resolved - was missing env var)
```

### `openclaw` command not found

**Symptom:** Scheduled tasks section is empty, sync log shows command error.

**Fix:**
1. The `openclaw` CLI must be installed and in PATH for the cron user
2. Check: `which openclaw`
3. If installed but not in cron PATH, use the full path in the sync script or add to crontab:
   ```cron
   PATH=/usr/local/bin:/usr/bin:/bin
   */15 * * * * cd /home/ubuntu/jamiewatters-website/website && ...
   ```

### Prisma client not generated

**Symptom:** `Error: Cannot find module '@prisma/client'` or similar.

**Fix:**
```bash
cd /home/ubuntu/jamiewatters-website/website
npx prisma generate
```

### Cron job not running

**Fix:**
1. Verify cron service is running:
   ```bash
   systemctl status cron
   ```
2. Check crontab is saved:
   ```bash
   crontab -l | grep mission-control
   ```
3. Check cron logs:
   ```bash
   grep mission-control /var/log/syslog
   ```
4. Verify node path:
   ```bash
   which node
   # Use the exact path in crontab
   ```

---

## 10. Monitoring & Verification

### Quick Health Check

Run these commands to verify the sync pipeline is working:

```bash
# 1. Check the sync log for recent runs
tail -5 /var/log/mission-control-sync.log

# 2. Check the cron is scheduled
crontab -l | grep mission-control

# 3. Check source files are being updated
ls -la /home/ubuntu/clawd/plan/SPRINT.md
ls -la /home/ubuntu/clawd/plan/GOALS.md

# 4. Run sync manually and watch output
cd /home/ubuntu/jamiewatters-website/website
node scripts/sync-mission-control.js
```

### Verify Data in Database

```bash
cd /home/ubuntu/jamiewatters-website/website

# Count tasks
npx prisma db execute --stdin <<< "SELECT COUNT(*) as tasks FROM \"AgentTask\";"

# Count goals
npx prisma db execute --stdin <<< "SELECT COUNT(*) as goals FROM \"Goal\";"

# Check last sync time
npx prisma db execute --stdin <<< "SELECT MAX(\"syncedAt\") as last_sync FROM \"AgentTask\";"

# Check agent statuses
npx prisma db execute --stdin <<< "SELECT \"agentId\", status, \"lastActiveAt\" FROM \"AgentStatus\";"
```

### Verify via API

```bash
# Replace TOKEN with your admin JWT token
TOKEN="your-jwt-token"

# Check overview
curl -s -H "Authorization: Bearer $TOKEN" https://jamiewatters.work/api/admin/overview | jq '.totalTasks, .completedTasks, .openIssueCount'

# Check tasks
curl -s -H "Authorization: Bearer $TOKEN" https://jamiewatters.work/api/admin/tasks | jq '.totalTasks'

# Check goals
curl -s -H "Authorization: Bearer $TOKEN" https://jamiewatters.work/api/admin/goals | jq 'length'

# Check agents
curl -s -H "Authorization: Bearer $TOKEN" https://jamiewatters.work/api/admin/agents | jq '.stats'
```

### Sync Execution Order

The sync script processes data in this order:

```
1. processPendingTriggers()  →  Execute queued cron jobs (5 min timeout each)
2. syncScheduledTasks()      →  Fetch scheduled tasks from openclaw CLI
3. syncTasks()               →  Parse SPRINT.md → PORTFOLIO.md → BACKLOG.md → TASKS.md
4. syncGoals()               →  Parse GOALS.md → project-plan.md → progress.md
5. syncIssues()              →  Detect stuck tasks (>48h) + scan progress.md for errors
6. syncAgentStatuses()       →  Derive agent status from activity records
7. syncMemory()              →  Sync /home/ubuntu/clawd/memory/*.md files
8. syncActivity()            →  Extract bullet points from last 7 days of memory
```

### Important Behaviors to Know

| Behavior | Detail |
|----------|--------|
| **Tasks are destructive-synced** | All tasks are deleted and recreated each sync. Manual reordering in Kanban will be lost on next sync. |
| **Activity is destructive-synced** | All activity records are deleted and recreated each sync. |
| **Goals are upserted** | Goals are matched by name. Changing a goal's name creates a new record. |
| **Memory is upserted** | Memory files are matched by filename. Content is overwritten each sync. |
| **Issues are additive** | New issues are only created if no open/in_progress issue with the same title exists. |
| **Agent status is derived** | Agent online/offline status is computed from activity timestamps, not from actual agent processes. |
| **Content limits** | Memory: 50KB per file. Activity bullets: 10-500 chars. Only last 50 activities kept. |

---

## Appendix: Database Models

For reference, these are the Prisma models the sync script writes to:

| Model | Primary Key | Unique Constraint | Sync Behavior |
|-------|------------|-------------------|---------------|
| `AgentTask` | `id` (cuid) | none | Delete all + recreate |
| `Goal` | `id` (cuid) | none (upsert by name) | Upsert |
| `Issue` | `id` (cuid) | none (dedup by title+status) | Insert only (additive) |
| `AgentStatus` | `id` (cuid) | `agentId` (unique) | Upsert |
| `AgentSchedule` | `id` (cuid) | `jobId` (unique) | Upsert |
| `AgentMemory` | `id` (cuid) | `filename` (unique) | Upsert |
| `AgentActivity` | `id` (cuid) | none | Delete all + recreate |
| `AgentCronTrigger` | `id` (cuid) | none | Status transitions |
