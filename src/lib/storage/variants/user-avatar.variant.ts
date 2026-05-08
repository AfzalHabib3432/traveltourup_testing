import type { StorageVariantConfig } from "@/lib/storage/types";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const USER_AVATAR_BUCKET = "user-uploads" as const;

/** Matches `{uuid}/avatar` — one avatar per user, no path traversal. */
const AVATAR_OBJECT_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/avatar$/i;

export const userAvatarVariant: StorageVariantConfig = {
  id: "user-avatar",
  resourceLabel: "User avatar",
  bucket: USER_AVATAR_BUCKET,
  visibility: "private",
  maxBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ALLOWED,
  writePermission: "profile:update",
  selfService: true,
  upsert: true,
  signedUrlExpirySeconds: 120,
  buildObjectPath(_filename: string, context?: Record<string, string>) {
    const userId = context?.userId;
    if (!userId) throw new Error("userId is required in context for user-avatar variant");
    return `${userId}/avatar`;
  },
  isValidStoragePath(path: string) {
    if (!path || path.includes("..") || path.includes("\\") || path.startsWith("/")) {
      return false;
    }
    return AVATAR_OBJECT_RE.test(path);
  },
  parsePathFromUrl(url: string) {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${USER_AVATAR_BUCKET}/`;
    const signedMarker = `/storage/v1/object/sign/${USER_AVATAR_BUCKET}/`;
    let raw: string | undefined;
    const pubIdx = url.indexOf(marker);
    if (pubIdx !== -1) {
      raw = url.slice(pubIdx + marker.length).split(/[?#]/)[0];
    } else {
      const sigIdx = url.indexOf(signedMarker);
      if (sigIdx !== -1) {
        raw = url.slice(sigIdx + signedMarker.length).split(/[?#]/)[0];
      }
    }
    if (!raw) return null;
    let path: string;
    try {
      path = decodeURIComponent(raw);
    } catch {
      return null;
    }
    return userAvatarVariant.isValidStoragePath(path) ? path : null;
  },
};
