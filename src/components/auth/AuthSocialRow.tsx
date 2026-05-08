"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AUTH_OAUTH_PROVIDERS,
  type AuthOAuthProvider,
  formatOAuthSetupError,
  startOAuthRedirect,
} from "@/lib/auth/oauth-client";

type Props = {
  /** Safe internal path after OAuth (e.g. from `?next=`). */
  next?: string;
  /** Fixed English copy for admin gate login. */
  adminGate?: boolean;
};

const providerLabels: Record<AuthOAuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
  x: "X",
};

export function AuthSocialRow({ next = "/", adminGate = false }: Props) {
  const t = useTranslations("Auth");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<AuthOAuthProvider | null>(null);

  const orContinueWith = adminGate ? "Or continue with" : t("orContinueWith");
  const redirectingLabel = adminGate ? "Redirecting…" : t("oauthRedirecting");

  const onOAuth = useCallback(
    async (provider: AuthOAuthProvider) => {
      setError(null);
      setPending(provider);
      try {
        const { error: oauthError } = await startOAuthRedirect(provider, next);
        if (oauthError) {
          setError(formatOAuthSetupError(oauthError.message));
          return;
        }
        /* Successful start → browser navigates to provider; pending state may not clear */
      } catch (e) {
        setError(formatOAuthSetupError(e instanceof Error ? e.message : "Sign-in failed"));
      } finally {
        setPending(null);
      }
    },
    [next],
  );

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="relative my-4 md:my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <span className="bg-card/95 px-4 backdrop-blur-sm dark:bg-card/90 lg:bg-background">
            {orContinueWith}
          </span>
        </div>
      </div>

      <div className="flex flex-row gap-3 sm:grid sm:grid-cols-3">
        {AUTH_OAUTH_PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="button"
            disabled={pending !== null}
            onClick={() => void onOAuth(provider)}
            className="flex min-w-0 flex-1 items-center justify-center gap-2.5 rounded-xl border border-transparent bg-muted px-3 py-3.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-4"
            aria-label={`Continue with ${providerLabels[provider]}`}
          >
            <ProviderIcon provider={provider} />
            <span className="hidden sm:inline">
              {pending === provider ? redirectingLabel : providerLabels[provider]}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function ProviderIcon({ provider }: { provider: AuthOAuthProvider }) {
  if (provider === "google") {
    return (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }
  if (provider === "facebook") {
    return (
      <svg className="h-5 w-5 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
