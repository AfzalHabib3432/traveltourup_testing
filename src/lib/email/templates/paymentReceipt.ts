import PaymentReceiptEmail, { type PaymentReceiptEmailProps } from "@/emails/templates/PaymentReceiptEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generatePaymentReceiptHtml(props: PaymentReceiptEmailProps): Promise<string> {
  return renderEmailHtml(PaymentReceiptEmail, props);
}
