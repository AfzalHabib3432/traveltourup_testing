import WelcomeEmail, { type WelcomeEmailProps } from "@/emails/templates/WelcomeEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generateWelcomeHtml(props: WelcomeEmailProps): Promise<string> {
  return renderEmailHtml(WelcomeEmail, props);
}
