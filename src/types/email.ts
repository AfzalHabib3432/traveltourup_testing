/**
 * Canonical email classification for the generic API (`type` + optional `subType`).
 * Legacy string literals (`welcome`, `otp_verification`, …) remain valid in Zod for backward compatibility.
 */

export enum EmailType {
  booking = "booking",
  register = "register",
  paymentConfirmation = "paymentConfirmation",
  cancel = "cancel",
  refund = "refund",
  contactUs = "contactUs",
  forgotPassword = "forgotPassword",
}

/** Sub-type when `EmailType` is `booking` (avoids clashing with `BookingType` in `./booking`). */
export enum EmailBookingSubType {
  flight = "flight",
  hotel = "hotel",
  car = "car",
}
