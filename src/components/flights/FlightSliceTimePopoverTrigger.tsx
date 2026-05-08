"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { FlightSliceTimePopover } from "@/components/flights/FlightSliceTimePopover";

export type FlightSliceTimeSlot = {
  takeoffFrom: string;
  takeoffTo: string;
  landingFrom: string;
  landingTo: string;
};

export type FlightSliceTimePopoverTriggerHandle = {
  close: () => void;
};

function isFlightTimeAnyTime(df: string, dt: string, af: string, at: string): boolean {
  const empty = (s: string) => !s?.trim();
  return empty(df) && empty(dt) && empty(af) && empty(at);
}

const DEFAULT_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 px-3 text-sm font-medium text-primary transition hover:bg-primary/15";

const DEFAULT_POPOVER_WRAPPER_CLASS =
  "absolute left-0 top-full z-[70] mt-2 w-[min(100vw-2rem,22rem)] max-w-none";

type Props = {
  value: FlightSliceTimeSlot;
  onChange: (next: FlightSliceTimeSlot) => void;
  /** Fires when the popover opens or closes (after toggle / confirm / outside click). */
  onOpenChange?: (open: boolean) => void;
  buttonClassName?: string;
  popoverWrapperClassName?: string;
};

export const FlightSliceTimePopoverTrigger = forwardRef<
  FlightSliceTimePopoverTriggerHandle,
  Props
>(function FlightSliceTimePopoverTrigger(
  {
    value,
    onChange,
    onOpenChange,
    buttonClassName = DEFAULT_BUTTON_CLASS,
    popoverWrapperClassName = DEFAULT_POPOVER_WRAPPER_CLASS,
  },
  ref,
) {
  const t = useTranslations("Flights.tab");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const buttonSummary = useMemo(() => {
    const { takeoffFrom: df, takeoffTo: dt, landingFrom: af, landingTo: at } = value;
    if (isFlightTimeAnyTime(df, dt, af, at)) return t("flightTimeSummaryAny");
    const parts: string[] = [];
    if (df && dt) parts.push(t("flightTimeSummaryTakeoff", { from: df, to: dt }));
    if (af && at) parts.push(t("flightTimeSummaryLanding", { from: af, to: at }));
    return parts.join(" · ");
  }, [value, t]);

  const setOpenAndNotify = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      close: () => setOpenAndNotify(false),
    }),
    [setOpenAndNotify],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenAndNotify(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpenAndNotify]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAndNotify(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpenAndNotify]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpenAndNotify(!open)}
        className={buttonClassName}
      >
        <span className="truncate">{buttonSummary}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open ? (
        <div className={popoverWrapperClassName}>
          <FlightSliceTimePopover
            takeoffFrom={value.takeoffFrom}
            takeoffTo={value.takeoffTo}
            landingFrom={value.landingFrom}
            landingTo={value.landingTo}
            onConfirm={(next) => {
              onChange(next);
            }}
            onClose={() => setOpenAndNotify(false)}
          />
        </div>
      ) : null}
    </div>
  );
});
