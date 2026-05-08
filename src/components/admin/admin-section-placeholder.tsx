import Link from "next/link";
import PageHeader from "@/components/admin_ui/shared/page-header";
import { ReactNode } from "react";
import { ADMIN_GATE_LOCALE } from "@/i18n/routing";

type AdminSectionPlaceholderProps = {
  title: string;
  description: string;
  showAddButton?: boolean;
  children?: ReactNode;
};

export function AdminSectionPlaceholder({
  title,
  description,
  showAddButton = false,
  children,
}: AdminSectionPlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} showAddButton={showAddButton} />
      {children}
    </div>
  );
}

type PublicPreviewLinkProps = {
  href: string;
  label: string;
};

export function AdminPublicPreviewLink({ href, label }: PublicPreviewLinkProps) {
  const path = href.startsWith("/") ? href : `/${href}`;
  const localized = `/${ADMIN_GATE_LOCALE}${path}`;
  return (
    <p className="text-sm text-muted-foreground">
      <Link href={localized} className="font-medium text-primary underline-offset-4 hover:underline">
        {label}
      </Link>
    </p>
  );
}
