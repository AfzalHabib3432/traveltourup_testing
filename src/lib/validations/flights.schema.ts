import { z } from "zod";

/** UI / browser cabin values → Duffel `cabin_class` */
export const cabinClassToDuffel = (v: string): string => {
  const m: Record<string, string> = {
    economy: "economy",
    "premium-economy": "premium_economy",
    business: "business",
    "first-class": "first",
  };
  return m[v] ?? "economy";
};

/** Duffel `cabin_class` → UI values used by `FlightsTab` selects */
export function duffelCabinToUi(duffel: string): string {
  const m: Record<string, string> = {
    economy: "economy",
    premium_economy: "premium-economy",
    business: "business",
    first: "first-class",
  };
  return m[duffel] ?? "economy";
}

/**
 * Search passengers mirror our `FlightSearchPassenger` shape.
 * Duffel rule: send **only** `type` **or** `age` per passenger on offer_requests; see `passengersToDuffelOfferRequest`.
 */
const passengerSchema = z
  .object({
    type: z.enum(["adult", "child", "infant_without_seat"]),
    /** Used for `child` only; mapped to a standalone `age` field for Duffel (never send both `type`+`age`). */
    age: z.number().int().min(0).max(17).optional(),
  })
  .superRefine((row, ctx) => {
    if (row.type !== "child" && row.age != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Age is only valid for child passengers (Duffel uses `age` alone for children).",
        path: ["age"],
      });
    }
  });

const hm = z.string().regex(/^\d{2}:\d{2}$/);
const timeWindowSchema = z.object({
  from: hm,
  to: hm,
});

const sliceSchema = z.object({
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departure_time: timeWindowSchema.optional(),
  arrival_time: timeWindowSchema.optional(),
});

/**
 * POST `/api/v1/flights/search` body (snake_case JSON per API architecture).
 */
export const flightSearchBodySchema = z.object({
  slices: z.array(sliceSchema).min(1).max(6),
  passengers: z.array(passengerSchema).min(1).max(9),
  cabin_class: z.enum(["economy", "premium_economy", "business", "first"]).default("economy"),
  max_connections: z.number().int().min(0).max(2).optional(),
  /**
   * Passed to Duffel as `supplier_timeout` query param on create offer request (milliseconds).
   * @see Duffel create offer request docs.
   */
  supplier_timeout_ms: z.number().int().min(1000).max(120_000).optional(),
  /** Optional filters / caps (applied after Duffel returns offers). */
  max_price: z.string().optional(),
  sort: z
    .enum(["best", "price_asc", "price_desc", "duration_asc", "duration_desc"])
    .default("best"),
  carrier_iata: z.array(z.string().min(2).max(3)).optional(),
  max_stops: z.number().int().min(0).max(3).optional(),
  limit: z.number().int().min(1).max(50).default(30),
});

export type FlightSearchBody = z.infer<typeof flightSearchBodySchema>;

/** Normalize IATA-like codes from UI (uppercase). */
export function normalizeDuffelCode(code: string): string {
  return code.trim().toUpperCase();
}
