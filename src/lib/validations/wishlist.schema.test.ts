import { describe, expect, it } from "vitest";
import {
  adminWishlistListQuerySchema,
  deleteWishlistQuerySchema,
  upsertWishlistItemSchema,
  wishlistListQuerySchema,
} from "@/lib/validations/wishlist.schema";

describe("upsertWishlistItemSchema", () => {
  it("accepts minimal flight item", () => {
    const parsed = upsertWishlistItemSchema.safeParse({
      type: "flight",
      ref_id: "off_abc123",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts hotel with snapshot fields", () => {
    const parsed = upsertWishlistItemSchema.safeParse({
      type: "hotel",
      ref_id: "gb_StayResult_1",
      title: "Grand Hotel",
      subtitle: "London",
      image_url: "https://example.com/p.jpg",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const parsed = upsertWishlistItemSchema.safeParse({
      type: "train",
      ref_id: "x",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty ref_id", () => {
    const parsed = upsertWishlistItemSchema.safeParse({
      type: "car",
      ref_id: "   ",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("wishlistListQuerySchema", () => {
  it("accepts empty object", () => {
    const parsed = wishlistListQuerySchema.safeParse({});
    expect(parsed.success).toBe(true);
  });

  it("accepts type filter", () => {
    const parsed = wishlistListQuerySchema.safeParse({ type: "car" });
    expect(parsed.success).toBe(true);
  });
});

describe("deleteWishlistQuerySchema", () => {
  it("requires type and ref_id", () => {
    expect(deleteWishlistQuerySchema.safeParse({ type: "flight", ref_id: "off_1" }).success).toBe(true);
    expect(deleteWishlistQuerySchema.safeParse({ type: "flight" }).success).toBe(false);
  });
});

describe("adminWishlistListQuerySchema", () => {
  it("applies pagination defaults", () => {
    const parsed = adminWishlistListQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
    expect(parsed.sort).toBe("created_at");
    expect(parsed.order).toBe("desc");
  });

  it("accepts user_id and type", () => {
    const parsed = adminWishlistListQuerySchema.safeParse({
      page: "2",
      limit: "10",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      type: "hotel",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.limit).toBe(10);
    }
  });

  it("accepts sort and order", () => {
    const parsed = adminWishlistListQuerySchema.safeParse({
      sort: "type",
      order: "asc",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.sort).toBe("type");
      expect(parsed.data.order).toBe("asc");
    }
  });
});
