import PasswordResetEmail, { type PasswordResetEmailProps } from "@/emails/templates/PasswordResetEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generatePasswordResetHtml(props: PasswordResetEmailProps): Promise<string> {
  return renderEmailHtml(PasswordResetEmail, props);
}
