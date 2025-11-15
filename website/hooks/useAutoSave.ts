/**
 * useAutoSave Hook
 *
 * Automatically saves form data to localStorage at regular intervals.
 * Prevents data loss if user navigates away or browser closes.
 *
 * Usage:
 * const { save, restore, clear } = useAutoSave('post-draft', formData, 30000);
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  enabled?: boolean; // Enable/disable auto-save
  onSave?: () => void; // Callback when auto-save occurs
  onRestore?: (data: any) => void; // Callback when data is restored
}

export function useAutoSave<T>(
  key: string,
  data: T,
  intervalMs: number = 30000, // Default: 30 seconds
  options: UseAutoSaveOptions = {}
) {
  const { enabled = true, onSave, onRestore } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date | null>(null);

  /**
   * Save data to localStorage
   */
  const save = useCallback(() => {
    if (!enabled) return;

    try {
      const serialized = JSON.stringify({
        data,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(key, serialized);
      lastSaveRef.current = new Date();
      onSave?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [key, data, enabled, onSave]);

  /**
   * Restore data from localStorage
   */
  const restore = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      onRestore?.(parsed.data);
      return parsed.data;
    } catch (error) {
      console.error('Auto-restore failed:', error);
      return null;
    }
  }, [key, onRestore]);

  /**
   * Clear saved data from localStorage
   */
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      lastSaveRef.current = null;
    } catch (error) {
      console.error('Auto-save clear failed:', error);
    }
  }, [key]);

  /**
   * Get last save timestamp
   */
  const getLastSave = useCallback((): Date | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return new Date(parsed.savedAt);
    } catch (error) {
      return null;
    }
  }, [key]);

  /**
   * Set up auto-save interval
   */
  useEffect(() => {
    if (!enabled) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      save();
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, save]);

  return {
    save,
    restore,
    clear,
    getLastSave,
    lastSave: lastSaveRef.current,
  };
}
