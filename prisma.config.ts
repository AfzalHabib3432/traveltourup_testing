import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const root = process.cwd();
if (existsSync(resolve(root, ".env"))) {
  loadEnv({ path: resolve(root, ".env") });
}
if (existsSync(resolve(root, ".env.local"))) {
  loadEnv({ path: resolve(root, ".env.local"), override: true });
}

/** Supabase/Vercel: use direct/session connection for migrations (same role as former `directUrl`). */
function migrateUrl(): string {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Set DIRECT_URL (recommended for Supabase) or DATABASE_URL so Prisma Migrate can connect.",
    );
  }
  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    url: migrateUrl(),
  },
});
