import { redirect } from "next/navigation";
import { getServerAuthz, hasAnyRole, ADMIN_PANEL_ROLE_IDS } from "@/lib/authz";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_GATE_LOCALE, defaultLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { userId, authz } = await getServerAuthz();
  if (!userId) {
    redirect(`/${ADMIN_GATE_LOCALE}/login?next=/admin`);
  }
  if (!authz || !hasAnyRole(authz, ADMIN_PANEL_ROLE_IDS)) {
    redirect(`/${defaultLocale}`);
  }

  return (
    <AdminShell>
      <div className="space-y-4">
        {children}
      </div>
    </AdminShell>
  );
}
