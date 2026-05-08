import { listAllWishlistsForAdmin, listUsersForWishlistAdminFilter } from "@/lib/services/wishlist/wishlist.service";
import { adminWishlistListQuerySchema } from "@/lib/validations/wishlist.schema";
import { isWishlistType, wishlistTypeLabel } from "@/lib/wishlist/wishlist.constants";
import type { WishlistType } from "@/lib/wishlist/wishlist.constants";
import { WishlistList } from "@/components/admin/wishlists";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function AdminWishlistsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const rawType = first(sp.type);
  const type =
    rawType && rawType !== "all" && isWishlistType(rawType) ? (rawType as WishlistType) : undefined;

  const query = adminWishlistListQuerySchema.parse({
    page: first(sp.page) || undefined,
    limit: first(sp.limit) || undefined,
    user_id: first(sp.user_id)?.trim() || undefined,
    type,
    sort: first(sp.sort) || undefined,
    order: first(sp.order) || undefined,
  });

  const [{ items, total }, filterUsers] = await Promise.all([
    listAllWishlistsForAdmin(query),
    listUsersForWishlistAdminFilter({ ensureUserId: query.user_id }),
  ]);

  const wishlistUsers = filterUsers.map((u) => ({
    id: u.id,
    name: `${u.first_name} ${u.last_name}`.trim() || "—",
  }));

  const rows = items.map((row) => {
    const name = `${row.user.first_name} ${row.user.last_name}`.trim() || "—";
    const headline = row.title?.trim() || `(${wishlistTypeLabel(row.type)})`;
    return {
      id: row.id,
      user_id: row.user_id,
      customer: name,
      type_label: wishlistTypeLabel(row.type),
      title_line: headline,
      ref_id: row.ref_id,
      saved: new Date(row.created_at).toLocaleString(),
      wishlist_type: row.type,
      subtitle: row.subtitle,
    };
  });

  return <WishlistList rows={rows} total={total} query={query} wishlistUsers={wishlistUsers} />;
}
