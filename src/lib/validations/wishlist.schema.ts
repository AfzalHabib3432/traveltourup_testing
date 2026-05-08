import { z } from "zod";
import { WISHLIST_TYPES } from "@/lib/wishlist/wishlist.constants";
import { paginationQuerySchema } from "@/lib/validations/pagination.schema";

export const wishlistTypeSchema = z.enum(WISHLIST_TYPES);

export const upsertWishlistItemSchema = z.object({
  type: wishlistTypeSchema,
  ref_id: z.string().trim().min(1).max(512),
  title: z.string().trim().max(2000).optional().nullable(),
  subtitle: z.string().trim().max(2000).optional().nullable(),
  image_url: z.string().trim().max(2000).optional().nullable(),
  metadata: z.unknown().optional().nullable(),
});

export const wishlistListQuerySchema = z.object({
  type: wishlistTypeSchema.optional(),
});

export const deleteWishlistQuerySchema = z.object({
  type: wishlistTypeSchema,
  ref_id: z.string().trim().min(1).max(512),
});

export const adminWishlistListQuerySchema = paginationQuerySchema.extend({
  user_id: z.string().uuid().optional(),
  type: wishlistTypeSchema.optional(),
  sort: z.enum(["created_at", "type"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
