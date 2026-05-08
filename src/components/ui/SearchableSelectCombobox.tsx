"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = { value: string; label: string };

type Props = {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder: string;
  emptyMessage: string;
  /** Shown on the closed trigger (e.g. current selection). */
  triggerLabel?: string;
  className?: string;
  triggerClassName?: string;
  listClassName?: string;
  id?: string;
  "aria-label"?: string;
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function SearchableSelectCombobox({
  options,
  value,
  onChange,
  searchPlaceholder,
  emptyMessage,
  triggerLabel: triggerLabelProp,
  className,
  triggerClassName,
  listClassName,
  id,
  "aria-label": ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const valueToLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of options) m.set(o.value, o.label);
    return m;
  }, [options]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return options;
    return options.filter(
      (o) =>
        normalize(o.label).includes(q) ||
        o.value.toLowerCase().includes(q) ||
        normalize(`${o.label} ${o.value}`).includes(q),
    );
  }, [query, options]);

  const triggerLabel = triggerLabelProp ?? valueToLabel.get(value) ?? value;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const pick = useCallback(
    (next: string) => {
      onChange(next);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)} id={id}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "flex h-10 w-full max-w-[min(220px,55vw)] sm:max-w-[260px] cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-card px-2 py-1 text-sm font-medium text-muted-foreground sm:px-3 sm:py-2",
          triggerClassName,
        )}
        onClick={() => {
          setQuery("");
          setOpen((v) => !v);
        }}
      >
        <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open ? "rotate-180" : "")}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute right-0 z-[80] mt-1 w-full min-w-[350px] sm:min-w-[250px] overflow-hidden rounded-xl border border-input bg-card shadow-xl ",
            listClassName,
          )}
          role="listbox"
        >
          <div className="border-b border-border p-2">
            <input
              ref={searchRef}
              type="search"
              autoComplete="off"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-primary/40 bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="max-h-72 overflow-y-auto overscroll-contain dropdown-scrollbar">
            {filtered.map((o) => {
              const selected = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => pick(o.value)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-primary/8",
                    selected ? "bg-primary/12" : "",
                  )}
                >
               
                  <span className="min-w-0 flex-1 font-medium text-foreground">{o.label}</span>
                  {selected ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
