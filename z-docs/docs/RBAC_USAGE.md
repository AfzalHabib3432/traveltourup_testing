# RBAC usage (dynamic roles & permissions)

Permissions and roles are **fully data-driven** in PostgreSQL. The app resolves **effective permissions** as:

`⋃` (permissions from all roles in `user_roles`) **∪** (rows in `user_permission_grants`)

Bootstrap catalog and default role matrices live in **`src/lib/authz/registry.ts`** and are applied with **`npm run db:seed`**. You can add roles, permissions, and grants at runtime (admin UI or SQL) without redeploying checks—only ensure your permission **slugs** match what you test for in code.

---

## Quick imports

```typescript
import {
  getServerAuthz,
  assertPermission,
  hasPermission,
  ensureUserProfileForAuthUser,
} from "@/lib/authz";
```

---

## 1) After Supabase Auth — ensure profile + default role

Call once after sign-up or on first session (e.g. Server Action or callback route):

```typescript
import { ensureUserProfileForAuthUser } from "@/lib/authz";

await ensureUserProfileForAuthUser({
  id: user.id,
  first_name: user.user_metadata?.first_name ?? "Guest",
  last_name: user.user_metadata?.last_name ?? "",
});
```

If the user has **no** `user_roles` rows yet, **`assignDefaultCustomerRole`** runs inside this helper.

---

## 2) Server Component — read authz

```typescript
import { getServerAuthz, hasPermission } from "@/lib/authz";

export default async function DashboardPage() {
  const { userId, authz } = await getServerAuthz();
  if (!userId || !authz) return <p>Please sign in</p>;

  const canAdminHotels = hasPermission(authz, "admin.hotels:read");

  return (
    <div>
      <p>Signed in as {authz.userId}</p>
      {canAdminHotels ? <AdminHotelsPanel /> : null}
    </div>
  );
}
```

---

## 3) Route Handler — enforce permission

```typescript
import { NextResponse } from "next/server";
import { getServerAuthz, assertPermission } from "@/lib/authz";

export async function POST() {
  const { authz } = await getServerAuthz();
  assertPermission(authz, "admin.hotels:write");
  // ...
  return NextResponse.json({ ok: true });
}
```

To reduce boilerplate, new JSON routes can wrap the handler with **`withPermissionRoute`** / **`withAuthedRoute`** from `src/lib/api/with-route-auth.ts` (same guards, centralized `handleApiError`).

---

## 4) Resource + action (generic strings)

Catalog rows use `resource` + `action`; permission `id` is `resource + ":" + action` (e.g. `admin.hotels:read`).

```typescript
import { hasResourceAction } from "@/lib/authz";

const ok = hasResourceAction(authz, "admin.hotels", "read");
```

---

## 5) Multi-role & direct grants

- Assign roles (e.g. admin tools) with **`assignRoleToUser`** / **`removeRoleFromUser`**.
- One-off permissions with **`grantUserPermission`** / **`revokeUserPermission`**.
- **Always** protect callers with `assertPermission(authz, "admin.rbac:manage")` (or your policy).

---

## 6) Example API — current user’s effective RBAC

`GET /api/v1/me/authz` returns roles and sorted permission slugs for the **logged-in** user (see `app/api/v1/me/authz/route.ts`). Use for debugging, admin consoles, or SPA feature flags. Do not expose on fully public, unauthenticated pages.

---

## 7) Tests

Pure checks are in **`src/lib/authz/guards.ts`** (no DB, no React):

```bash
npm run test
```

---

## Permission slugs in code

- **`PermissionId`** from the registry gives autocomplete for **known** catalog slugs.
- Type **`string`** is accepted everywhere so **DB-only** permissions work without updating TypeScript.

---

## Performance notes

- **`getAuthzContextForUserId`** uses React **`cache()`** so multiple calls in one RSC tree reuse one resolution.
- Permission resolution uses one **SQL** `UNION` query plus one small read for role rows.
