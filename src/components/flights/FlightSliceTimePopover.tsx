"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DAY_END_MIN,
  DAY_START_MIN,
  TimeOfDayRangeSlider,
  minutesToHm,
  rangePairToStrings,
  stringsToRange,
} from "@/components/flights/TimeOfDayRangeSlider";

function axisSummary(minM: number, maxM: number, t: (key: string) => string): string {
  if (minM <= DAY_START_MIN && maxM >= DAY_END_MIN) return t("timeAxisAnyTime");
  return `${minutesToHm(minM)}–${minutesToHm(maxM)}`;
}

type Props = {
  takeoffFrom: string;
  takeoffTo: string;
  landingFrom: string;
  landingTo: string;
  onConfirm: (next: {
    takeoffFrom: string;
    takeoffTo: string;
    landingFrom: string;
    landingTo: string;
  }) => void;
  onClose: () => void;
  /** `inline`: flat layout for filter sidebars (no card chrome); Confirm applies like the popover. */
  variant?: "popover" | "inline";
};

export function FlightSliceTimePopover({
  takeoffFrom,
  takeoffTo,
  landingFrom,
  landingTo,
  onConfirm,
  onClose,
  variant = "popover",
}: Props) {
  const t = useTranslations("Flights.tab");
  const [dep, setDep] = useState<[number, number]>(() => stringsToRange(takeoffFrom, takeoffTo));
  const [arr, setArr] = useState<[number, number]>(() => stringsToRange(landingFrom, landingTo));

  useEffect(() => {
    setDep(stringsToRange(takeoffFrom, takeoffTo));
    setArr(stringsToRange(landingFrom, landingTo));
  }, [takeoffFrom, takeoffTo, landingFrom, landingTo]);

  const emitToParent = useCallback(
    (nextDep: [number, number], nextArr: [number, number]) => {
      const d = rangePairToStrings(nextDep[0], nextDep[1]);
      const a = rangePairToStrings(nextArr[0], nextArr[1]);
      onConfirm({
        takeoffFrom: d.from,
        takeoffTo: d.to,
        landingFrom: a.from,
        landingTo: a.to,
      });
    },
    [onConfirm],
  );

  const depSummary = axisSummary(dep[0], dep[1], t);
  const arrSummary = axisSummary(arr[0], arr[1], t);

  const handleConfirm = () => {
    emitToParent(dep, arr);
    onClose();
  };

  const isInline = variant === "inline";

  return (
    <div
      className={cn(
        "w-full",
        isInline
          ? ""
          : "min-w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-card p-2 shadow-xl",
      )}
    >
      <div className={isInline ? "space-y-5" : "space-y-4"}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex items-center gap-2 text-foreground",
                isInline ? "text-sm font-bold" : "text-sm font-semibold",
              )}
            >
              <PlaneTakeoff className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              {t("sliceTakeoffLabel")}
            </div>
            <span className="text-xs text-muted-foreground">{depSummary}</span>
          </div>
          <TimeOfDayRangeSlider value={dep} onChange={setDep} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex items-center gap-2 text-foreground",
                isInline ? "text-sm font-bold" : "text-sm font-semibold",
              )}
            >
              <PlaneLanding className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              {t("sliceLandingLabel")}
            </div>
            <span className="text-xs text-muted-foreground">{arrSummary}</span>
          </div>
          <TimeOfDayRangeSlider value={arr} onChange={setArr} />
        </div>
      </div>
      <div
        className={cn(
          "flex justify-end border-t border-border pt-3",
          isInline && "mt-1",
        )}
      >
        <button
          type="button"
          onClick={handleConfirm}
          className={cn(
            "rounded-lg px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground transition hover:opacity-90",
            isInline && "w-full sm:w-auto",
          )}
        >
          {t("flightTimeConfirm")}
        </button>
      </div>
    </div>
  );
}
