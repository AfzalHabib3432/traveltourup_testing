/**
 * Creates (or updates) super_admin users (Supabase Auth + public.users + user_roles).
 *
 * Env (e.g. `.env.local`):
 *   SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD (min 8 chars) — required
 *   SUPER_ADMIN_FIRST_NAME, SUPER_ADMIN_LAST_NAME — optional (default Super / Admin)
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — required
 *   SUPER_ADMIN_SYNC_PASSWORD=1 — if user already exists, reset password (optional; applies to all accounts below)
 *
 * Also seeds fixed developer accounts (same role); edit `EXTRA_SUPER_ADMIN_SEEDS` to change them.
 *
 * Run after RBAC bootstrap:
 *   npm run db:seed && npm run db:seed-admin
 *
 * Or:
 *   npx dotenv -e .env.local -- tsx prisma/seed/seed-super-admin.ts
 */
import "./ensure-env";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../src/lib/prisma";
import { findAuthUserIdByEmail } from "./supabase-auth-helpers";

const SUPER_ADMIN_ROLE_ID = "super_admin";
const BAIL = "SEED_BAIL:";

/** Fixed developer accounts (same role as env super admin). */
const EXTRA_SUPER_ADMIN_SEEDS: ReadonlyArray<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}> = [
  {
    email: "developers.spelllink@gmail.com",
    password: "admin@123",
    firstName: "Developer",
    lastName: "Spelllink",
  },
  {
    email: "developers1.spelllink@gmail.com",
    password: "admin@123",
    firstName: "Developer",
    lastName: "Spelllink (1)",
  },
];

function bail(message: string): never {
  throw new Error(`${BAIL}${message}`);
}

async function ensureSuperAdminUser(
  supabase: SupabaseClient,
  params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    syncPassword: boolean;
  },
): Promise<void> {
  const { email, password, firstName, lastName, syncPassword } = params;

  if (password.length < 8) {
    bail(`Password for ${email} must be at least 8 characters`);
  }

  let authId = await findAuthUserIdByEmail(supabase, email);

  if (authId) {
    console.log(`Auth user already exists: ${email} → ${authId}`);
    if (syncPassword) {
      const { error: updErr } = await supabase.auth.admin.updateUserById(authId, {
        password,
        email_confirm: true,
      });
      if (updErr) {
        bail(`Failed to update auth user password (${email}): ${updErr.message}`);
      }
      console.log(`Password synced for ${email} (SUPER_ADMIN_SYNC_PASSWORD enabled).`);
    }
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });
    if (error || !created?.user?.id) {
      bail(`Failed to create auth user (${email}): ${error?.message ?? "unknown error"}`);
    }
    authId = created.user.id;
    console.log(`Created auth user: ${email} → ${authId}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: authId },
      create: {
        id: authId,
        first_name: firstName,
        last_name: lastName,
      },
      update: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    await tx.userRole.upsert({
      where: { user_id_role_id: { user_id: authId, role_id: SUPER_ADMIN_ROLE_ID } },
      create: {
        user_id: authId,
        role_id: SUPER_ADMIN_ROLE_ID,
        is_primary: true,
      },
      update: { is_primary: true },
    });

    await tx.userRole.updateMany({
      where: { user_id: authId, role_id: { not: SUPER_ADMIN_ROLE_ID } },
      data: { is_primary: false },
    });
  });

  console.log(`Super admin ready: ${email} (${authId}), role=${SUPER_ADMIN_ROLE_ID}`);
}

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME?.trim() || "Super";
  const lastName = process.env.SUPER_ADMIN_LAST_NAME?.trim() || "Admin";
  const syncPassword =
    process.env.SUPER_ADMIN_SYNC_PASSWORD === "1" || process.env.SUPER_ADMIN_SYNC_PASSWORD === "true";

  if (!email || !password) {
    bail("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env.local");
  }

  if (password.length < 8) {
    bail("SUPER_ADMIN_PASSWORD must be at least 8 characters");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    bail("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const role = await prisma.role.findUnique({ where: { id: SUPER_ADMIN_ROLE_ID } });
  if (!role) {
    bail(
      `Role "${SUPER_ADMIN_ROLE_ID}" not found. Run "npm run db:seed" first to bootstrap roles and permissions.`,
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await ensureSuperAdminUser(supabase, {
    email,
    password,
    firstName,
    lastName,
    syncPassword,
  });

  for (const extra of EXTRA_SUPER_ADMIN_SEEDS) {
    await ensureSuperAdminUser(supabase, {
      email: extra.email,
      password: extra.password,
      firstName: extra.firstName,
      lastName: extra.lastName,
      syncPassword,
    });
  }
}

async function run() {
  try {
    await main();
  } catch (e) {
    if (e instanceof Error && e.message.startsWith(BAIL)) {
      console.error(e.message.slice(BAIL.length));
    } else {
      console.error(e);
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

void run();
