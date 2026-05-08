import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { WishlistItemAdminRowDto, WishlistItemDto } from "@/lib/wishlist/wishlist.types";
import type { WishlistType } from "@/lib/wishlist/wishlist.constants";
import type { z } from "zod";
import type { adminWishlistListQuerySchema, upsertWishlistItemSchema } from "@/lib/validations/wishlist.schema";

type UpsertBody = z.infer<typeof upsertWishlistItemSchema>;
type AdminListQuery = z.infer<typeof adminWishlistListQuerySchema>;

function rowToDto(row: {
  id: string;
  type: string;
  ref_id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  metadata: Prisma.JsonValue | null;
  created_at: Date;
  updated_at: Date;
}): WishlistItemDto {
  return {
    id: row.id,
    type: row.type as WishlistType,
    ref_id: row.ref_id,
    title: row.title,
    subtitle: row.subtitle,
    image_url: row.image_url,
    metadata: row.metadata === null ? null : row.metadata,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function listWishlistForUser(
  userId: string,
  filters: { type?: WishlistType },
): Promise<WishlistItemDto[]> {
  const rows = await prisma.wishlistItem.findMany({
    where: {
      user_id: userId,
      ...(filters.type ? { type: filters.type } : {}),
    },
    orderBy: { created_at: "desc" },
  });
  return rows.map(rowToDto);
}

export async function upsertWishlistItemForUser(userId: string, body: UpsertBody): Promise<WishlistItemDto> {
  const row = await prisma.wishlistItem.upsert({
    where: {
      user_id_type_ref_id: {
        user_id: userId,
        type: body.type,
        ref_id: body.ref_id,
      },
    },
    create: {
      user_id: userId,
      type: body.type,
      ref_id: body.ref_id,
      title: body.title ?? null,
      subtitle: body.subtitle ?? null,
      image_url: body.image_url ?? null,
      metadata: body.metadata === undefined ? undefined : (body.metadata as Prisma.InputJsonValue),
    },
    update: {
      title: body.title === undefined ? undefined : body.title,
      subtitle: body.subtitle === undefined ? undefined : body.subtitle,
      image_url: body.image_url === undefined ? undefined : body.image_url,
      metadata: body.metadata === undefined ? undefined : (body.metadata as Prisma.InputJsonValue),
    },
  });
  return rowToDto(row);
}

export async function deleteWishlistItemForUser(
  userId: string,
  type: WishlistType,
  refId: string,
): Promise<{ deleted: boolean }> {
  try {
    await prisma.wishlistItem.delete({
      where: {
        user_id_type_ref_id: {
          user_id: userId,
          type,
          ref_id: refId,
        },
      },
    });
    return { deleted: true };
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2025") {
      return { deleted: false };
    }
    throw e;
  }
}

/** Distinct users who have wishlist rows, plus `ensureUserId` when set (keeps filter label valid for bookmarked URLs). */
export async function listUsersForWishlistAdminFilter(opts?: {
  ensureUserId?: string;
}): Promise<{ id: string; first_name: string; last_name: string }[]> {
  const ensureId = opts?.ensureUserId;
  return prisma.user.findMany({
    where: {
      OR: [{ wishlist_items: { some: {} } }, ...(ensureId ? [{ id: ensureId }] : [])],
    },
    select: { id: true, first_name: true, last_name: true },
    orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
  });
}

export async function listAllWishlistsForAdmin(query: AdminListQuery): Promise<{
  items: WishlistItemAdminRowDto[];
  total: number;
  page: number;
  limit: number;
}> {
  const where: Prisma.WishlistItemWhereInput = {
    ...(query.user_id ? { user_id: query.user_id } : {}),
    ...(query.type ? { type: query.type } : {}),
  };

  const dir = query.order;
  const orderBy: Prisma.WishlistItemOrderByWithRelationInput =
    query.sort === "type" ? { type: dir } : { created_at: dir };

  const [total, rows] = await prisma.$transaction([
    prisma.wishlistItem.count({ where }),
    prisma.wishlistItem.findMany({
      where,
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true },
        },
      },
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  const items: WishlistItemAdminRowDto[] = rows.map((row) => ({
    ...rowToDto(row),
    user_id: row.user_id,
    user: row.user,
  }));

  return { items, total, page: query.page, limit: query.limit };
}
