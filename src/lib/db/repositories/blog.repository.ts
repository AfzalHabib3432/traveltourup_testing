import "server-only";

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const blogPostInclude = {
  category: true,
  author: { select: { id: true, first_name: true, last_name: true } },
  images: { orderBy: { sort_order: "asc" as const } },
} as const;

type FindManyArgs = NonNullable<Parameters<typeof prisma.blogPost.findMany>[0]>;

export type BlogPostWhereInput = NonNullable<FindManyArgs["where"]>;
export type BlogPostOrderByInput =
  | Prisma.BlogPostOrderByWithRelationInput
  | Prisma.BlogPostOrderByWithRelationInput[];

type CreateArgs = Parameters<typeof prisma.blogPost.create>[0];
export type BlogPostCreateInput = CreateArgs["data"];

type UpdateArgs = Parameters<typeof prisma.blogPost.update>[0];
export type BlogPostUpdateInput = UpdateArgs["data"];

async function _blogPostWithRelations() {
  const rows = await prisma.blogPost.findMany({
    include: blogPostInclude,
    take: 1,
  });
  return rows[0];
}

export type BlogPostRow = NonNullable<
  Awaited<ReturnType<typeof _blogPostWithRelations>>
>;

export const blogRepository = {
  findManyPublished(args?: { take?: number; skip?: number }) {
    return prisma.blogPost.findMany({
      where: { status: "published", published_at: { not: null } },
      orderBy: [{ featured: "desc" }, { published_at: "desc" }],
      include: blogPostInclude,
      ...args,
    });
  },

  findLatestFeaturedPublished(take: number) {
    return prisma.blogPost.findMany({
      where: {
        status: "published",
        published_at: { not: null },
        featured: true,
      },
      orderBy: { published_at: "desc" },
      take,
      include: blogPostInclude,
    });
  },

  findPublishedBySlug(slug: string) {
    return prisma.blogPost.findFirst({
      where: {
        slug,
        status: "published",
        published_at: { not: null },
      },
      include: blogPostInclude,
    });
  },

  /** Minimal fields for sitemap URLs (all locales share the same slug). */
  findPublishedSlugRowsForSitemap() {
    return prisma.blogPost.findMany({
      where: { status: "published", published_at: { not: null } },
      select: { slug: true, updated_at: true },
      orderBy: { updated_at: "desc" },
    });
  },

  async findManyPublishedPaginated(args: {
    where: BlogPostWhereInput;
    skip: number;
    take: number;
  }) {
    const where: BlogPostWhereInput = {
      ...args.where,
      status: "published",
      published_at: { not: null },
    };
    const [rows, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [{ featured: "desc" }, { published_at: "desc" }],
        skip: args.skip,
        take: args.take,
        include: blogPostInclude,
      }),
      prisma.blogPost.count({ where }),
    ]);
    return { rows, total };
  },

  async findManyPaginatedAdmin(args: {
    where: BlogPostWhereInput;
    skip: number;
    take: number;
    orderBy: BlogPostOrderByInput;
  }) {
    const [rows, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: args.where,
        orderBy: args.orderBy,
        skip: args.skip,
        take: args.take,
        include: blogPostInclude,
      }),
      prisma.blogPost.count({ where: args.where }),
    ]);
    return { rows, total };
  },

  findByIdAdmin(id: string) {
    return prisma.blogPost.findUnique({
      where: { id },
      include: blogPostInclude,
    });
  },

  /** Any status — used for admin slug uniqueness checks. */
  findAnyBySlug(slug: string) {
    return prisma.blogPost.findFirst({
      where: { slug },
      select: { id: true },
    });
  },

  findAnyBySlugExceptId(slug: string, excludeId: string) {
    return prisma.blogPost.findFirst({
      where: { slug, NOT: { id: excludeId } },
      select: { id: true },
    });
  },

  create(data: BlogPostCreateInput) {
    return prisma.blogPost.create({
      data,
      include: blogPostInclude,
    });
  },

  update(id: string, data: BlogPostUpdateInput) {
    return prisma.blogPost.update({
      where: { id },
      data,
      include: blogPostInclude,
    });
  },

  delete(id: string) {
    return prisma.blogPost.delete({ where: { id } });
  },

  findManyCategories() {
    return prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  },
};
