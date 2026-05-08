"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { INPUT_FIELD_CLASS } from "./inputFieldStyles";

export type NativeSelectProps = {
  label?: string;
  error?: string;
  errorId?: string;
  wrapperClassName?: string;
  /** Extra classes on the outer wrapper (e.g. sm:col-span-2) */
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { label, error, errorId, wrapperClassName = "", className = "", id, children, disabled, ...props },
  ref,
) {
  const selectId =
    id || (typeof props.name === "string" ? props.name : label?.toLowerCase().replace(/\s+/g, "-")) || "select";
  const errorMessageId = errorId ?? (error ? `${selectId}-error` : undefined);

  return (
    <div className={`flex w-full flex-col gap-1 ${wrapperClassName}`}>
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground dark:text-white">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorMessageId ?? undefined : undefined}
          className={`
            ${INPUT_FIELD_CLASS}
            appearance-none cursor-pointer pr-10
            disabled:cursor-not-allowed disabled:opacity-60
            ${error ? "ring-2 ring-destructive/60" : ""}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
      {error ? (
        <p id={errorMessageId} className="text-sm text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
});
