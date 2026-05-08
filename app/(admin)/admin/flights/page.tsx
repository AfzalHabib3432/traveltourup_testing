import { AdminPublicPreviewLink, AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export default function AdminFlightsPage() {
  return (
    <AdminSectionPlaceholder
      title="Flights"
      description="Flight offers and admin tools are not wired yet. This area is reserved for future catalog and booking integration."
    >
      <AdminPublicPreviewLink href="/flights" label="View public flights page" />
    </AdminSectionPlaceholder>
  );
}
