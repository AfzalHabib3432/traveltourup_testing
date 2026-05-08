"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import type { StorageVariantId } from "@/lib/storage/types";
import type { StorageUploadResponse } from "@/lib/http/storage.client";
import { consumeFirstFileFromInput } from "@/lib/http/storage.client";
import { useStorageUpload } from "@/components/storage/use-storage-upload";

export type StorageUploadZoneProps = {
  /** Which storage variant to use. */
  variantId: StorageVariantId;
  /** Optional context forwarded to the API (e.g. `{ userId }` for avatars). */
  context?: Record<string, string>;
  /** Current file URL (public URL or signed URL) — shows preview when set. */
  value: string | null;
  /** Storage path for the current file (needed for deletion). */
  storagePath: string | null;
  /** Accepted MIME types for the file input (e.g. "image/jpeg,image/png"). */
  accept?: string;
  /** Called after successful upload. */
  onUploadComplete?: (result: StorageUploadResponse) => void;
  /** Called after successful deletion. */
  onDeleteComplete?: () => void;
  disabled?: boolean;
  /** Visual shape: "rectangle" for generic drop zones, "circle" for avatars. */
  shape?: "rectangle" | "circle";
  /** CSS class for the outer wrapper. */
  className?: string;
  /** Placeholder label when no file is set. */
  placeholder?: string;
};

/**
 * Generic single-file upload component with drag-and-drop.
 * Works for avatars, cover images, documents, or any single-file variant.
 */
export function StorageUploadZone({
  variantId,
  context,
  value,
  storagePath,
  accept = "image/*",
  onUploadComplete,
  onDeleteComplete,
  disabled,
  shape = "rectangle",
  className,
  placeholder = "Drop or click to upload",
}: StorageUploadZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const { upload, remove, uploadPending, deletePending, busy, error, clearError } =
    useStorageUpload({
      variantId,
      context,
      onUploadSuccess: onUploadComplete,
      onDeleteSuccess: onDeleteComplete,
    });

  const openPicker = useCallback(() => {
    if (disabled || busy) return;
    fileRef.current?.click();
  }, [disabled, busy]);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || disabled || busy) return;
      clearError();
      upload(file);
    },
    [disabled, busy, upload, clearError],
  );

  const handleDelete = useCallback(() => {
    if (!storagePath || disabled || busy) return;
    remove(storagePath);
  }, [storagePath, disabled, busy, remove]);

  const onDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !busy) setDragActive(true);
    },
    [disabled, busy],
  );

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  const hasValue = Boolean(value);
  const isCircle = shape === "circle";

  return (
    <div className={className}>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        disabled={disabled || busy}
        aria-hidden
        onChange={(e: ChangeEvent<HTMLInputElement>) => consumeFirstFileFromInput(e, (f) => handleFile(f))}
      />

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      {!hasValue ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={openPicker}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            "flex items-center justify-center gap-2 border-2 border-dashed text-center text-xs transition-colors",
            isCircle
              ? "h-24 w-24 rounded-full"
              : "min-h-[100px] w-full flex-col rounded-lg px-4 py-6",
            dragActive ? "border-primary bg-primary/5" : "border-input hover:border-primary/40",
            disabled || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          ].join(" ")}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" aria-hidden />
              {!isCircle && <span className="text-muted-foreground">{placeholder}</span>}
            </>
          )}
        </button>
      ) : (
        <div
          className={[
            "group relative overflow-hidden border border-border",
            isCircle ? "h-24 w-24 rounded-full" : "rounded-lg",
            dragActive ? "ring-2 ring-primary" : "",
          ].join(" ")}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <img
            src={value!}
            alt=""
            className={[
              "h-full w-full object-cover",
              isCircle ? "" : "max-h-40",
            ].join(" ")}
            referrerPolicy="no-referrer"
          />

          {/* Hover overlay with actions */}
          <div
            className={[
              "absolute inset-0 flex items-center justify-center gap-2 bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100",
              isCircle ? "rounded-full" : "rounded-lg",
            ].join(" ")}
          >
            <button
              type="button"
              disabled={busy}
              onClick={openPicker}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-50"
              aria-label="Replace file"
            >
              {uploadPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Camera className="h-4 w-4" aria-hidden />
              )}
            </button>

            {storagePath && (
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition hover:opacity-90 disabled:opacity-50"
                aria-label="Remove file"
              >
                {deletePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
