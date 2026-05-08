import { EmailBookingSubType, EmailType } from "@/types/email";

/** Minimal valid `data` payloads for manual testing (recipient comes from the form `to` field). */
export function sampleDataForEmail(type: EmailType, subType: EmailBookingSubType | undefined, recipientEmail: string): unknown {
  switch (type) {
    case EmailType.register:
      return {
        firstName: "Test",
        lastName: "Traveler",
        appUrl: "https://traveltourup.com",
      };
    case EmailType.booking:
      return {
        bookingReference: "TTU-TEST-001",
        guestName: "Test Traveler",
        destination: subType === EmailBookingSubType.hotel ? "Kyoto" : subType === EmailBookingSubType.car ? "LAX" : "Tokyo",
        dates: "May 1–7, 2026",
        total: "USD 1,200.00",
        manageUrl: "https://traveltourup.com/bookings",
      };
    case EmailType.paymentConfirmation:
      return {
        receiptId: "RCPT-TEST-001",
        guestName: "Test Traveler",
        amount: "USD 499.00",
        paidAt: new Date().toISOString(),
        itemSummary: "Sample itinerary — TravelTourUp test",
        receiptUrl: "https://traveltourup.com/receipts/RCPT-TEST-001",
        paymentMethodLabel: "Card",
      };
    case EmailType.cancel:
      return {
        bookingReference: "TTU-TEST-001",
        guestName: "Test Traveler",
        summary: "Sample cancellation — test email",
        manageUrl: "https://traveltourup.com/bookings",
      };
    case EmailType.refund:
      return {
        refundId: "REF-TEST-001",
        guestName: "Test Traveler",
        amount: "USD 499.00",
        summary: "Sample refund — test email",
        receiptUrl: "https://traveltourup.com/refunds/REF-TEST-001",
      };
    case EmailType.contactUs:
      return {
        name: "Test Traveler",
        replyEmail: recipientEmail,
        message: "This is a test message from the TravelTourUp email test page.",
        submittedAt: new Date().toLocaleString(),
      };
    case EmailType.forgotPassword:
      return {
        resetUrl: "https://traveltourup.com/auth/reset?token=test-token",
        expiresInMinutes: 60,
        firstName: "Test",
      };
  }
}
