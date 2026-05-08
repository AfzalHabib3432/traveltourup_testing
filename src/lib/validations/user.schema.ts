import { z } from "zod";

export const createUserProfileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  phone_country_code: z.string().optional(),
  country_code: z.string().length(3).optional(),
  currency_id: z.string().length(3).default("USD"),
});

export const updateUserProfileSchema = createUserProfileSchema.partial().omit({ id: true });

export const updateMeProfileSchema = z
  .object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().nullable().optional(),
    phone_country_code: z.string().nullable().optional(),
    country_code: z.string().length(3).nullable().optional(),
    currency_id: z.string().length(3).optional(),
    avatar_path: z.string().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

// --------------- Admin schemas ---------------

export const userAdminListQuerySchema = z.object({
  q: z.string().optional(),
  role_id: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["created_at", "first_name", "last_name"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const userAdminCreateSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  password: z.string().min(8).max(72).optional(),
  role_id: z.string().min(1),
});

export const userAdminUpdateSchema = z
  .object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().nullable().optional(),
    phone_country_code: z.string().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field required" });

export const userRoleAssignmentSchema = z.object({
  role_ids: z.array(z.string().min(1)).min(1),
  primary_role_id: z.string().min(1),
});
