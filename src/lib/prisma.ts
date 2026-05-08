import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPgPool: Pool | undefined;
};

const enableQueryLog = process.env.PRISMA_QUERY_LOG === "true";

/**
 * Prisma 7 uses node-pg, which verifies TLS strictly. Supabase pooler/direct URLs often use a chain
 * Node does not trust → "self signed certificate in certificate chain".
 *
 * - `DATABASE_SSL_REJECT_UNAUTHORIZED=true` — force certificate verification (may need NODE_EXTRA_CA_CERTS).
 * - Otherwise, for Supabase hosts we relax verification and drop `sslmode` from the URL so the `ssl`
 *   object wins (otherwise libpq-style `sslmode=require` can still map to verify-full).
 *
 * @see https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 (SSL / node-pg)
 */
function isSupabasePostgresUrl(connectionString: string): boolean {
  return /\.supabase\.co\b|pooler\.supabase\.com/i.test(connectionString);
}

/** Remove sslmode from URI so Pool `{ ssl: { rejectUnauthorized } }` is not overridden by URL parsing. */
function connectionStringWithoutSslMode(connectionString: string): string {
  try {
    const u = new URL(connectionString);
    u.searchParams.delete("sslmode");
    const next = u.toString();
    return next.endsWith("?") ? next.slice(0, -1) : next;
  } catch {
    return connectionString;
  }
}

function pgPoolConfig(connectionString: string): PoolConfig {
  const v = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
  const forceVerify = v === "true" || v === "1";
  const forceNoVerify = v === "false" || v === "0";

  if (forceVerify) {
    return { connectionString };
  }
  if (forceNoVerify) {
    return {
      connectionString: connectionStringWithoutSslMode(connectionString),
      ssl: { rejectUnauthorized: false },
    };
  }
  if (isSupabasePostgresUrl(connectionString)) {
    return {
      connectionString: connectionStringWithoutSslMode(connectionString),
      ssl: { rejectUnauthorized: false },
    };
  }
  return { connectionString };
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  let pool = globalForPrisma.prismaPgPool;
  if (!pool) {
    pool = new Pool(pgPoolConfig(connectionString));
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaPgPool = pool;
    }
  }
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? enableQueryLog
          ? ["query", "error", "warn"]
          : ["error", "warn"]
        : ["error"],
  });
}


export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
