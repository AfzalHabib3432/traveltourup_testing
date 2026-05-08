import { redirect } from "next/navigation";
import { getServerAuthz } from "@/lib/authz/session";

/**
 * Friendly shortcut: `/[locale]/wishlists` → customer wishlist on the profile.
 * Admin cross-user list remains at `/admin/wishlists`.
 * API: `GET/POST/DELETE /api/v1/wishlist` (singular), not this path.
 */
export default async function WishlistsShortcutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const target = `/${locale}/profile?tab=wishlist`;
  const { userId } = await getServerAuthz();
  if (!userId) {
    redirect(`/${locale}/login?next=${encodeURIComponent(target)}`);
  }
  redirect(target);
}
