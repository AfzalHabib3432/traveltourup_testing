import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Payment from "@/views/Payment";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import { localizedCustomerPath } from "@/i18n/locale-path";
import type { AppLocale } from "@/i18n/routing";
import { safeInternalPath } from "@/lib/auth/redirect";
import { getServerAuthz } from "@/lib/authz/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/flights/payment", {
    robots: { index: false, follow: true },
  });
}

function buildFlightsPaymentPath(sp: Record<string, string | string[] | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) q.append(key, v);
    } else {
      q.set(key, value);
    }
  }
  const qs = q.toString();
  return qs ? `/flights/payment?${qs}` : "/flights/payment";
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const { userId } = await getServerAuthz();
  const sp = await searchParams;
  const built = buildFlightsPaymentPath(sp);
  const loc = locale as AppLocale;
  const returnPath = safeInternalPath(
    localizedCustomerPath(loc, built),
    localizedCustomerPath(loc, "/flights/payment"),
  );

  if (!userId) {
    redirect(`/${locale}/login?next=${encodeURIComponent(returnPath)}`);
  }

  return <Payment />;
}
