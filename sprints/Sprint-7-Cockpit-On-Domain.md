# Cockpit On-Domain Sprint

**Sprint:** 7 (one-shot, ~45 min)
**Mission:** Serve the live Mission-Control cockpit at `jamiewatters.work/admin/cockpit`, behind the existing `/admin` auth, replacing the raw Tailscale-Funnel URL
**Owner:** Agent-11 + Jamie
**Reference:** `~/shared/mission-control/projects/PRJ-11-cockpit-site-brief.md` (MC task **T-119**, PRJ-11)
**Status:** Built + verified locally — **awaiting Jamie's OK to deploy** (Netlify env var + push)

---

## Executive Summary

The MC cockpit is rendered live by the brain-mcp daemon on the Mac Mini (reads the vault, dark theme, auto-refresh) and served as complete HTML behind a secret Tailscale-Funnel URL. That URL's token is the auth credential for the whole brain, so it can't ship to the browser. This sprint puts the board on-domain at `/admin/cockpit`: the site fetches the funnel HTML **server-side** (token stays server-side) and serves it behind the existing admin login.

Approach **B** from the brief: server-side proxy + 5-min cache, with a graceful fallback when the Mini is unreachable.

## Key discoveries (why the build differs slightly from the brief)

Two brief assumptions turned out not to hold in the repo; the design adapts around them but stays Approach B:

1. **`middleware.ts` does NOT gate `/admin/*` pages.** `ADMIN_ROUTES = ['/api/metrics']` and `/admin` is in `PUBLIC_ROUTES`. The admin auth gate is the **client-side `app/admin/layout.tsx`** (checks `/api/auth/check`, shows a login screen until authed). A server component under `/admin` would therefore ship its rendered HTML to the browser *before* the client gate hides it — leaking the board content (not the token). Fix: the board is fetched by a **self-auth-gated route handler**, not server-rendered into the page.
2. **Framing is globally denied.** `netlify.toml` sets `X-Frame-Options: DENY` for `/*`, and `middleware.ts` sets `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` on every response. So an `<iframe>` won't render the board. Fix: fetch the HTML client-side (after the auth gate) and inject it; no iframe.

## Technical Architecture

- **`app/api/admin/cockpit/route.ts`** (Node runtime) — the proxy.
  - Enforces admin auth itself (`verifyToken` + `role === 'admin'`), mirroring `/api/admin/tasks`. Middleware doesn't cover it.
  - Reads `process.env.BRAIN_COCKPIT_URL` (server-only; the funnel URL with the embedded token).
  - `fetch(url, { next: { revalidate: 300 } })` + 8s `AbortController` timeout → returns the HTML.
  - On unset URL / non-2xx / timeout / network error → returns a friendly dark "cockpit temporarily unavailable" HTML page at **200** (never a 500).
- **`app/admin/cockpit/page.tsx`** (`'use client'`, `force-dynamic`) — the view.
  - Renders only inside the authed admin layout; fetches `/api/admin/cockpit` and injects the board HTML.
  - Re-fetches every **3 min** (matches the cockpit's own cadence) + a manual **Refresh** button and "Updated HH:MM".
  - Injected `<script>` tags are inert (innerHTML doesn't execute them) — that's why the timer lives here.
- **`components/admin/AdminTabs.tsx`** — adds a **🛰️ Cockpit** sub-tab under Mission Control.

## Security posture

- Token never leaves the server: only `/api/admin/cockpit` (server-side) reads `BRAIN_COCKPIT_URL`. Nothing `NEXT_PUBLIC_*`, nothing in client JS, nothing committed.
- Direct hits to `/api/admin/cockpit` without a valid admin cookie → **401** (verified).
- `BRAIN_COCKPIT_URL` lives in Netlify env + local `.env` only (both gitignored / dashboard-only).

## Phase 1: Build (done)

- [x] 1.1 `app/api/admin/cockpit/route.ts` — auth-gated server proxy, 5-min cache, timeout, graceful fallback
- [x] 1.2 `app/admin/cockpit/page.tsx` — client page, inject board, 3-min auto-refresh, loading/error states
- [x] 1.3 `components/admin/AdminTabs.tsx` — 🛰️ Cockpit sub-tab (MC_TABS + MC_PATHS + resolveMcTab)

## Phase 2: Verify (done, local)

- [x] 2.1 `npx tsc --noEmit` clean
- [x] 2.2 `npm run build` green; both routes registered (`ƒ /admin/cockpit`, `ƒ /api/admin/cockpit`)
- [x] 2.3 Unauthed + bogus-token GET `/api/admin/cockpit` → **401**; page shell → **200** (via `next start`)
- [ ] 2.4 End-to-end with real `BRAIN_COCKPIT_URL` via `netlify dev` — needs the env var set (Jamie / next step)

## Phase 3: Deploy (Jamie-gated — NOT done)

- [ ] 3.1 Set `BRAIN_COCKPIT_URL` in Netlify dashboard (Site settings → Environment variables) to the full funnel URL incl. token
- [ ] 3.2 Add the same to local `.env` for `netlify dev` testing (gitignored)
- [ ] 3.3 `netlify dev` → open `/admin/cockpit`, log in, confirm the live board renders
- [ ] 3.4 Commit + push → Netlify deploy (Jamie's explicit OK)
- [ ] 3.5 Confirm `jamiewatters.work/admin/cockpit` shows the live board behind auth

## Done when

`jamiewatters.work/admin/cockpit` shows the live board behind auth · token is server-side only · graceful fallback if the Mini is down · deploy green.
