import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const adminCarListQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  status: z.string().optional(),
  airport_code: z.string().length(3).optional(),
});

export const createAdminCarSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional().nullable(),
  passengers: z.coerce.number().int().positive().optional().nullable(),
  transmission: z.string().optional().nullable(),
  price_per_day: z.coerce.number().nonnegative(),
  currency: z.string().length(3),
  airport_code: z.string().length(3).optional().nullable(),
  status: z.string().optional().default("active"),
});

export const updateAdminCarSchema = createAdminCarSchema.partial();

export const adminCarIdParamSchema = z.object({
  id: z.string().min(1),
});
