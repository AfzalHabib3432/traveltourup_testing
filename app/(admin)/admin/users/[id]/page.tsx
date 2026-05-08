import { notFound } from "next/navigation";
import { NotFoundError } from "@/lib/api/errors";
import { getUserForAdmin, listAllRoles } from "@/lib/services/user/user.service";
import { UserForm } from "@/components/admin/users/user-form";
import { UserRoleManager } from "@/components/admin/users/user-role-manager";
import PageHeader from "@/components/admin_ui/shared/page-header";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserEditPage({ params }: PageProps) {
  const { id } = await params;

  let user;
  try {
    user = await getUserForAdmin(id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  const roles = await listAllRoles();

  return (
    <>
      <PageHeader
        title="Edit user"
        subtitle={`${user.firstName} ${user.lastName} — ${user.email}`}
        showAddButton={false}
      />
      <UserForm mode="edit" roles={roles} initial={user} />
      <UserRoleManager userId={user.id} currentRoles={user.roles} allRoles={roles} />
    </>
  );
}
