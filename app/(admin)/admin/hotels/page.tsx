import { AdminPublicPreviewLink, AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export default function AdminHotelsPage() {
  return (
    <AdminSectionPlaceholder
      title="Hotels"
      description="Manage hotel inventory for the site. Admin API routes are available; list and edit UIs can be wired here next."
    >
      <AdminPublicPreviewLink href="/hotels" label="View public hotels listing" />
    </AdminSectionPlaceholder>
  );
}
