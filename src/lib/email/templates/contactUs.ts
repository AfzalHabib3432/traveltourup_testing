import ContactUsEmail, { type ContactUsEmailProps } from "@/emails/templates/ContactUsEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generateContactUsHtml(props: ContactUsEmailProps): Promise<string> {
  return renderEmailHtml(ContactUsEmail, props);
}
