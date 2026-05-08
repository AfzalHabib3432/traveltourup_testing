"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/auth/redirect";

/** Providers wired in Auth UI — must match Dashboard → Authentication → Providers. */
export const AUTH_OAUTH_PROVIDERS = ["google", "facebook", "x"] as const;
export type AuthOAuthProvider = (typeof AUTH_OAUTH_PROVIDERS)[number];

/**
 * Starts browser OAuth (PKCE). On success the user is redirected away; on validation errors `{ error }` is set.
 */
export async function startOAuthRedirect(provider: AuthOAuthProvider, next: string) {
  const supabase = createSupabaseBrowserClient();
  const path = safeInternalPath(next);
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(path)}`;

  return supabase.auth.signInWithOAuth({
    provider: provider as Parameters<typeof supabase.auth.signInWithOAuth>[0]["provider"],
    options: {
      redirectTo,
      ...(provider === "google"
        ? { queryParams: { access_type: "offline", prompt: "consent" } }
        : {}),
    },
  });
}

export function formatOAuthSetupError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("provider is not enabled") ||
    lower.includes("validation_failed") ||
    lower.includes("unsupported provider")
  ) {
    return "This sign-in option is not active in Supabase yet. In the dashboard go to Authentication → Providers, turn on the provider, paste a valid Client ID and Secret (no spaces in Google’s Client IDs field), then click Save. See docs/SOCIAL_AUTH_SETUP.md.";
  }
  return message;
}
