# Mission Control v2: Jamie's Tasks

**Date:** 2026-03-19
**Total time estimate:** ~2 hours spread over 5 days

---

## Day 1 (today): Decisions + kickoff

- [ ] **Decide ECHO polling frequency** (15 min vs 30 min) — blocking P-4. Write decision in 06-HITL.md. (5 min)
- [ ] **Review and approve homepage copy** for Lighthouse (T-002) — blocking T-003. Approve, approve with changes, or request rework. (15 min)
- [ ] **Review ModelOptix MVP scope** — decide: continue, park, or adjust timeline. (10 min)
- [ ] **Provide DATABASE_URL to Merlin** — the Neon connection string so Merlin can set up the sync script on the Mini. (2 min)
- [ ] **Distribute specs:**
  - Document 1 (Agent Implementation Spec) → Merlin (he's the primary builder)
  - Document 4 (Agent SOP) → Merlin (to distribute to all agents on Day 3)
  - Document 2 (Developer Spec) → Agent-11 (dashboard work on MacBook)
  - (5 min)

## Day 2: Schema migration + verify foundation

- [ ] **Run Prisma migration with Agent-11.** Open the repo on MacBook, apply the schema changes from Document 2, run `npx prisma migrate dev --name mission-control-v2`. (15 min with Agent-11)
- [ ] **Share updated schema with Merlin.** Copy `prisma/schema.prisma` to `~/shared/mission-control-assets/` so Merlin can generate a matching Prisma client on the Mini. (2 min)
- [ ] **Verify Merlin created the file structure.** Open `~/shared/mission-control/` on your MacBook (via Syncthing) and confirm all 11 files exist with T-ids. (5 min)
- [ ] **Pick Today's 3** at the top of 03-SPRINT.md. (2 min)

## Day 3: First real day on the system

- [ ] **AM check-in:** Open 05-PULSE.md → check 06-HITL.md → pick Today's 3. (5 min)
- [ ] **PM check-in:** Check 06-HITL.md → resolve any new items. Glance at pulse completions. (5 min)
- [ ] **Confirm sync is running.** Go to jamiewatters.work/admin. If data appears from the new files, sync works. If not, flag to Merlin. (2 min)

## Day 5: Validate full model

- [ ] **Confirm Merlin is triaging.** Check 04-BACKLOG.md — inbox items should have owners/priorities. (2 min)
- [ ] **Confirm 9 statuses working.** Check sprint for `waiting_on_jamie` and `ready` statuses. (2 min)
- [ ] **Confirm Agent-11 has Command view working.** Check dashboard for the new landing page. (2 min)

## Ongoing (daily, ~10 min/day)

**AM (5 min):** Open Command view (dashboard) or 05-PULSE.md → check 06-HITL.md → pick Today's 3

**PM (5 min):** Check 06-HITL.md → resolve items → glance at pulse

## Weekly (Sundays, with Marvin, 30 min)

- [ ] Review 07-METRICS.md scorecard
- [ ] Check kill dates in 01-PORTFOLIO.md
- [ ] Review 08-LEARNING.md auto-generated candidates
- [ ] Approve next sprint items

---

## What you do NOT need to do

- You do not edit 05-PULSE.md (Merlin's cron generates it)
- You do not edit 07-METRICS.md (Marvin generates it weekly)
- You do not triage the backlog (Merlin does this)
- You do not update agent profiles (agents own theirs)
- You do not run sync scripts (Merlin's crons on Mini handle it)
- You do not deploy the dashboard (Agent-11 pushes to GitHub, Netlify auto-deploys)

Your job: make decisions, resolve HITL items, pick Today's 3, do your own sprint tasks, and pair with Agent-11 on dashboard development.
