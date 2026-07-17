# Sprint 8 — Wave 4: Portfolio credibility (PRJ-18, JW-ISS-5)

**Goal:** every listed project earns its place with something verifiable; no
stale dates; copy on-thesis (proof of building, not a SaaS-empire portfolio).

**Gate decision (LOCKED 2026-07-17): Option A — trim to live + honest proof.**
Show genuinely-usable products, each with one honest proof point; move pre-launch
work to a compact "in the workshop" line; drop the vanity framing.

---

## Ground truth (verified 2026-07-17)

- DB has 33 project rows; `/portfolio` already filters to `url startsWith http`
  AND `status != ARCHIVED`, so it currently shows **~16** (9 LIVE + 1 BETA + 2
  BUILD + 1 MVP + 3 PLANNING). The 9 ARCHIVED + ~8 junk placeholder rows
  (p-1..p-8, "mission", "portfolio-overview", etc., all no-url) are already hidden.
- **No strong numeric proof exists.** Every row has mrr=0, users=0. GitHub
  stars: agent-11 **11**, BOS-AI **6**, aisearchmastery/freecalchub/
  mastery-ai-framework **1**, llm-txt-mastery/executor-file **0**. Leading with
  these numbers would read as weak, not proof. → proof points must be the
  strongest HONEST thing, not vanity metrics.
- Real proof material that DOES exist:
  - Working live URL (all 10 live/beta).
  - Open, inspectable code (7 OSS repos).
  - Genuine artifacts: AI Search Arena → published 51-dimension / 6-model GEO
    benchmark (geo-benchmark-framework); Executor File → age-encryption +
    2-of-3 Shamir shares design; FreeCalcHub → 55+ calculators; AImpactScanner
    → 132-factor MASTERY-AI framework.
  - DB `problemStatement`/`lessonsLearned`/`nextProofPoint` populated for AI
    Search Arena and Executor File; sparse elsewhere.
- "Last Updated" is ALREADY derived (max `updatedAt`), not hand-typed — but
  `updatedAt` reflects DB-row touches (MC sync), so it can still mislead.
- Executor File (BETA) already in the DB → T-154 essentially done; just needs to
  present as a real entry.

## The 10 live/beta products (the proof grid)

AI Search Arena, AImpactScanner, Agent-11, AI Search Mastery, BOS-AI, Executor
File (BETA), FreeCalcHub, JamieWatters.work, LLM-TXT-Mastery, MASTERY-AI Framework.

Pre-launch (→ "in the workshop" line, not full cards): crypto-trading-agent
(MVP), ModelOptix + PlebTest (BUILD), iso-tracker + solomarketwork + evolve-7
(PLANNING).

---

## Plan (Option A)

**W4-1 — Trim the grid.** Main grid = genuinely-usable products (LIVE + BETA).
Pre-launch items move to a compact "In the workshop" line below the grid (honest
momentum, no wishlist cards). Query/filter change in the page, not the DB.

**W4-2 — Reframe the aggregate bar.** Drop the vanity "16 Built" hero number and
the portfolio-value framing. Honest counts only (e.g. "9 live · N open-source"),
or replace with something on-thesis. Fix/junk the "Last Updated" tile if it
misleads.

**W4-3 — Proof point per product.** Add one honest proof line to each live card:
the strongest real thing (working link / open code / a real artifact / a
"what I learned" line). NO invented numbers. GitHub stars only where non-trivial
(agent-11 11, BOS-AI 6) and even then framed honestly. Drafts go to Jamie for
approval before deploy (public claims).

**W4-4 — Copy refresh (jamie-voice).** Header + per-product lines in Jamie's
voice; align with V&M v4.2 (proof of building, not a SaaS empire).

**W4-5 — Verify + regression.** `scripts/verify-wave4.ts`: pre-launch items not
in the main grid, no ARCHIVED/junk leaks, every live card has a proof line, no
hardcoded stale date. Build + live spot-check. Then close JW-ISS-5.

Jamie gates the push (deploys prod). Proof-point copy gets his approval before
it goes live.

---

## Shipped 2026-07-17 (pending push)

All tasks done. W4-1 trim grid → 10 live cards + 7-item workshop line. W4-2
reframed the aggregate bar (dropped vanity "16 built" + misleading date), header
now live-first. W4-3/W4-4 proof lines: `lib/portfolio-proof.ts`, 10 honest
voice-checked lines (jamie-voice guide), approved by Jamie; no invented numbers
(GitHub stars 0-11 deliberately not led with). AImpactMonitor fixed (p-3 junk row
→ slug aimpactmonitor, LIVE→BUILD, real repo URL) so it shows in the workshop.
W4-5 `scripts/verify-wave4.ts`: 19 checks, all pass; wave1-3 still green.
Build 254 pages, tsc clean. DB change (AImpactMonitor row) already applied to Neon.

### Follow-ups (not blockers)
- Other junk `p-N` rows (p-1,2,4..8) remain in the DB, hidden by the url filter —
  a later data-cleanup can delete or fix them.
- AImpactScanner proof line is about what it does (usage is near-zero); revisit
  when it has real traction.
