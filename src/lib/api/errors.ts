export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(public readonly issues: unknown) {
    super(400, "Validation failed", "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/** HTTP 409 — duplicate slug or other unique constraint from the API layer. */
export class ConflictError extends AppError {
  readonly issues?: unknown;
  constructor(message: string, issues?: unknown) {
    super(409, message, "CONFLICT");
    this.name = "ConflictError";
    this.issues = issues;
  }
}

export class OfferUnavailableError extends AppError {
  constructor(message = "This offer is no longer available.") {
    super(409, message, "OFFER_UNAVAILABLE");
    this.name = "OfferUnavailableError";
  }
}

/** PaymentIntent confirmed and Balance topped up, but `POST /air/orders` failed — ops/retry/refund per runbook. */
export class BookingFailedAfterPaymentError extends AppError {
  readonly supportReference?: string;
  /** Duffel PaymentIntent id (`pit_…`); same as support reference when card payments are used. */
  readonly paymentIntentId?: string;
  constructor(
    message = "Payment succeeded but the flight booking could not be completed. Contact support with the reference below.",
    supportReference?: string,
    paymentIntentId?: string,
  ) {
    const full =
      supportReference != null && supportReference !== ""
        ? `${message} Ref: ${supportReference}.`
        : message;
    super(503, full, "BOOKING_FAILED_AFTER_PAYMENT");
    this.name = "BookingFailedAfterPaymentError";
    this.supportReference = supportReference;
    this.paymentIntentId = paymentIntentId ?? supportReference;
  }
}

export class PriceChangedError extends AppError {
  constructor(message = "The flight price changed. Please search again and restart checkout.") {
    super(409, message, "PRICE_CHANGED");
    this.name = "PriceChangedError";
  }
}

/**
 * Ancillary selections could not all be validated or priced (atomic checkout — restart extras step).
 * @see z-docs/DUFFEL_INTEGRATION/DUFFEL_KEYS_AND_CHECKOUT.md
 */
export class AncillarySelectionError extends AppError {
  constructor(
    message = "One or more extras are not available at this price. Update your selection and try again.",
  ) {
    super(422, message, "ANCILLARY_PARTIAL_FAILURE");
    this.name = "AncillarySelectionError";
  }
}
