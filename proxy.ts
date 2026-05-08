import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.CORS_ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

function skipIntlRouting(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/email-test")
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");

  if (request.method === "OPTIONS" && isApiRoute) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  if (isApiRoute) {
    return NextResponse.next();
  }

  const upstream = skipIntlRouting(pathname)
    ? NextResponse.next({ request })
    : intlMiddleware(request);

  return updateSupabaseSession(request, upstream);
}

export const config = {
  matcher: [
    // Exclude static media so next-intl does not rewrite `/videos/*.mp4` → `/[locale]/videos/...` (404).
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|m4v|ogg)$).*)",
  ],
};
