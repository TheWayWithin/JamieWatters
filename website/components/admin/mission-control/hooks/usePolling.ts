'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions<T> {
  fetchFn: () => Promise<T>;
  interval: number;
  enabled?: boolean;
}

interface UsePollingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
  fetching: boolean;
}

export function usePolling<T>({
  fetchFn,
  interval,
  enabled = true,
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetching, setFetching] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const doFetch = useCallback(async () => {
    setFetching(true);
    try {
      const result = await fetchFnRef.current();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(doFetch, interval);
  }, [doFetch, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    doFetch();
    startPolling();

    return () => stopPolling();
  }, [enabled, doFetch, startPolling, stopPolling]);

  // Pause polling when tab is hidden, resume when visible
  useEffect(() => {
    if (!enabled) return;

    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        doFetch(); // Immediate fetch on return
        startPolling();
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, doFetch, startPolling, stopPolling]);

  const refresh = useCallback(() => {
    doFetch();
  }, [doFetch]);

  return { data, loading, error, lastUpdated, refresh, fetching };
}
