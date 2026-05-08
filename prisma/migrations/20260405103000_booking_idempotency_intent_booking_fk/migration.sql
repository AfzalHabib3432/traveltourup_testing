-- P2: Flight checkout idempotency + link payment intent to confirmed booking.
ALTER TABLE "bookings" ADD COLUMN "idempotency_key" TEXT;

CREATE UNIQUE INDEX "bookings_idempotency_key_key" ON "bookings"("idempotency_key");

ALTER TABLE "flight_payment_intent_records" ADD COLUMN "booking_id" TEXT;

CREATE INDEX "flight_payment_intent_records_booking_id_idx" ON "flight_payment_intent_records"("booking_id");

ALTER TABLE "flight_payment_intent_records" ADD CONSTRAINT "flight_payment_intent_records_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
