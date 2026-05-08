-- P4: Ancillary snapshot on PaymentIntent + persisted order ancillaries.
ALTER TABLE "flight_payment_intent_records" ADD COLUMN "services_subtotal_amount" VARCHAR(24);
ALTER TABLE "flight_payment_intent_records" ADD COLUMN "ancillary_selection" JSONB;

CREATE TABLE "booking_ancillaries" (
    "id" TEXT NOT NULL,
    "flight_booking_id" TEXT NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "duffel_service_id" VARCHAR(64),
    "passenger_id" VARCHAR(64),
    "segment_id" VARCHAR(64),
    "amount" VARCHAR(24),
    "currency" VARCHAR(3),
    "status" VARCHAR(32),
    "raw" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_ancillaries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "booking_ancillaries_flight_booking_id_idx" ON "booking_ancillaries"("flight_booking_id");

ALTER TABLE "booking_ancillaries" ADD CONSTRAINT "booking_ancillaries_flight_booking_id_fkey" FOREIGN KEY ("flight_booking_id") REFERENCES "flight_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
