import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

/**
 * GET /api/admin/cockpit - Server-side proxy for the Mission-Control cockpit.
 *
 * The cockpit is rendered live by the brain-mcp daemon on the Mac Mini and served
 * as complete HTML via a Tailscale funnel. The funnel URL embeds a secret token
 * that is the auth credential for the whole brain, so it MUST stay server-side.
 *
 * This handler:
 *  - Enforces admin auth itself (middleware does NOT gate /api/admin/* routes).
 *  - Reads the funnel URL from BRAIN_COCKPIT_URL (server-only env var, never
 *    NEXT_PUBLIC_*, never committed).
 *  - Fetches the HTML with a short timeout and a 5-minute data cache so the Mini
 *    isn't hit on every load.
 *  - Returns a graceful "temporarily unavailable" page (not a 500) on any error.
 *
 * Reference: mission-control PRJ-11 / T-119, Approach B.
 */

export const runtime = 'nodejs';

const FETCH_TIMEOUT_MS = 8_000;
const CACHE_SECONDS = 300; // ~5 min; keeps the Mini quiet, board stays fresh enough

function fallbackPage(message: string): NextResponse {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cockpit temporarily unavailable</title>
<style>
  html,body{margin:0;height:100%;background:#0f172a;color:#e2e8f0;
    font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;}
  .wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;
    height:100%;text-align:center;padding:2rem;}
  h1{font-size:1.25rem;font-weight:600;margin:0 0 .5rem;color:#f8fafc;}
  p{margin:.25rem 0;color:#94a3b8;max-width:32rem;line-height:1.5;}
  .dot{color:#f59e0b;}
</style>
</head>
<body>
  <div class="wrap">
    <h1><span class="dot">●</span> Cockpit temporarily unavailable</h1>
    <p>${message}</p>
    <p>This page refreshes on its own — the board should return shortly.</p>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(req: NextRequest) {
  // --- Auth: this route guards itself (middleware only covers /api/metrics) ---
  const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // --- Config: funnel URL (with embedded token) must be server-side only ---
  const url = process.env.BRAIN_COCKPIT_URL;
  if (!url) {
    return fallbackPage('The cockpit URL is not configured yet (BRAIN_COCKPIT_URL is unset).');
  }

  // --- Fetch the live board, with a timeout so a hung Mini can't hang us ---
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: CACHE_SECONDS },
      headers: { Accept: 'text/html' },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return fallbackPage(`The cockpit source returned ${res.status}. The Mini or funnel may be resyncing.`);
    }

    const body = await res.text();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Client re-fetches on its own timer; don't let the browser hold a stale copy.
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    clearTimeout(timeout);
    return fallbackPage('The Mac Mini or Tailscale funnel appears to be offline or resyncing.');
  }
}
