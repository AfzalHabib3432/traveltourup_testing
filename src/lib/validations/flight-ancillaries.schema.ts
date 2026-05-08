import { z } from "zod";

/** Duffel `POST /air/orders` `services` line (`ase_*`, `ser_*`, …). */
export const flightOrderServiceLineSchema = z.object({
  id: z.string().min(1).max(128),
  quantity: z.coerce.number().int().min(1).max(9),
});

export const flightOrderServicesSchema = z.array(flightOrderServiceLineSchema).max(32);

export type FlightOrderServiceLine = z.infer<typeof flightOrderServiceLineSchema>;

/** Merge duplicate service ids (client + server). */
export function mergeFlightOrderServiceLines(lines: FlightOrderServiceLine[]): FlightOrderServiceLine[] {
  const m = new Map<string, number>();
  for (const l of lines) {
    const id = l.id.trim();
    if (!id) continue;
    m.set(id, (m.get(id) ?? 0) + l.quantity);
  }
  return [...m.entries()].map(([id, quantity]) => ({ id, quantity }));
}
