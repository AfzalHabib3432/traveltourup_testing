/**
 * Low-level email transport: Resend only (no template rendering).
 *
 * Refactored out of `src/lib/email.ts` so content generation (template mapper + React Email)
 * stays separate from delivery. This keeps one place for Resend config and optional mock mode.
 *
 * `to` is always the real recipient inbox (test page, API, or Supabase hook).
 */

import "server-only";

import { Resend } from "resend";

let resendSingleton: Resend | null = null;

function getResend(): Resend {
  if (!resendSingleton) {
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendSingleton = new Resend(key);
  }
  return resendSingleton;
}

/**
 * Resend only accepts `from` addresses on domains you verify (or their docs example `onboarding@resend.dev`).
 * If EMAIL_FROM is a public inbox (e.g. @gmail.com), we send from Resend's sandbox address and set
 * `reply_to` to that Gmail so recipients can still reply to you.
 */
// function resolveResendFromAndReplyTo(): { from: string; reply_to?: string[] } {
//   const configured = process.env.EMAIL_FROM?.trim();
//   if (!configured) {
//     throw new Error("EMAIL_FROM is not set (e.g. no-reply@yourdomain.com or Gmail for reply-to only)");
//   }

//   const isPublicGmail =
//     /@gmail\.com$/i.test(configured) || /@googlemail\.com$/i.test(configured);

//   if (isPublicGmail) {
//     const display = process.env.EMAIL_FROM_DISPLAY_NAME?.trim() || "TravelTourUp";
//     return {
//       from: `${display} <onboarding@resend.dev>`,
//       reply_to: [configured],
//     };
//   }

//   return { from: configured };
// }
function resolveResendFromAndReplyTo(): { from: string; reply_to?: string[] } {
  const display = "TravelTourUp Test";
  const replyEmail = "developers1.spelllink@gmail.com"; // <-- put your email here

  return {
    from: `${display} <onboarding@resend.dev>`,
    reply_to: [replyEmail],
  };
}
function isMockMode(): boolean {
  const v = process.env.EMAIL_MOCK?.trim().toLowerCase();
  return v === "true" || v === "1";
}

function mergeReplyToAddresses(
  extra: string | undefined,
  fromEnv: string[] | undefined,
): string[] | undefined {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (addr: string) => {
    const t = addr.trim();
    if (!t) return;
    const k = t.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(t);
  };
  if (extra) push(extra);
  if (fromEnv) for (const a of fromEnv) push(a);
  return out.length > 0 ? out : undefined;
}

export type SendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  /** Merged with env-based reply_to (e.g. Gmail sandbox). First address wins for typical clients. */
  replyTo?: string;
};

/**
 * Deliver a rendered email. When `EMAIL_MOCK` is unset/false, sends via Resend (real delivery).
 * Set `EMAIL_MOCK=true` only in CI or when you must avoid calling Resend (no API key).
 */
export async function sendEmail(payload: SendEmailPayload): Promise<{ id: string }> {
  const { to, subject, html, replyTo } = payload;

  if (isMockMode()) {
    console.info(
      `[email] EMAIL_MOCK: skipping Resend send to=${to} subject=${subject} htmlBytes=${html.length}`,
    );
    return { id: `mock_${Date.now()}` };
  }

  try {
    const { from, reply_to } = resolveResendFromAndReplyTo();
    const mergedReplyTo = mergeReplyToAddresses(replyTo, reply_to);
    // const res = await getResend().emails.send({
    //   from,
    //   ...(mergedReplyTo ? { reply_to: mergedReplyTo } : {}),
    //   to: [to],
    //   subject,
    //   html,
    // });
   const res = await getResend().emails.send({
      from: "TravelTourUp Test <onboarding@resend.dev>",
      to: ["developers1.spelllink@gmail.com"],
      subject: "Test Email",
      html: "<p>This is a test email</p>",
    });
    if (res.error) {
      console.error("[email] Resend error FULL:", JSON.stringify(res.error, null, 2));      throw new Error(res.error.message ?? "Resend send failed");
    }

    const id = res.data?.id;
    if (!id) {
      console.error("[email] Resend returned no id", res);
      throw new Error("Resend send failed: missing message id");
    }

    return { id };
  } catch (err) {
    console.error("[email] sendEmail (transport) failed:", err);
    throw err;
  }
}
