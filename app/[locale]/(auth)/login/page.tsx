import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Login from "@/views/Login";
import { metadataForLocalizedRoute } from "@/config/metadata.config";
import { ADMIN_GATE_LOCALE } from "@/i18n/routing";
import { isAdminReturnPath, safeInternalPath } from "@/lib/auth/redirect";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const adminGate = isAdminReturnPath(safeInternalPath(sp.next));
  if (adminGate || locale === ADMIN_GATE_LOCALE) {
    return metadataForLocalizedRoute(ADMIN_GATE_LOCALE, "/login");
  }
  return metadataForLocalizedRoute(locale, "/login");
}

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
};

export default async function Page(props: PageProps) {
  const [params, sp] = await Promise.all([props.params, props.searchParams]);
  const { locale } = params;
  const next = safeInternalPath(sp.next);
  const adminGate = isAdminReturnPath(next);

  if (adminGate && locale !== ADMIN_GATE_LOCALE) {
    const q = new URLSearchParams();
    if (sp.next) q.set("next", sp.next);
    if (sp.error) q.set("error", sp.error);
    if (sp.reset) q.set("reset", sp.reset);
    const qs = q.toString();
    redirect(`/${ADMIN_GATE_LOCALE}/login${qs ? `?${qs}` : ""}`);
  }

  const tAuth = await getTranslations({
    locale: adminGate ? ADMIN_GATE_LOCALE : locale,
    namespace: "Auth",
  });

  const queryErrorResolved = sp.error === "auth" ? tAuth("signInFailed") : null;
  const resetSuccess = sp.reset === "success" ? tAuth("passwordUpdated") : null;

  return (
    <Login
      defaultNext={next}
      queryError={queryErrorResolved}
      resetSuccess={resetSuccess}
      adminGate={adminGate}
    />
  );
}
