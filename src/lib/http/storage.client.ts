"use client";

import { apiJson } from "@/lib/http/api-client";
import type { StorageVariantId } from "@/lib/storage/types";

export const STORAGE_V1_BASE = "/api/v1/storage";

export type StorageUploadResponse = {
  bucket: string;
  path: string;
  publicUrl: string | null;
  signedUrl: string | null;
  mime: string;
  size: number;
};

/**
 * Authenticated upload to Supabase Storage via the unified API.
 * Works for every registered variant (public or private buckets).
 */
export async function uploadStorageFile(
  file: File,
  variantId: StorageVariantId,
  context?: Record<string, string>,
): Promise<StorageUploadResponse> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("variant", variantId);
  if (context) {
    fd.set("context", JSON.stringify(context));
  }
  const res = await fetch(`${STORAGE_V1_BASE}/upload`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ||
        (json as { code?: string }).code ||
        "Upload failed",
    );
  }
  const data = (json as { data?: StorageUploadResponse }).data;
  if (!data?.path || !data?.bucket) {
    throw new Error("Invalid upload response");
  }
  return data;
}

/** Delete an object from Supabase Storage via the unified API. */
export async function deleteStorageFile(
  variantId: StorageVariantId,
  path: string,
): Promise<void> {
  await apiJson<{ ok: true }>(`${STORAGE_V1_BASE}/delete`, {
    method: "POST",
    body: { variant: variantId, path },
  });
}

/** Fetch a fresh signed download URL for a private-bucket object. */
export async function getStorageSignedUrl(
  variantId: StorageVariantId,
  path: string,
): Promise<string> {
  const params = new URLSearchParams({ variant: variantId, path });
  const data = await apiJson<{ signedUrl: string }>(
    `${STORAGE_V1_BASE}/signed-url?${params.toString()}`,
  );
  return data.signedUrl;
}

/** Reset a file input and forward the first selected file (or no-op). */
export function consumeFirstFileFromInput(
  e: React.ChangeEvent<HTMLInputElement>,
  onFile: (file: File) => void,
): void {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (file) onFile(file);
}
