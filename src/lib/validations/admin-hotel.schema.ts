import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const adminHotelListQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  status: z.string().optional(),
});

export const createAdminHotelSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional().nullable(),
  stars: z.coerce.number().int().min(1).max(5).optional().nullable(),
  location: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  currency: z.string().length(3),
  amenities: z.array(z.string()).optional().nullable(),
  policy: z.string().optional().nullable(),
  status: z.string().optional().default("active"),
});

export const updateAdminHotelSchema = createAdminHotelSchema.partial();

export const adminHotelIdParamSchema = z.object({
  id: z.string().min(1),
});
