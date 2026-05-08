"use client";

import useSWR, { mutate as globalMutate } from "swr";
import { listMyWishlist } from "@/lib/http/wishlist.client";
import type { WishlistType } from "@/lib/wishlist/wishlist.constants";

/** Prefix for SWR keys; must match `revalidateWishlistQueries` filter. */
export const WISHLIST_SWR_KEY_PREFIX = "/api/v1/wishlist" as const;

export type WishlistListScope = WishlistType | "all";

export function wishlistItemsCacheKey(
  scope: WishlistListScope,
  userId: string,
): readonly [typeof WISHLIST_SWR_KEY_PREFIX, WishlistListScope, string] {
  return [WISHLIST_SWR_KEY_PREFIX, scope, userId] as const;
}

function isWishlistSwrKey(key: unknown): key is ReturnType<typeof wishlistItemsCacheKey> {
  return Array.isArray(key) && key.length === 3 && key[0] === WISHLIST_SWR_KEY_PREFIX;
}

/** Revalidate every cached wishlist list for all scopes and users (e.g. after add/remove). */
export function revalidateWishlistQueries() {
  return globalMutate(
    (key) => isWishlistSwrKey(key),
    undefined,
    { revalidate: true },
  );
}

function devLogWishlistFetch(scope: WishlistListScope): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[wishlist] SWR fetch (deduped per key)", { scope });
  }
}

/**
 * Shared wishlist list query. Concurrent mounts with the same `scope` and `userId` share one
 * in-flight request (SWR deduping).
 */
export function useWishlistItemsQuery(scope: WishlistListScope, userId: string | null | undefined) {
  const key = userId ? wishlistItemsCacheKey(scope, userId) : null;

  return useSWR(
    key,
    async () => {
      devLogWishlistFetch(scope);
      return listMyWishlist(scope === "all" ? undefined : { type: scope });
    },
    {
      revalidateOnFocus: false,
    },
  );
}
