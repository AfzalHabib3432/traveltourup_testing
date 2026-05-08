import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { localizedCustomerPath } from "@/i18n/locale-path";
import type { AppLocale } from "@/i18n/routing";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import { getServerAuthz } from "@/lib/authz/session";
import { BookingDetailView } from "@/components/bookings/BookingDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  return metadataForLocalizedRoute(locale, "/profile/bookings/detail", {
    robots: { index: false, follow: true },
    canonicalPath: `/profile/bookings/${id}`,
  });
}

export default async function ProfileBookingDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { userId } = await getServerAuthz();
  const { id, locale } = await params;
  if (!userId) {
    const nextTarget = localizedCustomerPath(locale as AppLocale, `/profile/bookings/${id}`);
    redirect(`/${locale}/login?next=${encodeURIComponent(nextTarget)}`);
  }

  return (
    <main className="bg-muted/40 py-8 md:py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <BookingDetailView bookingId={id} />
        </div>
      </div>
    </main>
  );
}
