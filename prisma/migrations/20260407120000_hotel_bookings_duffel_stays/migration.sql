-- AlterTable
ALTER TABLE "hotel_bookings" ADD COLUMN     "duffel_booking_id" VARCHAR(64),
ADD COLUMN     "duffel_quote_id" VARCHAR(64),
ADD COLUMN     "stays_search_result_id" VARCHAR(64),
ADD COLUMN     "duffel_accommodation_id" VARCHAR(64),
ADD COLUMN     "booking_reference" VARCHAR(64),
ADD COLUMN     "quote_expires_at" TIMESTAMP(3),
ADD COLUMN     "accommodation_snapshot" JSONB,
ADD COLUMN     "stays_raw" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "hotel_bookings_duffel_booking_id_key" ON "hotel_bookings"("duffel_booking_id");

-- CreateIndex
CREATE INDEX "hotel_bookings_duffel_accommodation_id_idx" ON "hotel_bookings"("duffel_accommodation_id");
