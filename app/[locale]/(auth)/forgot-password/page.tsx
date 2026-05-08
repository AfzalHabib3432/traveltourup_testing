import type { Metadata } from "next";
import ForgotPassword from "@/views/ForgotPassword";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import { safeInternalPath } from "@/lib/auth/redirect";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalizedRoute(locale, "/forgot-password", {
    robots: { index: false, follow: true },
  });
}

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function Page(props: PageProps) {
  const sp = await props.searchParams;
  const next = safeInternalPath(sp.next);
  return <ForgotPassword defaultNext={next} />;
}
