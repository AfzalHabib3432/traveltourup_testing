export const WISHLIST_TYPES = ["flight", "hotel", "car"] as const;

export type WishlistType = (typeof WISHLIST_TYPES)[number];

export function isWishlistType(v: string): v is WishlistType {
  return (WISHLIST_TYPES as readonly string[]).includes(v);
}

/** Short label for UI (e.g. "Flight", "Hotel"). */
export function wishlistTypeLabel(t: WishlistType): string {
  switch (t) {
    case "flight":
      return "Flight";
    case "hotel":
      return "Hotel";
    case "car":
      return "Car";
    default: {
      const _e: never = t;
      return _e;
    }
  }
}
