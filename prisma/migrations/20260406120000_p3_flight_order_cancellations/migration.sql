-- P3: Duffel order cancellation quotes + confirms linked to flight bookings.
CREATE TABLE "flight_order_cancellations" (
    "id" TEXT NOT NULL,
    "flight_booking_id" TEXT NOT NULL,
    "duffel_cancellation_id" VARCHAR(64) NOT NULL,
    "duffel_order_id" VARCHAR(64) NOT NULL,
    "status" VARCHAR(24) NOT NULL,
    "refund_amount" VARCHAR(24),
    "refund_currency" VARCHAR(3),
    "refund_to" VARCHAR(40),
    "quote_expires_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "raw" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_order_cancellations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "flight_order_cancellations_duffel_cancellation_id_key" ON "flight_order_cancellations"("duffel_cancellation_id");

CREATE INDEX "flight_order_cancellations_flight_booking_id_idx" ON "flight_order_cancellations"("flight_booking_id");

CREATE INDEX "flight_order_cancellations_duffel_order_id_idx" ON "flight_order_cancellations"("duffel_order_id");

ALTER TABLE "flight_order_cancellations" ADD CONSTRAINT "flight_order_cancellations_flight_booking_id_fkey" FOREIGN KEY ("flight_booking_id") REFERENCES "flight_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
