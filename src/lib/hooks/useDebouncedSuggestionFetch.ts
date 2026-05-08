"use client";

/* eslint-disable react-hooks/set-state-in-effect -- debounced remote fetch (same pattern as legacy airport hook) */
import { useEffect, useRef, useState } from "react";

export type DebouncedSuggestionFetchOptions<T> = {
  open: boolean;
  query: string;
  /** Minimum trimmed query length before calling `fetcher`. Default 2. */
  minLength?: number;
  /** Default 320 (matches Duffel dashboard-style airport/place lookup). */
  debounceMs?: number;
  fetcher: (trimmedQuery: string) => Promise<T[]>;
};

/**
 * Generic debounced autocomplete fetch: clears when closed or below min length,
 * clears stale rows when query changes, exposes `loading` for skeleton UI.
 * Used by flight airport and hotel place suggest hooks.
 */
export function useDebouncedSuggestionFetch<T>({
  open,
  query,
  minLength = 2,
  debounceMs = 320,
  fetcher,
}: DebouncedSuggestionFetchOptions<T>): { rows: T[]; loading: boolean } {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (!open) {
      setRows([]);
      setLoading(false);
      return;
    }
    const q = query.trim();
    if (q.length < minLength) {
      setRows([]);
      setLoading(false);
      return;
    }
    setRows([]);
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetcherRef
        .current(q)
        .then((list) => {
          if (!cancelled) setRows(list);
        })
        .catch(() => {
          if (!cancelled) setRows([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, debounceMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      setLoading(false);
    };
  }, [open, query, minLength, debounceMs]);

  return { rows, loading };
}
