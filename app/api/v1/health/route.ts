import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDuffelConfigured } from "@/lib/duffel/config";

export const dynamic = "force-dynamic";

/**
 * Readiness probe: DB + env wiring (no secrets in response).
 */
export async function GET() {
  let database: "ok" | "error" = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  return NextResponse.json({
    ok: database === "ok",
    database,
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    duffel: isDuffelConfigured(),
  });
}
