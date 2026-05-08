import type { Metadata } from "next";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export const metadata: Metadata = {
  title: "New password",
  description: "Set a new password after receiving a reset link",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
