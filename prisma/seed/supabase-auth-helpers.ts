import type { SupabaseClient } from "@supabase/supabase-js";

const PER_PAGE = 100;
/** Safety cap: 50k users scanned (adjust if you truly need more). */
const MAX_PAGES = 500;

/**
 * Find auth user id by email across all pages (Supabase `listUsers` is paginated; first page only is a common bug).
 */
export async function findAuthUserIdByEmail(
  supabase: SupabaseClient,
  emailRaw: string,
): Promise<string | null> {
  const normalized = emailRaw.trim().toLowerCase();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) {
      throw new Error(`Supabase auth admin listUsers (page ${page}): ${error.message}`);
    }

    const users = data?.users ?? [];
    const found = users.find((u) => u.email?.trim().toLowerCase() === normalized);
    if (found) {
      return found.id;
    }

    if (users.length < PER_PAGE) {
      return null;
    }
  }

  throw new Error(
    `findAuthUserIdByEmail: scanned ${MAX_PAGES} pages (~${MAX_PAGES * PER_PAGE} users) without finding ${normalized}; increase MAX_PAGES if needed.`,
  );
}
