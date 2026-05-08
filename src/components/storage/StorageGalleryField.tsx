"use client";

import Image from "next/image";
import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { StorageVariantId } from "@/lib/storage/types";
import {
  uploadStorageFile,
  deleteStorageFile,
} from "@/lib/http/storage.client";
import {
  getStorageVariantUiDefaults,
  parseStoragePathFromUrl,
} from "@/lib/storage/client";
import { Button } from "@/components/admin_ui/ui/button";
import { Input } from "@/components/admin_ui/ui/input";
import { Label } from "@/components/admin_ui/ui/label";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GalleryItem = {
  clientId: string;
  url: string;
  alt: string;
  isFeatured: boolean;
  storagePath: string | null;
};

// ---------------------------------------------------------------------------
// Helpers (exported for use by consumers)
// ---------------------------------------------------------------------------

/** Build `GalleryItem[]` from a DTO-like array with optional storage paths. */
export function galleryItemsFromDto<
  T extends { id: string; url: string; alt: string; isFeatured: boolean; storagePath?: string | null },
>(
  images: T[] | undefined | null,
  variantId: StorageVariantId,
): GalleryItem[] {
  if (!images?.length) return [];
  return images.map((img) => ({
    clientId: img.id,
    url: img.url,
    alt: img.alt,
    isFeatured: img.isFeatured,
    storagePath: img.storagePath ?? parseStoragePathFromUrl(img.url, variantId),
  }));
}

/** Ensure exactly one featured among rows that have a URL; clear featured on empty URLs. */
export function normalizeGallery(items: GalleryItem[]): GalleryItem[] {
  const withUrl = items.filter((i) => i.url.trim());
  if (withUrl.length === 0) {
    return items.map((i) => ({ ...i, isFeatured: false }));
  }
  const featuredWithUrl = withUrl.filter((i) => i.isFeatured);
  if (featuredWithUrl.length === 1) {
    return items.map((i) => ({
      ...i,
      isFeatured: i.url.trim() ? i.isFeatured : false,
    }));
  }
  let assigned = false;
  return items.map((i) => {
    if (!i.url.trim()) return { ...i, isFeatured: false };
    if (!assigned) {
      assigned = true;
      return { ...i, isFeatured: true };
    }
    return { ...i, isFeatured: false };
  });
}

