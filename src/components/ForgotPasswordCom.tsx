"use client";

import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { authInputClass, authPrimaryButtonClass } from "@/components/auth/authFormStyles";
import { requestPasswordResetAction, type AuthActionState } from "@/lib/auth/actions";

type Props = {
  defaultNext?: string;
};

const initialState: AuthActionState = null;

export default function ForgotPasswordCom({ defaultNext = "/" }: Props) {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <div className="w-full">
      <header className="mb-4 text-center md:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a link to choose a new password.</p>
      </header>

      {state?.error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      {state?.success ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm text-foreground"
        >
          {state.success}
        </p>
      ) : null}

      <form action={formAction} className="space-y-3 md:space-y-4">
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={pending}
          className={authInputClass}
        />
        <button type="submit" disabled={pending} className={`${authPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}>
          {pending ? "Sending…" : "Send reset link"}
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground md:mt-5">
        <Link
          href={defaultNext === "/" ? "/login" : `/login?next=${encodeURIComponent(defaultNext)}`}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
