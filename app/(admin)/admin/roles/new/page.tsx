import { RoleForm } from "@/components/admin/roles/role-form";
import PageHeader from "@/components/admin_ui/shared/page-header";

export const dynamic = "force-dynamic";

export default function AdminRoleNewPage() {
  return (
    <>
      <PageHeader title="New role" subtitle="Create a new role to assign permissions." showAddButton={false} />
      <RoleForm mode="create" />
    </>
  );
}
