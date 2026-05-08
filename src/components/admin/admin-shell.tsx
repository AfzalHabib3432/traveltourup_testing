"use client";

import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin_ui/layout/admin-layout";
import { Toaster } from "@/components/admin_ui/ui/toaster";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
      <Toaster />
    </>
  );
}
