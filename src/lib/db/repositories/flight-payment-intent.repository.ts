import "server-only";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const flightPaymentIntentRepository = {
  findByIdempotencyKey(key: string) {
    return prisma.flightPaymentIntentRecord.findUnique({
      where: { idempotency_key: key },
    });
  },

  findByDuffelIntentId(duffelIntentId: string) {
    return prisma.flightPaymentIntentRecord.findUnique({
      where: { duffel_intent_id: duffelIntentId },
    });
  },

  async create(input: {
    duffel_intent_id: string;
    offer_id: string;
    charge_amount: string;
    charge_currency: string;
    offer_amount: string;
    offer_currency: string;
    markup_amount: string;
    services_subtotal_amount: string;
    ancillary_selection?: Prisma.InputJsonValue;
    status: string;
    client_token: string;
    idempotency_key: string | null;
  }) {
    return prisma.flightPaymentIntentRecord.create({ data: input });
  },

  async updateStatusByDuffelId(duffelIntentId: string, status: string) {
    return prisma.flightPaymentIntentRecord.update({
      where: { duffel_intent_id: duffelIntentId },
      data: { status },
    });
  },

  async linkBooking(duffelIntentId: string, bookingId: string) {
    return prisma.flightPaymentIntentRecord.update({
      where: { duffel_intent_id: duffelIntentId },
      data: { booking_id: bookingId },
    });
  },
};
