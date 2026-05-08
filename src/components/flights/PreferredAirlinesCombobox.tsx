"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { MAJOR_AIRLINES, airlineLogoUrl, type MajorAirline } from "@/data/major-airlines";
import { COMBO_FIELD_SHELL_CLASS, INPUT_FIELD_CLASS } from "@/components/ui/inputFieldStyles";

type Props = {
  selected: string[];
  onChange: (iatas: string[]) => void;
  id?: string;
  /** When set, only these carriers appear (e.g. from search results). When omitted, uses the full curated list. */
  airlines?: MajorAirline[];
  /** Single-select (e.g. results filter); default is multi-select for preferred carriers. */
  selectionMode?: "multiple" | "single";
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function PreferredAirlinesCombobox({
  selected,
  onChange,
  id,
  airlines: airlinesProp,
  selectionMode = "multiple",
}: Props) {
  const tf = useTranslations("Flights.filters");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const sourceList = airlinesProp ?? MAJOR_AIRLINES;
  const noExplicitSourceRows = airlinesProp !== undefined && airlinesProp.length === 0;

  const selectedSet = useMemo(() => new Set(selected.map((c) => c.toUpperCase())), [selected]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return sourceList;
    return sourceList.filter(
      (a) =>
        normalize(a.name).includes(q) ||
        a.iata.toLowerCase().includes(q) ||
        normalize(`${a.name} ${a.iata}`).includes(q),
    );
  }, [query, sourceList]);

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
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const toggle = useCallback(
    (iata: string) => {
      const u = iata.toUpperCase();
      if (selectionMode === "single") {
        if (selected.length === 1 && selectedSet.has(u)) {
          onChange([]);
        } else {
          onChange([u]);
        }
        return;
      }
      const next = new Set(selectedSet);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      onChange([...next].sort());
    },
    [onChange, selectedSet, selectionMode, selected.length],
  );

  const clearAll = useCallback(() => onChange([]), [onChange]);

  const triggerLabel = useMemo(() => {
    if (selected.length === 0) return tf("airlineComboAll");
    if (selected.length === 1) {
      const one = selected[0].toUpperCase();
      return sourceList.find((a) => a.iata.toUpperCase() === one)?.name ?? selected[0];
    }
    return tf("airlineComboCount", { count: selected.length });
  }, [selected, sourceList, tf]);

  const AllRow = () => {
    const checked = selected.length === 0;
    return (
      <button
        type="button"
        role="option"
        aria-selected={checked}
        onClick={() => clearAll()}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-primary/8 ${
          checked ? "bg-primary/12" : ""
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
          ALL
        </span>
        <span className="min-w-0 flex-1 font-medium text-foreground">{tf("airlineComboAll")}</span>
        {checked ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
      </button>
    );
  };

  const AirlineRow = ({ a }: { a: MajorAirline }) => {
    const checked =
      selectionMode === "single"
        ? selected.length === 1 && selectedSet.has(a.iata)
        : selectedSet.has(a.iata);
    return (
      <button
        type="button"
        role="option"
        aria-selected={checked}
        onClick={() => toggle(a.iata)}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-primary/8 ${
          checked ? "bg-primary/12" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={airlineLogoUrl(a.iata)}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded object-contain"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).style.visibility = "hidden";
          }}
        />
        <span className="min-w-0 flex-1 font-medium text-foreground">
          {a.name}
          <span className="ml-2 font-mono text-xs text-muted-foreground">{a.iata}</span>
        </span>
        {checked ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
      </button>
    );
  };

  return (
    <div ref={rootRef} className="relative w-full" id={id}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${INPUT_FIELD_CLASS} flex h-12 w-full cursor-pointer items-center justify-between gap-2 font-medium`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate text-muted-foreground">{triggerLabel}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div
          className="absolute left-0 right-0 z-[80] mt-1 overflow-hidden rounded-xl border border-input bg-card shadow-xl"
          role="listbox"
        >
          <div className="border-b border-border p-2">
            <input                    
              ref={searchRef}
              type="search"
              autoComplete="off"
              placeholder={tf("airlineComboPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-primary/40 bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="max-h-72 overflow-y-auto overscroll-contain dropdown-scrollbar">
            <AllRow />
            {filtered.map((a) => (
              <AirlineRow key={a.iata} a={a} />
            ))}
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {normalize(query)
                  ? tf("airlineComboNoMatches")
                  : noExplicitSourceRows
                    ? tf("airlineComboNoAirlinesInResultSet")
                    : tf("airlineComboNoMatches")}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
