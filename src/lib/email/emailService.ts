/**
 * Composes template selection + HTML generation for any validated {@link EmailSendRequest}.
 * Legacy `props` branches delegate to the same canonical templates as generic `data` branches.
 */

import "server-only";

import { EmailBookingSubType, EmailType } from "@/types/email";
import type { EmailSendRequest } from "@/lib/validations/email.schema";
import { resolveTemplate } from "@/lib/email/templateMapper";
import { generateOtpVerificationHtml } from "@/lib/email/templates/otpVerification";

export function inferBookingSubTypeFromProductLabel(productLabel?: string): EmailBookingSubType {
  const p = (productLabel ?? "").toLowerCase();
  if (p.includes("hotel")) return EmailBookingSubType.hotel;
  if (p.includes("car")) return EmailBookingSubType.car;
  return EmailBookingSubType.flight;
}

/**
 * Generic API: map `EmailType` + optional `EmailBookingSubType` + payload to subject + HTML.
 */
export async function generateEmailContent(
  type: EmailType,
  subType: EmailBookingSubType | undefined,
  data: unknown,
  subjectOverride?: string,
): Promise<{ subject: string; html: string }> {
  const built = await resolveTemplate(type, subType, data);
  return { subject: subjectOverride ?? built.subject, html: built.html };
}

/**
 * Renders any legacy or generic request shape to `{ subject, html }`.
 */
export async function renderEmailSendRequest(request: EmailSendRequest): Promise<{ subject: string; html: string }> {
  switch (request.type) {
    case "welcome":
      return generateEmailContent(EmailType.register, undefined, request.props, request.subject);
    case "otp_verification": {
      const html = await generateOtpVerificationHtml(request.props);
      const subject = request.subject ?? `${request.props.purpose} — TravelTourUp`;
      return { subject, html };
    }
    case "password_reset":
      return generateEmailContent(EmailType.forgotPassword, undefined, request.props, request.subject);
    case "booking_confirmation": {
      const sub = inferBookingSubTypeFromProductLabel(request.props.productLabel);
      return generateEmailContent(EmailType.booking, sub, request.props, request.subject);
    }
    case "payment_receipt":
      return generateEmailContent(EmailType.paymentConfirmation, undefined, request.props, request.subject);
    case EmailType.register:
      return generateEmailContent(EmailType.register, undefined, request.data, request.subject);
    case EmailType.booking:
      return generateEmailContent(EmailType.booking, request.subType, request.data, request.subject);
    case EmailType.forgotPassword:
      return generateEmailContent(EmailType.forgotPassword, undefined, request.data, request.subject);
    case EmailType.paymentConfirmation:
      return generateEmailContent(EmailType.paymentConfirmation, undefined, request.data, request.subject);
    case EmailType.cancel:
      return generateEmailContent(EmailType.cancel, undefined, request.data, request.subject);
    case EmailType.refund:
      return generateEmailContent(EmailType.refund, undefined, request.data, request.subject);
    case EmailType.contactUs:
      return generateEmailContent(EmailType.contactUs, undefined, request.data, request.subject);
    default: {
      const _exhaustive: never = request;
      throw new Error(`Unhandled email request: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
