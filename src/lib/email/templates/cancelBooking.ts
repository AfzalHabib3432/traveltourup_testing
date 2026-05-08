import CancelBookingEmail, { type CancelBookingEmailProps } from "@/emails/templates/CancelBookingEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generateCancelBookingHtml(props: CancelBookingEmailProps): Promise<string> {
  return renderEmailHtml(CancelBookingEmail, props);
}
