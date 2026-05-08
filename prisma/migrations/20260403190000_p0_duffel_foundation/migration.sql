-- AlterTable
ALTER TABLE "flight_bookings" ADD COLUMN     "duffel_order_id" TEXT,
ADD COLUMN     "duffel_offer_id" TEXT,
ADD COLUMN     "duffel_offer_request_id" TEXT,
ADD COLUMN     "booking_reference" TEXT,
ADD COLUMN     "live_mode" BOOLEAN,
ADD COLUMN     "last_offer_total_amount" DECIMAL(14,2),
ADD COLUMN     "last_offer_total_currency" VARCHAR(3),
ADD COLUMN     "offer_expires_at" TIMESTAMP(3),
ADD COLUMN     "itinerary_snapshot" JSONB,
ADD COLUMN     "order_raw" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "flight_bookings_duffel_order_id_key" ON "flight_bookings"("duffel_order_id");

-- CreateTable
CREATE TABLE "flight_search_sessions" (
    "id" TEXT NOT NULL,
    "user_id" UUID,
    "offer_request_id" TEXT NOT NULL,
    "params_hash" TEXT NOT NULL,
    "params_json" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_search_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duffel_webhook_events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "duffel_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flight_search_sessions_params_hash_idx" ON "flight_search_sessions"("params_hash");

-- CreateIndex
CREATE INDEX "flight_search_sessions_user_id_idx" ON "flight_search_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "duffel_webhook_events_event_id_key" ON "duffel_webhook_events"("event_id");

-- AddForeignKey
ALTER TABLE "flight_search_sessions" ADD CONSTRAINT "flight_search_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
