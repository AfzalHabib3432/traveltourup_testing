You are working in the repository `traveltourup_next` (Next.js App Router).

## Goal
Implement **locale** and **currency** in an industry-standard way for a travel/booking-style product, with strict rules for **admin vs customer** UX and a **single authentication surface** shared by clients and admins.

### Routing & SEO
- **Customer-facing app:** URL-based localization under `app/[locale]/...` (SEO: distinct URLs, correct `<html lang>`, metadata, `hreflang` / alternates where appropriate).
- **Currency:** Preference via cookie and/or light client context; SSR reads the same preference for rendered prices; currency typically **not** in the URL.
- **Admin:** **`/admin/**` stays outside `[locale]`**—no locale prefix on admin routes.

### Authentication (critical — unified login, no `/admin/login`)
- **One login for everyone:** Do **not** introduce a separate `/admin/login`. Keep **one shared login/signup** flow as today’s product intent: **the same routes and forms** for clients and admin-capable users.
- **Accessing admin without a session:** Middleware or route protection should redirect unauthenticated users to login with a **return URL**, e.g. `login?next=<encoded-next>` where `next` points back to `/admin` (example: `next=%2Fadmin` → `/admin`). Encode this **according to your final login URL shape** (see below).

### Admin redirect + login UI language (critical)
- When the user is sent to login **because they tried to access `/admin`** (detect via `next` query or equivalent safe mechanism):
  - Show the **normal login form** (same component/route as usual—not a second bespoke admin page).
  - **Do not** apply the user’s **currently selected browsing locale** to this login screen: render copy/labels in a **fixed neutral language** (e.g. **English only** for that gate), regardless of cookie/UI language elsewhere. This avoids operators seeing a translated admin gate while keeping one codebase.
- When logging in for **non-admin** flows, localized login under `[locale]` should behave as designed for customer SEO/UX.

Implement this with **one login route/component**, branching on **trusted `next` parsing** (allowlist destinations to prevent open redirects)—professional, minimal duplication.

### Technical expectations
- **Phase 1 — Plan first:** Document folder layout (`[locale]` vs `admin`), locale list, middleware (redirect `/`, `Accept-Language`, exclusions for `/admin`, `/api`, `_next`, assets), i18n approach (e.g. `next-intl`), how **`next` param** interacts with locale segments (e.g. `/en/login?next=/admin` vs your chosen canonical pattern), SEO for localized pages, currency storage, migration checklist, risks.
- **Phase 2 — Implement:** Execute the plan; update links/redirects; ensure post-login routing sends users to **`next`** when valid (admin dashboard vs customer area) without breaking Supabase/auth rules already in the repo.
- **Constraints:** Focused diffs; match existing code style; no unsolicited markdown docs unless essential; run lint/typecheck/tests available and fix regressions you introduce.
- **Done criteria:** Single login UX; admin protection redirects to login with `next`; admin-bound login view uses **neutral/fixed language** for strings; customer-facing localized routes unchanged in intent; `/admin` has no locale prefix; SEO/metadata sane for localized customer pages; short summary of manual tests (customer locale vs admin gate login).

Start with the **written plan**, then **implement** in the same session unless blocked—then state the blocker and smallest fix.

and every things should handled in professional , optimized and according to the best practices and nothing against the best practices 