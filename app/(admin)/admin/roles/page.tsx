import { listRoles } from "@/lib/services/role/role.service";
import { RoleList } from "@/components/admin/roles/role-list";

export const dynamic = "force-dynamic";

export default async function AdminRolesListPage() {
  const roles = await listRoles();

  const rows = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    isSystem: r.isSystem,
    permissionCount: r.permissionCount,
    userCount: r.userCount,
    created: new Date(r.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));

  return <RoleList rows={rows} total={rows.length} />;
}
