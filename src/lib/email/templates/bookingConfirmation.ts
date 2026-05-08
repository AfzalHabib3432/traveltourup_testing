import BookingConfirmationEmail, {
  type BookingConfirmationEmailProps,
} from "@/emails/templates/BookingConfirmationEmail";
import { renderEmailHtml } from "./renderEmailHtml";

export async function generateBookingConfirmationHtml(props: BookingConfirmationEmailProps): Promise<string> {
  return renderEmailHtml(BookingConfirmationEmail, props);
}
