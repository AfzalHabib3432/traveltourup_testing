"use client";

import React from "react";

export type EditSearchSummaryCardProps = {
  headline: string;
  lines: string[];
  editLabel: string;
  onEdit: () => void;
};

/**
 * Duffel-style compact summary + full-width “Edit search” control for results sidebars.
 */
export function EditSearchSummaryCard({
  headline,
  lines,
  editLabel,
  onEdit,
}: EditSearchSummaryCardProps) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4 dark:bg-muted/25">
      <h3 className="text-base font-bold text-foreground">{headline}</h3>
      <div className="mt-2 space-y-1 text-sm text-foreground">
        {lines.map((line, i) => (
          <p key={i} className={i === lines.length - 1 ? "text-muted-foreground" : undefined}>
            {line}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="mt-4 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {editLabel}
      </button>
    </div>
  );
}
