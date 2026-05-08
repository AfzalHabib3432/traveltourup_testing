import { AdminPublicPreviewLink, AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export default function AdminCarsPage() {
  return (
    <AdminSectionPlaceholder
      title="Cars"
      description="Manage car rental inventory. Admin API routes exist for cars; build tables and forms here when ready."
    >
      <AdminPublicPreviewLink href="/cars" label="View public cars listing" />
    </AdminSectionPlaceholder>
  );
}
