import type { User } from "@supabase/supabase-js";
import { firstNameFromUserMetadata, lastNameFromUserMetadata } from "@/lib/auth/user-metadata";

export type MeProfile = {
  first_name: string;
  last_name: string;
  avatar_path: string | null;
  updated_at: string;
};

export function oauthPictureFromMetadata(meta: Record<string, unknown> | undefined): string | null {
  const a = meta?.avatar_url;
  if (typeof a === "string" && a.length > 0) return a;
  const p = meta?.picture;
  if (typeof p === "string" && p.length > 0) return p;
  return null;
}

export function displayNameForUserMenu(user: User | null, me: MeProfile | null): string {
  if (!user) return "Account";
  const fromDb = me ? `${me.first_name} ${me.last_name}`.trim() : "";
  if (fromDb) return fromDb;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const full = meta?.full_name;
  if (typeof full === "string" && full.trim()) return full.trim();
  const name = meta?.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  const fn = firstNameFromUserMetadata(meta);
  const ln = lastNameFromUserMetadata(meta);
  const combo = `${fn} ${ln}`.trim();
  if (combo && combo !== "Guest") return combo;
  if (user.email) return user.email.split("@")[0] ?? user.email;
  return "Account";
}

export function initialsFromDisplayName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}
