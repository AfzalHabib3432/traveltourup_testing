"use client";

import type { WishlistItemDto } from "@/lib/wishlist/wishlist.types";
import type { WishlistType } from "@/lib/wishlist/wishlist.constants";
import { apiJson } from "@/lib/http/api-client";

const WISHLIST_V1_BASE = "/api/v1/wishlist";

export async function listMyWishlist(params?: { type?: WishlistType }): Promise<WishlistItemDto[]> {
  const u = new URLSearchParams();
  if (params?.type) u.set("type", params.type);
  const qs = u.toString();
  const url = qs ? `${WISHLIST_V1_BASE}?${qs}` : WISHLIST_V1_BASE;
  return apiJson<WishlistItemDto[]>(url);
}

export type UpsertWishlistBody = {
  type: WishlistType;
  ref_id: string;
  title?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
  metadata?: unknown | null;
};

export async function addToWishlist(body: UpsertWishlistBody): Promise<WishlistItemDto> {
  return apiJson<WishlistItemDto>(WISHLIST_V1_BASE, { method: "POST", body });
}

export async function removeFromWishlist(type: WishlistType, refId: string): Promise<void> {
  const u = new URLSearchParams();
  u.set("type", type);
  u.set("ref_id", refId);
  await apiJson<{ ok: true }>(`${WISHLIST_V1_BASE}?${u.toString()}`, { method: "DELETE" });
}
