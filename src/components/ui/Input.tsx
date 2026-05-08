"use client";

import React, { forwardRef } from "react";
import { INPUT_FIELD_CLASS } from "./inputFieldStyles";

type ElementType = "input" | "textarea";

interface BaseProps {
  label?: string;
  error?: string;
  /** Optional id for the error message (e.g. aria-describedby target). */
  errorId?: string;
  icon?: React.ReactNode;
  /** Renders inside the field row (e.g. password visibility toggle) */
  suffix?: React.ReactNode;
  /** Classes for the outer wrapper (label + field) */
  wrapperClassName?: string;
  as?: ElementType;
}

export type InputProps =
  | (BaseProps & React.InputHTMLAttributes<HTMLInputElement>)
  | (BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>);

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(function Input(
  {
    label,
    error,
    errorId,
    icon,
    suffix,
    wrapperClassName = "",
    as = "input",
    className = "",
    id,
    ...props
  },
  ref
) {
  const inputId =
    id || props.name || label?.toLowerCase().replace(/\s+/g, "-");

  const Component = as;
  const isTextarea = as === "textarea";

  const errorMessageId = errorId ?? (error ? `${inputId}-error` : undefined);

  return (
    <div className={`flex w-full flex-col gap-1  ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground dark:text-white"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span
            className={`pointer-events-none absolute left-3 text-muted-foreground dark:text-white [&_svg]:text-inherit ${
              isTextarea ? "top-3" : "top-1/2 -translate-y-1/2"
            } `}
          >
            {icon}
          </span>
        )}

        <Component
          ref={ref as any}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? errorMessageId ?? undefined : undefined
          }
          className={`
            ${INPUT_FIELD_CLASS}
            ${icon ? "pl-10" : ""}
            ${suffix ? "pr-12" : ""}
            ${error ? "ring-2 ring-destructive/60" : ""}
            ${className}
          `}
          {...(props as any)}
        />

        {suffix && (
          <span
            className={`absolute right-3 text-muted-foreground dark:text-white [&_svg]:text-inherit ${
              isTextarea ? "top-3" : "top-1/2 -translate-y-1/2"
            }`}
          >
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p id={errorMessageId} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});
