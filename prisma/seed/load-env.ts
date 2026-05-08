import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

/**
 * Load `.env` then `.env.local` (override) when present.
 * Ensures `prisma db seed` / `tsx prisma/seed/index.ts` work even when not wrapped by `dotenv-cli`
 * (e.g. `npx prisma db seed` in some IDEs, or CI using a committed `.env`).
 */
export function loadSeedEnv(): void {
  const root = process.cwd();
  const env = resolve(root, ".env");
  const local = resolve(root, ".env.local");

  if (existsSync(env)) {
    config({ path: env });
  }
  if (existsSync(local)) {
    config({ path: local, override: true });
  }
}
