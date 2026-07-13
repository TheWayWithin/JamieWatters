'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Admin > Cockpit
 *
 * Renders the live Mission-Control cockpit that the brain-mcp daemon serves from
 * the Mac Mini. The secret funnel URL stays server-side: this page only ever talks
 * to our own /api/admin/cockpit proxy, which is itself admin-auth-gated.
 *
 * We fetch the board HTML and inject it (rather than iframing) because the site
 * sets X-Frame-Options: DENY / CSP frame-ancestors 'none' globally. Injected
 * <script> tags are inert (innerHTML doesn't execute them), so the cockpit's own
 * auto-refresh won't run — we re-fetch on a timer here instead.
 *
 * Reference: mission-control PRJ-11 / T-119, Approach B.
 */

const REFRESH_MS = 180_000; // 3 min, matching the cockpit's own cadence

export default function CockpitPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cockpit', {
        credentials: 'include',
        cache: 'no-store',
      });
      // The proxy returns a friendly HTML fallback (200) when the Mini is down,
      // so a non-ok here means auth/server trouble, not a Mini outage.
      if (!res.ok) {
        setStatus('error');
        return;
      }
      const body = await res.text();
      setHtml(body);
      setStatus('ready');
      setLastUpdated(new Date());
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  // Inject the fetched board HTML once it lands.
  useEffect(() => {
    if (containerRef.current && html !== null) {
      containerRef.current.innerHTML = html;
    }
  }, [html]);

  return (
    <div>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-display-sm font-bold text-text-primary">Cockpit</h1>
          <p className="mt-1 text-body text-text-secondary">
            Live Mission-Control board &mdash; rendered from the vault on the Mac Mini
          </p>
        </div>
        <div className="flex items-center gap-3 text-body-sm text-text-secondary">
          {lastUpdated && (
            <span>
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={load}
            className="rounded-md border border-border-default px-3 py-1.5 text-body-sm font-medium text-text-primary hover:bg-bg-surface transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="px-6 py-16 text-center text-body text-text-secondary">
          Loading the cockpit&hellip;
        </div>
      )}

      {status === 'error' && (
        <div className="px-6 py-16 text-center">
          <p className="text-body text-text-primary font-medium">Couldn&rsquo;t load the cockpit.</p>
          <p className="mt-1 text-body-sm text-text-secondary">
            Your session may have expired, or the server had trouble. Try Refresh, or reload the page.
          </p>
        </div>
      )}

      {/* Injected board. Dark background covers the cockpit's own <body> styling,
          which doesn't apply once the markup is nested in this div. */}
      <div
        ref={containerRef}
        className={status === 'ready' ? 'w-full' : 'hidden'}
        style={{ background: '#0f172a', minHeight: 'calc(100vh - 220px)' }}
      />
    </div>
  );
}
