import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfileForAuthUser } from "@/lib/authz/profile";
import { safeInternalPath } from "@/lib/auth/redirect";
import { defaultLocale } from "@/i18n/routing";
import { firstNameFromUserMetadata, lastNameFromUserMetadata } from "@/lib/auth/user-metadata";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next") ?? undefined);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await ensureUserProfileForAuthUser({
          id: user.id,
          first_name: firstNameFromUserMetadata(user.user_metadata as Record<string, unknown> | undefined),
          last_name: lastNameFromUserMetadata(user.user_metadata as Record<string, unknown> | undefined),
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/${defaultLocale}/login?error=auth`);
}
