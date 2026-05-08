import OTPVerificationEmail, { type OTPVerificationEmailProps } from "@/emails/templates/OTPVerificationEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generateOtpVerificationHtml(props: OTPVerificationEmailProps): Promise<string> {
  return renderEmailHtml(OTPVerificationEmail, props);
}
