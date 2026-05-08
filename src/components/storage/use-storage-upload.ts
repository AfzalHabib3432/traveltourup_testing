"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import type { StorageVariantId } from "@/lib/storage/types";
import type { StorageUploadResponse } from "@/lib/http/storage.client";
import {
  uploadStorageFile,
  deleteStorageFile,
} from "@/lib/http/storage.client";

export type UseStorageUploadOptions = {
  variantId: StorageVariantId;
  /** Extra context forwarded to the upload API (e.g. `{ userId }` for avatars). */
  context?: Record<string, string>;
  onUploadSuccess?: (result: StorageUploadResponse) => void;
  onDeleteSuccess?: () => void;
  onError?: (message: string) => void;
};

/**
 * Generic upload/delete hook for any storage variant.
 * Wraps the unified storage client with React transition states.
 */
export function useStorageUpload({
  variantId,
  context,
  onUploadSuccess,
  onDeleteSuccess,
  onError,
}: UseStorageUploadOptions) {
  const onUploadSuccessRef = useRef(onUploadSuccess);
  const onDeleteSuccessRef = useRef(onDeleteSuccess);
  const onErrorRef = useRef(onError);
  onUploadSuccessRef.current = onUploadSuccess;
  onDeleteSuccessRef.current = onDeleteSuccess;
  onErrorRef.current = onError;

  const [error, setError] = useState<string | null>(null);
  const [uploadPending, startUpload] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const upload = useCallback(
    (file: File) => {
      startUpload(async () => {
        setError(null);
        try {
          const result = await uploadStorageFile(file, variantId, context);
          onUploadSuccessRef.current?.(result);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Upload failed";
          setError(msg);
          onErrorRef.current?.(msg);
        }
      });
    },
    [variantId, context],
  );

  const remove = useCallback(
    (path: string) => {
      startDelete(async () => {
        setError(null);
        try {
          await deleteStorageFile(variantId, path);
          onDeleteSuccessRef.current?.();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Delete failed";
          setError(msg);
          onErrorRef.current?.(msg);
        }
      });
    },
    [variantId],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    upload,
    remove,
    uploadPending,
    deletePending,
    busy: uploadPending || deletePending,
    error,
    clearError,
  };
}
