"use client";

import React, { useCallback, useRef } from "react";

export interface DualSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  /** Shown before each amount in the labels (e.g. "$" or "PKR "). Ignored when `formatRangeLabel` is set. */
  currencyPrefix?: string;
  /** When set, formats min/max thumb labels (e.g. currency-aware amounts). */
  formatRangeLabel?: (value: number) => string;
}

export default function DualSlider({
  min = 0,
  max = 2000,
  step = 1,
  value,
  onChange,
  currencyPrefix = "$",
  formatRangeLabel,
}: DualSliderProps) {
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
    [min, max, step, span]
  );

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || span <= 0) return min;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return snap(min + ratio * span);
    },
    [min, snap, span]
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
    [max, min, maxVal, minVal, onChange, snap, step]
  );

  const pickThumb = useCallback(
    (clickVal: number): "min" | "max" => {
      if (clickVal < minVal) return "min";
      if (clickVal > maxVal) return "max";
      return Math.abs(clickVal - minVal) <= Math.abs(clickVal - maxVal)
        ? "min"
        : "max";
    },
    [minVal, maxVal]
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
    <div className="w-full px-0 py-2">
      {/* isolate: z-index only competes inside this box. Thumbs must stack above the fill bar. */}
      <div className="relative isolate h-10 w-full">
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center">
          <div
            className="h-1.5 w-full rounded-full bg-muted"
            aria-hidden
          />
        </div>

        <div
          className="pointer-events-none absolute top-1/2 z-[1] h-1.5 w-full -translate-y-1/2"
          aria-hidden
        >
          <div
            className="absolute top-0 h-1.5 rounded-full bg-primary"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          readOnly
          tabIndex={-1}
          className="dual-slider-range-input dual-slider-range-min"
          aria-label="Minimum"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          readOnly
          tabIndex={-1}
          className="dual-slider-range-input dual-slider-range-max"
          aria-label="Maximum"
        />

        {/*
          Transparent layer on top: receives all pointer events so min/max both work.
          Native range inputs are pointer-events:none (visual thumbs only); pickThumb chooses which value moves.
        */}
        <div
          ref={trackRef}
          role="presentation"
          className="absolute inset-0 z-[4] cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerUp}
        />
      </div>

      <div className="mt-3 flex justify-between text-sm font-medium">
        <span>
          {formatRangeLabel ? formatRangeLabel(minVal) : `${currencyPrefix}${minVal}`}
        </span>
        <span>
          {formatRangeLabel ? formatRangeLabel(maxVal) : `${currencyPrefix}${maxVal}`}
        </span>
      </div>
    </div>
  );
}
