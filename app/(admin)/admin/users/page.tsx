import { listUsersForAdmin, listAllRoles } from "@/lib/services/user/user.service";
import { userAdminListQuerySchema } from "@/lib/validations/user.schema";
import { UserList } from "@/components/admin/users/user-list";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function AdminUsersListPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = userAdminListQuerySchema.parse({
    q: first(sp.q) || undefined,
    role_id: first(sp.role_id) || undefined,
    page: first(sp.page) || undefined,
    limit: first(sp.limit) || undefined,
    sort: first(sp.sort) || undefined,
    order: first(sp.order) || undefined,
  });

  const [{ items, total }, roles] = await Promise.all([
    listUsersForAdmin(query),
    listAllRoles(),
  ]);

  const rows = items.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    roles: u.roles.map((r) => r.name).join(", "),
    created: new Date(u.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));

  return <UserList rows={rows} total={total} query={query} roles={roles} />;
}
