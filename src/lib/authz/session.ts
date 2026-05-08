import "server-only";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthzContextForUserId } from "@/lib/authz/server";
import type { AuthzContext } from "@/lib/authz/types";

export type ServerAuthzResult = {
  /** Supabase `auth.users.id` (UUID) when the session is valid */
  userId: string | null;
  /** Effective RBAC context; `null` when unauthenticated or no public.users row */
  authz: AuthzContext | null;
};

/**
 * Resolves the current user + RBAC context for Server Components, Route Handlers,
 * and Server Actions.
 *
 * Auth strategy decision is made upfront by checking for a Bearer header (local,
 * no network cost). This avoids two Supabase `getUser` round-trips when a mobile
 * client sends a Bearer token alongside an empty cookie jar.
 *
 *   Bearer present  → validate token only  (1 Supabase call)
 *   Bearer absent   → validate cookie only (1 Supabase call)
 */
export async function getServerAuthz(): Promise<ServerAuthzResult> {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  const supabase = await createSupabaseServerClient();

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (user?.id) {
      const authz = await getAuthzContextForUserId(user.id);
      return { userId: user.id, authz };
    }
    return { userId: null, authz: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id) {
    const authz = await getAuthzContextForUserId(user.id);
    return { userId: user.id, authz };
  }

  return { userId: null, authz: null };
}
