"use client";

import React, { useCallback, useRef } from "react";

export const DAY_START_MIN = 0;
export const DAY_END_MIN = 23 * 60 + 59;

export function hmToMinutes(hm: string): number | null {
  if (!hm || !/^\d{2}:\d{2}$/.test(hm)) return null;
  const [h, m] = hm.split(":").map(Number);
  if (h > 23 || m > 59 || Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function minutesToHm(total: number): string {
  const t = Math.max(DAY_START_MIN, Math.min(DAY_END_MIN, Math.round(total)));
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Empty pair or full day → treated as “at any time” for that axis. */
export function rangePairToStrings(minM: number, maxM: number): { from: string; to: string } {
  if (minM <= DAY_START_MIN && maxM >= DAY_END_MIN) {
    return { from: "", to: "" };
  }
  return { from: minutesToHm(minM), to: minutesToHm(maxM) };
}

export function stringsToRange(from: string, to: string): [number, number] {
  const a = hmToMinutes(from);
  const b = hmToMinutes(to);
  if (a == null || b == null) return [DAY_START_MIN, DAY_END_MIN];
  return [Math.min(a, b), Math.max(a, b)];
}

type Props = {
  value: [number, number];
  onChange: (v: [number, number]) => void;
  id?: string;
};

/** Duffel-style day range: muted track/rail, soft thumbs, 5-minute steps. */
export function TimeOfDayRangeSlider({ value, onChange, id }: Props) {
  const min = DAY_START_MIN;
  const max = DAY_END_MIN;
  const step = 1;
  const [minVal, maxVal] = value;
  const span = max - min;
  const trackRef = useRef<HTMLDivElement>(null);
  const dragThumbRef = useRef<"min" | "max" | null>(null);

  const snap = useCallback(
    (raw: number) => {
      if (span <= 0) return min;
      const snapped = Math.round((raw - min) / step) * step + min;
      return Math.max(min, Math.min(max, snapped));
    },
    [min, max, span],
  );

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || span <= 0) return min;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return snap(min + ratio * span);
    },
    [min, snap, span],
  );

  const applyThumb = useCallback(
    (type: "min" | "max", val: number) => {
      const v = snap(val);
      if (type === "min") {
        const nextMin = Math.min(v, maxVal - step);
        onChange([Math.max(min, nextMin), maxVal]);
      } else {
        const nextMax = Math.max(v, minVal + step);
        onChange([minVal, Math.min(max, nextMax)]);
      }
    },
    [max, min, maxVal, minVal, onChange, snap, step],
  );

  const pickThumb = useCallback(
    (clickVal: number): "min" | "max" => {
      if (clickVal < minVal) return "min";
      if (clickVal > maxVal) return "max";
      return Math.abs(clickVal - minVal) <= Math.abs(clickVal - maxVal) ? "min" : "max";
    },
    [minVal, maxVal],
  );

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const v = valueFromClientX(e.clientX);
    const thumb = pickThumb(v);
    dragThumbRef.current = thumb;
    applyThumb(thumb, v);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragThumbRef.current == null) return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const v = valueFromClientX(e.clientX);
    applyThumb(dragThumbRef.current, v);
  };

  const onTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragThumbRef.current = null;
  };

  const minPercent = span <= 0 ? 0 : ((minVal - min) / span) * 100;
  const maxPercent = span <= 0 ? 100 : ((maxVal - min) / span) * 100;

  return (
    <div className="w-full px-0 pt-1" id={id}>
      <div className="relative isolate h-9 w-full">
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center">
          <div className="h-0.5 w-full bg-muted-foreground/35" aria-hidden />
        </div>
        <div
          className="pointer-events-none absolute top-1/2 z-[1] h-0.5 w-full -translate-y-1/2"
          aria-hidden
        >
          <div
            className="absolute top-0 h-0.5 bg-muted-foreground/65"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
        </div>
        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          className="absolute inset-0 z-[4] cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerUp}
        />
        {/* Visual thumbs */}
        <div
          className="pointer-events-none absolute top-1/2 z-[3] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted-foreground/30 bg-card shadow-sm"
          style={{ left: `${minPercent}%` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-1/2 z-[3] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted-foreground/30 bg-card shadow-sm"
          style={{ left: `${maxPercent}%` }}
          aria-hidden
        />
      </div>
      <div className=" flex justify-between text-[11px] font-medium text-muted-foreground tabular-nums">
        <span>00:00</span>
        <span>08:00</span>
        <span>16:00</span>
        <span>23:59</span>
      </div>
    </div>
  );
}
