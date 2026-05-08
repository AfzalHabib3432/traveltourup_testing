import "server-only";

import { ConflictError, NotFoundError } from "@/lib/api/errors";
import type { BlogPostDto } from "@/lib/blog/blog.types";
import {
  blogRepository,
  type BlogPostUpdateInput,
} from "@/lib/db/repositories/blog.repository";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
} from "@/lib/validations/blog.schema";
import type { z } from "zod";
import { sanitizeStoredBlogHtml } from "./blog-html-sanitize";
import { buildPublishedAt, mapRowToDto } from "./blog.service";

type CreateBody = z.infer<typeof createBlogPostSchema>;
type UpdateBody = z.infer<typeof updateBlogPostSchema>;

const SLUG_CONFLICT_ISSUES = [
  {
    path: ["slug"],
    message: "A post with this URL slug already exists. Use a different slug.",
  },
] as const;

type BlogImageRow = {
  url: string;
  alt: string;
  sort_order: number;
  is_featured: boolean;
  storage_path: string | null;
};

/**
 * DB partial unique index allows only one `is_featured = true` per post.
 * Coalesce accidental duplicates / omissions before nested create/replace.
 */
function normalizeBlogImageRowsForDb(images: BlogImageRow[]): BlogImageRow[] {
  if (images.length === 0) return images;
  const idx = images.findIndex((i) => i.is_featured);
  if (idx >= 0) {
    return images.map((img, i) => ({
      ...img,
      is_featured: i === idx,
    }));
  }
  return images.map((img, i) => ({
    ...img,
    is_featured: i === 0,
  }));
}

export async function createAdminBlogPost(body: CreateBody): Promise<BlogPostDto> {
  const slugTaken = await blogRepository.findAnyBySlug(body.slug);
  if (slugTaken) {
    throw new ConflictError(
      "A post with this URL slug already exists. Use a different slug.",
      [...SLUG_CONFLICT_ISSUES],
    );
  }

  const published_at = buildPublishedAt(body.status, body.published_at, null);
  const imageRows = normalizeBlogImageRowsForDb(
    body.images.map((img, i) => ({
      url: img.url,
      alt: img.alt,
      sort_order: img.sort_order ?? i,
      is_featured: img.is_featured,
      storage_path: img.storage_path ?? null,
    })),
  );
  const row = await blogRepository.create({
    title: body.title,
    slug: body.slug,
    content: sanitizeStoredBlogHtml(body.content),
    excerpt: body.excerpt,
    tags: body.tags,
    status: body.status,
    featured: body.featured,
    views_count: body.views_count,
    read_time: body.read_time,
    meta_title: body.meta_title ?? undefined,
    meta_description: body.meta_description ?? undefined,
    published_at,
    category: { connect: { id: body.category_id } },
    ...(body.author_id
      ? { author: { connect: { id: body.author_id } } }
      : {}),
    images: {
      create: imageRows.map((row) => ({
        url: row.url,
        alt: row.alt,
        sort_order: row.sort_order,
        is_featured: row.is_featured,
        storage_path: row.storage_path,
      })),
    },
  });
  return mapRowToDto(row);
}

export async function updateAdminBlogPost(id: string, body: UpdateBody): Promise<BlogPostDto> {
  const existing = await blogRepository.findByIdAdmin(id);
  if (!existing) {
    throw new NotFoundError("Blog post");
  }

  const nextStatus = body.status ?? existing.status;
  const published_at =
    body.published_at !== undefined || body.status !== undefined
      ? buildPublishedAt(nextStatus, body.published_at ?? existing.published_at, existing.published_at)
      : existing.published_at;

  if (body.slug !== undefined && body.slug !== existing.slug) {
    const slugTaken = await blogRepository.findAnyBySlugExceptId(body.slug, id);
    if (slugTaken) {
      throw new ConflictError(
        "A post with this URL slug already exists. Use a different slug.",
        [...SLUG_CONFLICT_ISSUES],
      );
    }
  }

  const data: BlogPostUpdateInput = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.content !== undefined) data.content = sanitizeStoredBlogHtml(body.content);
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.images !== undefined) {
    const imageRows = normalizeBlogImageRowsForDb(
      body.images.map((img, i) => ({
        url: img.url,
        alt: img.alt,
        sort_order: img.sort_order ?? i,
        is_featured: img.is_featured,
        storage_path: img.storage_path ?? null,
      })),
    );
    data.images = {
      deleteMany: {},
      create: imageRows.map((row) => ({
        url: row.url,
        alt: row.alt,
        sort_order: row.sort_order,
        is_featured: row.is_featured,
        storage_path: row.storage_path,
      })),
    };
  }
  if (body.tags !== undefined) data.tags = body.tags;
  if (body.status !== undefined) data.status = body.status;
  if (body.featured !== undefined) data.featured = body.featured;
  if (body.views_count !== undefined) data.views_count = body.views_count;
  if (body.read_time !== undefined) data.read_time = body.read_time;
  if (body.meta_title !== undefined) data.meta_title = body.meta_title;
  if (body.meta_description !== undefined) data.meta_description = body.meta_description;
  if (body.published_at !== undefined || body.status !== undefined) {
    data.published_at = published_at;
  }
  if (body.category_id !== undefined) {
    data.category = { connect: { id: body.category_id } };
  }
  if (body.author_id !== undefined) {
    data.author = body.author_id
      ? { connect: { id: body.author_id } }
      : { disconnect: true };
  }

  const row = await blogRepository.update(id, data);
  return mapRowToDto(row);
}