/** Flatten gallery items into an API-ready payload. */
export function galleryToApiPayload(items: GalleryItem[]) {
  return normalizeGallery(items)
    .filter((i) => i.url.trim())
    .map((img, i) => ({
      url: img.url.trim(),
      alt: img.alt.trim(),
      sort_order: i,
      is_featured: img.isFeatured,
      storage_path: img.storagePath,
    }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type StorageGalleryFieldProps = {
  variantId: StorageVariantId;
  value: GalleryItem[];
  onApply: (updater: (prev: GalleryItem[]) => GalleryItem[]) => void;
  disabled?: boolean;
  /** Maximum number of gallery items (0 = unlimited). */
  maxItems?: number;
  /** Show the "featured / cover image" radio per row. */
  showFeatured?: boolean;
  /** Show the alt text input per row. */
  showAltText?: boolean;
  /** Show reorder arrows per row. */
  showReorder?: boolean;
  /** Optional accepted MIME types for the file input. */
  accept?: string;
  /** Optional override for the bucket name shown in the UI blurb. */
  storageBucketLabel?: string;
  /** Optional override for the resource label in UI copy. */
  resourceLabel?: string;
};

export function StorageGalleryField({
  variantId,
  value,
  onApply,
  disabled,
  maxItems = 0,
  showFeatured = true,
  showAltText = true,
  showReorder = true,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  storageBucketLabel,
  resourceLabel,
}: StorageGalleryFieldProps) {
  const ui = getStorageVariantUiDefaults(variantId);
  const bucketBlurb = storageBucketLabel ?? ui.bucket;
  const resourceBlurb = resourceLabel ?? ui.resourceLabel;

  const addRow = useCallback(() => {
    onApply((prev) => {
      if (maxItems > 0 && prev.length >= maxItems) return prev;
      return [
        ...prev,
        {
          clientId: crypto.randomUUID(),
          url: "",
          alt: "",
          isFeatured: prev.every((i) => !i.url.trim()),
          storagePath: null,
        },
      ];
    });
  }, [onApply, maxItems]);

  const move = useCallback(
    (idx: number, dir: -1 | 1) => {
      onApply((prev) => {
        const j = idx + dir;
        if (j < 0 || j >= prev.length) return prev;
        const copy = [...prev];
        [copy[idx], copy[j]] = [copy[j]!, copy[idx]!];
        return copy;
      });
    },
    [onApply],
  );

  const canAdd = maxItems === 0 || value.length < maxItems;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
      <div>
        <span className="text-sm font-medium text-foreground">Gallery images</span>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{resourceBlurb}</span> — uploads go to{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{bucketBlurb}</code>.
          {showFeatured && (
            <>
              {" "}Mark exactly one as <strong className="font-medium">Cover image</strong> — used on listing cards and social
              previews.
            </>
          )}
          {showReorder && " Reorder with the arrows."}
        </p>
      </div>

      <div className="space-y-4">
        {value.map((row, idx) => (
          <GalleryRow
            key={row.clientId}
            row={row}
            index={idx}
            total={value.length}
            disabled={disabled}
            variantId={variantId}
            accept={accept}
            showFeatured={showFeatured}
            showAltText={showAltText}
            showReorder={showReorder}
            onChangeRow={(patch) =>
              onApply((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
            }
            onRemove={() => {
              const path = row.storagePath;
              if (path) {
                void deleteStorageFile(variantId, path).catch(() => {});
              }
              onApply((prev) => prev.filter((_, i) => i !== idx));
            }}
            onMoveUp={() => move(idx, -1)}
            onMoveDown={() => move(idx, 1)}
            setFeatured={() => {
              onApply((prev) =>
                prev.map((r, i) => ({
                  ...r,
                  isFeatured: i === idx && Boolean(r.url.trim()),
                })),
              );
            }}
          />
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" disabled={disabled || !canAdd} onClick={addRow}>
        Add image
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery row (private)
// ---------------------------------------------------------------------------

type GalleryRowProps = {
  row: GalleryItem;
  index: number;
  total: number;
  disabled?: boolean;
  variantId: StorageVariantId;
  accept: string;
  showFeatured: boolean;
  showAltText: boolean;
  showReorder: boolean;
  onChangeRow: (patch: Partial<GalleryItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  setFeatured: () => void;
};

function GalleryRow({
  row,
  index,
  total,
  disabled,
  variantId,
  accept,
  showFeatured,
  showAltText,
  showReorder,
  onChangeRow,
  onRemove,
  onMoveUp,
  onMoveDown,
  setFeatured,
}: GalleryRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const hasUrl = Boolean(row.url.trim());

  const openPicker = useCallback(() => {
    if (disabled || busy) return;
    inputRef.current?.click();
  }, [disabled, busy]);

  const runUpload = useCallback(
    async (file: File | null | undefined) => {
      if (!file || disabled || busy) return;
      setBusy(true);
      setLocalError(null);
      const previousPath = row.storagePath;
      try {
        const data = await uploadStorageFile(file, variantId);
        if (previousPath && previousPath !== data.path) {
          try {
            await deleteStorageFile(variantId, previousPath);
          } catch {
            /* non-fatal */
          }
        }
        onChangeRow({ url: data.publicUrl ?? data.signedUrl ?? "", storagePath: data.path });
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [disabled, busy, row.storagePath, onChangeRow, variantId],
  );

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
      const f = e.dataTransfer.files?.[0];
      if (f) void runUpload(f);
    },
    [runUpload],
  );

  return (
    <div className="rounded-xl border border-border bg-background p-3 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">Image {index + 1}</span>
        <div className="flex flex-wrap items-center gap-1">
          {showReorder && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={disabled || index === 0}
                onClick={onMoveUp}
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={disabled || index >= total - 1}
                onClick={onMoveDown}
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onRemove}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            Remove
          </Button>
        </div>
      </div>

      {localError ? (
        <p className="text-xs text-destructive">{localError}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        tabIndex={-1}
        disabled={disabled || busy}
        aria-hidden
        onChange={(e: ChangeEvent<HTMLInputElement>) => void runUpload(e.target.files?.[0])}
      />

      {!hasUrl ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={openPicker}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            "flex min-h-[100px] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center text-xs transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-input hover:border-primary/40",
            disabled || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          ].join(" ")}
        >
          {busy ? "Uploading…" : "Drop or click to upload"}
        </button>
      ) : (
        <div
          className={["relative overflow-hidden rounded-lg border border-border", dragActive ? "ring-2 ring-primary" : ""].join(
            " ",
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="relative h-28 w-full sm:h-32">
            <Image src={row.url} alt="" fill unoptimized className="object-cover" sizes="200px" />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border bg-muted/30 p-2">
            <Button type="button" variant="outline" size="sm" disabled={disabled || busy} onClick={openPicker}>
              {busy ? "Uploading…" : "Replace"}
            </Button>
          </div>
        </div>
      )}

      {showAltText && (
        <div className="space-y-2">
          <Label htmlFor={`gallery-alt-${row.clientId}`} className="text-sm font-medium">
            Alt text{hasUrl ? " *" : ""}
          </Label>
          <Input
            id={`gallery-alt-${row.clientId}`}
            value={row.alt}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeRow({ alt: e.target.value })}
            disabled={disabled}
            required={hasUrl}
          />
        </div>
      )}

      {showFeatured && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="gallery-cover-image"
            checked={hasUrl && row.isFeatured}
            disabled={disabled || !hasUrl}
            onChange={() => setFeatured()}
            className="rounded-full border-border"
          />
          Cover image (featured in list & share cards)
        </label>
      )}
    </div>
  );
}
