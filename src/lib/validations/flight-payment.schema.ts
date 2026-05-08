import { z } from "zod";
import { flightOrderServicesSchema } from "@/lib/validations/flight-ancillaries.schema";

export const createFlightPaymentIntentBodySchema = z.object({
  offer_id: z.string().min(1).max(128),
  services: flightOrderServicesSchema.optional().default([]),
});

export type CreateFlightPaymentIntentBody = z.infer<typeof createFlightPaymentIntentBodySchema>;
