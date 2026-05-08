"use client";

import { useActionState, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { AuthSocialRow } from "@/components/auth/AuthSocialRow";
import { authInputClass, authPrimaryButtonClass } from "@/components/auth/authFormStyles";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";

type Props = {
  defaultNext?: string;
};

const initialState: AuthActionState = null;

export default function SignUpCom({ defaultNext = "/" }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div className="w-full">
      <header className="mb-4 text-center md:mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Register Now!</h1>
        <p className="mt-1 text-sm text-muted-foreground">Register now to start your journey!</p>
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
        <input type="hidden" name="next" value={defaultNext} readOnly />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:gap-4">
          <Input
            label="First name"
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            required
            disabled={pending}
            className={authInputClass}
          />
          <Input
            label="Last name"
            id="last_name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            required
            disabled={pending}
            className={authInputClass}
          />
        </div>

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

        <div>
          <Input
            label="Password"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            required
            disabled={pending}
            className={authInputClass}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />
          <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters with 1 uppercase letter and 1 number</p>
        </div>

        <div className="flex items-start gap-2 pt-0.5">
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
            required
          />
          <label htmlFor="accept-terms" className="text-sm leading-snug text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={!acceptTerms || pending}
          className={`${authPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {pending ? "Creating account…" : "Sign Up"}
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground md:mt-5">
        Already have an account?{" "}
        <Link
          href={defaultNext === "/" ? "/login" : `/login?next=${encodeURIComponent(defaultNext)}`}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Sign In
        </Link>
      </p>

      <AuthSocialRow next={defaultNext} />

      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground md:mt-5">
        By signing up, you confirm that you&apos;ve read our{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
