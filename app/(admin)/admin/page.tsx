import Link from "next/link";
import PageHeader from "@/components/admin_ui/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/admin_ui/ui/card";

export default function AdminIndexPage() {
  return (
    <div className="max-w-6xl space-y-8">
      <PageHeader title="Admin" subtitle="Content and operations for TravelTourUp." showAddButton={false} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/hotels" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Hotels</CardTitle>
              <CardDescription>Hotel inventory and admin tools (API ready).</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/cars" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Cars</CardTitle>
              <CardDescription>Car rental listings and admin tools (API ready).</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/flights" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Flights</CardTitle>
              <CardDescription>Flight catalog admin—coming soon.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/bookings" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>Reservations and customer bookings—placeholder.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/blogs" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Blog</CardTitle>
              <CardDescription>Create, edit, and publish blog posts.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
