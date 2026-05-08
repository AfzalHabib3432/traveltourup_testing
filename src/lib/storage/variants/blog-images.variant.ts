import type { StorageVariantConfig } from "@/lib/storage/types";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

/** Matches objects under `posts/{uuid}.{ext}` — no path traversal. */
const POSTS_OBJECT_RE =
  /^posts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i;

export const BLOG_IMAGES_BUCKET = "blogs_images" as const;

export const blogImagesVariant: StorageVariantConfig = {
  id: "blog-images",
  resourceLabel: "Blog images",
  bucket: BLOG_IMAGES_BUCKET,
  visibility: "public",
  maxBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ALLOWED,
  writePermission: "admin.blogs:write",
  upsert: false,
  buildObjectPath(filename: string) {
    const raw = filename.split(".").pop()?.toLowerCase() || "jpg";
    const ext =
      raw === "jpeg"
        ? "jpg"
        : raw === "jpg" || raw === "png" || raw === "webp" || raw === "gif"
          ? raw
          : "jpg";
    return `posts/${crypto.randomUUID()}.${ext}`;
  },
  isValidStoragePath(path: string) {
    if (!path || path.includes("..") || path.includes("\\") || path.startsWith("/")) {
      return false;
    }
    return POSTS_OBJECT_RE.test(path);
  },
  parsePathFromUrl(url: string) {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const raw = url.slice(idx + marker.length).split(/[?#]/)[0] ?? "";
    let path: string;
    try {
      path = decodeURIComponent(raw);
    } catch {
      return null;
    }
    return blogImagesVariant.isValidStoragePath(path) ? path : null;
  },
};
