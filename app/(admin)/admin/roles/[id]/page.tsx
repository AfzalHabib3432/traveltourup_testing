import { notFound } from "next/navigation";
import { NotFoundError } from "@/lib/api/errors";
import { getRole, listPermissions } from "@/lib/services/role/role.service";
import { RoleForm } from "@/components/admin/roles/role-form";
import { RolePermissionManager } from "@/components/admin/roles/role-permission-manager";
import PageHeader from "@/components/admin_ui/shared/page-header";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminRoleEditPage({ params }: PageProps) {
  const { id } = await params;

  let role;
  try {
    role = await getRole(id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  const permissionGroups = await listPermissions();

  return (
    <>
      <PageHeader
        title="Edit role"
        subtitle={`${role.name}${role.isSystem ? " (system role)" : ""}`}
        showAddButton={false}
      />
      <RoleForm mode="edit" initial={role} />
      <RolePermissionManager
        roleId={role.id}
        roleName={role.name}
        isSystem={role.isSystem}
        currentPermissions={role.permissions}
        permissionGroups={permissionGroups}
      />
    </>
  );
}
