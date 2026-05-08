import type { WishlistType } from "@/lib/wishlist/wishlist.constants";

export type { WishlistType };

export type WishlistItemDto = {
  id: string;
  type: WishlistType;
  ref_id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  metadata: unknown | null;
  created_at: string;
  updated_at: string;
};

export type WishlistItemAdminRowDto = WishlistItemDto & {
  user_id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
};
