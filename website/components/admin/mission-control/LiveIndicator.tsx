'use client';

import { useState, useEffect } from 'react';

interface LiveIndicatorProps {
  lastUpdated: Date | null;
  fetching: boolean;
  onRefresh: () => void;
}

function formatSecondsAgo(date: Date | null): string {
  if (!date) return 'never';
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

export default function LiveIndicator({ lastUpdated, fetching, onRefresh }: LiveIndicatorProps) {
  const [, setTick] = useState(0);

  // Re-render every 5s to update the relative time
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-2 text-body-xs text-text-tertiary">
      <span>Updated {formatSecondsAgo(lastUpdated)}</span>
      <button
        onClick={onRefresh}
        disabled={fetching}
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-bg-tertiary transition-transform ${
          fetching ? 'animate-spin' : ''
        }`}
        title="Refresh"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}
