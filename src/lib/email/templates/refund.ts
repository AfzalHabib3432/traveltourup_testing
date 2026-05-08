import RefundEmail, { type RefundEmailProps } from "@/emails/templates/RefundEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generateRefundHtml(props: RefundEmailProps): Promise<string> {
  return renderEmailHtml(RefundEmail, props);
}
