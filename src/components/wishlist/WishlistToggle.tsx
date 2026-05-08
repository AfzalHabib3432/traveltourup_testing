"use client";

import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { defaultLocale } from "@/i18n/routing";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { WishlistType } from "@/lib/wishlist/wishlist.constants";
import { addToWishlist, removeFromWishlist } from "@/lib/http/wishlist.client";
import { revalidateWishlistQueries, useWishlistItemsQuery } from "@/lib/http/wishlist-swr";

export type WishlistToggleProps = {
  type: WishlistType;
  refId: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  className?: string;
  /** Compact heart for list/grid cards; stops propagation so parent links/buttons do not fire. */
  display?: "button" | "icon";
};

const iconShellClass = (saved: boolean, extra?: string) =>
  cn(
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
    saved ? "border-primary text-primary bg-primary/10" : "border-border",
    extra,
  );

export function WishlistToggle({
  type,
  refId,
  title,
  subtitle,
  imageUrl,
  className,
  display = "button",
}: WishlistToggleProps) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : defaultLocale;
  const [loading, setLoading] = useState(false);

  const loginNext = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
  const loginHref = `/${locale}/login${loginNext}`;

  const { data, error, isLoading } = useWishlistItemsQuery(type, user?.id);

  const saved = Boolean(user && data?.some((i) => i.ref_id === refId));
  const hydrated =
    !authLoading && (!user || !isLoading || data !== undefined || error != null);

  const toggle = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (saved) {
        await removeFromWishlist(type, refId);
      } else {
        await addToWishlist({
          type,
          ref_id: refId,
          title,
          subtitle: subtitle ?? null,
          image_url: imageUrl ?? null,
        });
      }
      await revalidateWishlistQueries();
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !hydrated) {
    if (display === "icon") {
      return (
        <span
          className={cn(iconShellClass(false, "pointer-events-none opacity-70"), className)}
          aria-hidden
        >
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-2 text-sm text-muted-foreground ${className ?? ""}`}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span className="sr-only">Loading wishlist</span>
      </span>
    );
  }

  if (!user) {
    if (display === "icon") {
      return (
        <Link
          href={loginHref}
          onClick={(e) => e.stopPropagation()}
          className={cn(iconShellClass(false), className)}
          aria-label="Log in to save to wishlist"
        >
          <Heart className="h-4 w-4" aria-hidden />
        </Link>
      );
    }
    return (
      <Button variant="outline" size="sm" className={className} href={loginHref}>
        <Heart className="h-4 w-4" aria-hidden />
        Save
      </Button>
    );
  }

  if (display === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggle();
        }}
        disabled={loading}
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className={cn(iconShellClass(saved), className)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden />
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={saved ? "primary" : "outline"}
      size="sm"
      className={className}
      onClick={() => void toggle()}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} aria-hidden />
      )}
      <span className="ml-2">{saved ? "Saved" : "Save"}</span>
    </Button>
  );
}
