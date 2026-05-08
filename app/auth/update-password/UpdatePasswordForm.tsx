"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { defaultLocale } from "@/i18n/routing";
import { Input } from "@/components/ui/Input";
import { authInputClass, authPrimaryButtonClass } from "@/components/auth/authFormStyles";

export function UpdatePasswordForm() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
      await supabase.auth.signOut();
      window.location.href = `/${defaultLocale}/login?reset=success`;
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Password updated. Redirecting to sign in…
      </p>
    );
  }

  if (!ready) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Validating reset link…</p>
        <p className="text-xs text-muted-foreground">
          If this takes too long, open the link from your email again or{" "}
          <Link href={`/${defaultLocale}/forgot-password`} className="text-primary underline">
            request a new reset
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="w-full max-w-md space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter a strong password for your account.</p>
      </header>
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Input
        label="New password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
        minLength={8}
        disabled={pending}
        className={authInputClass}
      />
      <button type="submit" disabled={pending} className={`${authPrimaryButtonClass} w-full disabled:opacity-60`}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
