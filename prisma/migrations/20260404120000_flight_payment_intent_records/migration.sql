-- P2: Duffel Payments — server-side PaymentIntent tracking (idempotency, confirm gate).
CREATE TABLE "flight_payment_intent_records" (
    "id" TEXT NOT NULL,
    "duffel_intent_id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "charge_amount" VARCHAR(24) NOT NULL,
    "charge_currency" VARCHAR(3) NOT NULL,
    "offer_amount" VARCHAR(24) NOT NULL,
    "offer_currency" VARCHAR(3) NOT NULL,
    "markup_amount" VARCHAR(24) NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "client_token" TEXT NOT NULL,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_payment_intent_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "flight_payment_intent_records_duffel_intent_id_key" ON "flight_payment_intent_records"("duffel_intent_id");

CREATE UNIQUE INDEX "flight_payment_intent_records_idempotency_key_key" ON "flight_payment_intent_records"("idempotency_key");
