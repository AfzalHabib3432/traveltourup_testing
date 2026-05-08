import { listAllRoles } from "@/lib/services/user/user.service";
import { UserForm } from "@/components/admin/users/user-form";
import PageHeader from "@/components/admin_ui/shared/page-header";

export const dynamic = "force-dynamic";

export default async function AdminUserNewPage() {
  const roles = await listAllRoles();

  return (
    <>
      <PageHeader title="New user" subtitle="Create a new user account." showAddButton={false} />
      <UserForm mode="create" roles={roles} />
    </>
  );
}
