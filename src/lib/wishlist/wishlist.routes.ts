import type { WishlistType } from "@/lib/wishlist/wishlist.constants";

export function wishlistDetailHref(type: WishlistType, refId: string): string {
  const enc = encodeURIComponent(refId);
  switch (type) {
    case "flight":
      return `/flights/${enc}`;
    case "hotel":
      return `/hotels/${enc}`;
    case "car":
      return `/cars/${enc}`;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function wishlistVerticalHref(type: WishlistType): string {
  switch (type) {
    case "flight":
      return "/flights";
    case "hotel":
      return "/hotels";
    case "car":
      return "/cars";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
