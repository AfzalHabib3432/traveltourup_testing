import "server-only";

import { cache } from "react";

import { NotFoundError } from "@/lib/api/errors";
import type { BlogPostDto, BlogPostImageDto } from "@/lib/blog/blog.types";
import {
  blogRepository,
  type BlogPostRow,
  type BlogPostOrderByInput,
  type BlogPostWhereInput,
} from "@/lib/db/repositories/blog.repository";
import {
  blogAdminListQuerySchema,
  blogPublicListQuerySchema,
} from "@/lib/validations/blog.schema";
import type { z } from "zod";

type AdminListQuery = z.infer<typeof blogAdminListQuerySchema>;
type PublicListQuery = z.infer<typeof blogPublicListQuerySchema>;

// ---------------------------------------------------------------------------
// Mapper — DB row (snake_case) → DTO (camelCase)
// ---------------------------------------------------------------------------

function authorDisplayName(row: BlogPostRow): { id: string; name: string } {
  if (!row.author) {
    return { id: "team", name: "TravelTourUp Team" };
  }
  const name = [row.author.first_name, row.author.last_name].filter(Boolean).join(" ").trim();
  return {
    id: row.author.id,
    name: name || "TravelTourUp Team",
  };
}

function mapImages(row: BlogPostRow): BlogPostImageDto[] {
  const images = row.images ?? [];
  return images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    sortOrder: img.sort_order,
    isFeatured: img.is_featured,
    storagePath: img.storage_path,
  }));
}

function deriveCoverFromImages(images: BlogPostImageDto[]): { image: string; imageAlt: string } {
  const featured = images.find((i) => i.isFeatured) ?? images[0];
  return {
    image: featured?.url ?? "",
    imageAlt: featured?.alt ?? "",
  };
}

export function mapRowToDto(row: BlogPostRow): BlogPostDto {
  const publishedAt = row.published_at ?? row.created_at;
  const images = mapImages(row);
  const { image, imageAlt } = deriveCoverFromImages(images);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    images,
    image,
    imageAlt,
    category: {
      id: row.category.id,
      name: row.category.name,
      slug: row.category.slug,
    },
    author: authorDisplayName(row),
    publishedAt,
    updatedAt: row.updated_at,
    status: row.status,
    tags: row.tags,
    featured: row.featured,
    viewsCount: row.views_count,
    readTime: row.read_time,
    seo: {
      metaTitle: row.meta_title ?? row.title,
      metaDescription: row.meta_description ?? row.excerpt,
    },
  };
}

// ---------------------------------------------------------------------------
// Admin CRUD
// ---------------------------------------------------------------------------

const idAsc = { id: "asc" as const };

function listOrderBy(query: AdminListQuery): BlogPostOrderByInput {
  const dir = query.order;
  if (!query.sort) {
    return [{ updated_at: "desc" }, idAsc];
  }
  switch (query.sort) {
    case "title":
      return [{ title: dir }, idAsc];
    case "slug":
      return [{ slug: dir }, idAsc];
    case "status":
      return [{ status: dir }, idAsc];
    case "category":
      return [{ category: { name: dir } }, idAsc];
    case "updated":
      return [{ updated_at: dir }, idAsc];
    default:
      return [{ updated_at: "desc" }, idAsc];
  }
}

export async function listAdminBlogPosts(query: AdminListQuery): Promise<{
  items: BlogPostDto[];
  total: number;
}> {
  const where: BlogPostWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.category_id ? { category_id: query.category_id } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
            { excerpt: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;
  const { rows, total } = await blogRepository.findManyPaginatedAdmin({
    where,
    skip,
    take: query.limit,
    orderBy: listOrderBy(query),
  });
  return { items: rows.map(mapRowToDto), total };
}

export async function getAdminBlogPost(id: string): Promise<BlogPostDto> {
  const row = await blogRepository.findByIdAdmin(id);
  if (!row) {
    throw new NotFoundError("Blog post");
  }
  return mapRowToDto(row);
}

export function buildPublishedAt(
  status: string,
  publishedAt: Date | null | undefined,
  existing?: Date | null,
): Date | null {
  if (status !== "published") {
    return null;
  }
  if (publishedAt) return publishedAt;
  if (existing) return existing;
  return new Date();
}

export async function deleteAdminBlogPost(id: string): Promise<void> {
  await getAdminBlogPost(id);
  await blogRepository.delete(id);
}

// ---------------------------------------------------------------------------
// Public / marketing
// ---------------------------------------------------------------------------

export async function listPublicBlogPosts(query: PublicListQuery): Promise<{
  items: BlogPostDto[];
  total: number;
  page: number;
  limit: number;
}> {
  const extraWhere: BlogPostWhereInput = {
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { excerpt: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(query.category_slug
      ? { category: { slug: query.category_slug } }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;
  const { rows, total } = await blogRepository.findManyPublishedPaginated({
    where: extraWhere,
    skip,
    take: query.limit,
  });

  return {
    items: rows.map(mapRowToDto),
    total,
    page: query.page,
    limit: query.limit,
  };
}

export async function getPublicBlogPostBySlug(slug: string): Promise<BlogPostDto> {
  const row = await blogRepository.findPublishedBySlug(slug);
  if (!row) {
    throw new NotFoundError("Blog post");
  }
  return mapRowToDto(row);
}

// ---------------------------------------------------------------------------
// RSC loaders (called by marketing pages — deduped with React cache())
// ---------------------------------------------------------------------------

export async function loadPublishedBlogPostsForMarketing(): Promise<BlogPostDto[]> {
  const { items } = await listPublicBlogPosts({ page: 1, limit: 500 });
  return items;
}

export const loadLatestFeaturedBlogPostsForHome = cache(
  async (limit = 4): Promise<BlogPostDto[]> => {
    const rows = await blogRepository.findLatestFeaturedPublished(limit);
    return rows.map(mapRowToDto);
  },
);

export const loadPublicBlogPostBySlug = cache(async (slug: string): Promise<BlogPostDto | null> => {
  try {
    return await getPublicBlogPostBySlug(slug);
  } catch (e) {
    if (e instanceof NotFoundError) return null;
    throw e;
  }
});

// ---------------------------------------------------------------------------
// Sub-entity helpers (categories — used for admin dropdowns)
// ---------------------------------------------------------------------------

export async function listBlogCategoriesForAdmin() {
  return blogRepository.findManyCategories();
}
