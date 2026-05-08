import { z } from "zod";

export const flightBookingCancelBodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("quote") }),
  z.object({
    action: z.literal("confirm"),
    order_cancellation_id: z.string().regex(/^ore_/),
  }),
]);

export type FlightBookingCancelBody = z.infer<typeof flightBookingCancelBodySchema>;
