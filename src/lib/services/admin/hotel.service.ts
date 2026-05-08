import "server-only";

import { Prisma } from "@/generated/prisma";
import { NotFoundError } from "@/lib/api/errors";
import { adminHotelRepository } from "@/lib/db/repositories/admin-hotel.repository";
import {
  adminHotelListQuerySchema,
  createAdminHotelSchema,
  updateAdminHotelSchema,
} from "@/lib/validations/admin-hotel.schema";
import type { z } from "zod";

type ListQuery = z.infer<typeof adminHotelListQuerySchema>;
type CreateBody = z.infer<typeof createAdminHotelSchema>;
type UpdateBody = z.infer<typeof updateAdminHotelSchema>;

export async function listAdminHotels(query: ListQuery) {
  const where: Prisma.AdminHotelWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
            { location: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;
  return adminHotelRepository.findManyPaginated({
    where,
    skip,
    take: query.limit,
  });
}

export async function getAdminHotel(id: string) {
  const row = await adminHotelRepository.findById(id);
  if (!row) {
    throw new NotFoundError("Hotel");
  }
  return row;
}

export async function createAdminHotel(body: CreateBody) {
  return adminHotelRepository.create({
    name: body.name,
    slug: body.slug,
    description: body.description ?? undefined,
    stars: body.stars ?? undefined,
    location: body.location ?? undefined,
    address: body.address ?? undefined,
    currency: body.currency,
    amenities:
      body.amenities === undefined
        ? undefined
        : body.amenities === null
          ? Prisma.JsonNull
          : (body.amenities as Prisma.InputJsonValue),
    policy: body.policy ?? undefined,
    status: body.status,
  });
}

export async function updateAdminHotel(id: string, body: UpdateBody) {
  await getAdminHotel(id);

  const data: Prisma.AdminHotelUpdateInput = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description;
  if (body.stars !== undefined) data.stars = body.stars;
  if (body.location !== undefined) data.location = body.location;
  if (body.address !== undefined) data.address = body.address;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.amenities !== undefined) {
    data.amenities = body.amenities == null ? Prisma.JsonNull : (body.amenities as Prisma.InputJsonValue);
  }
  if (body.policy !== undefined) data.policy = body.policy;
  if (body.status !== undefined) data.status = body.status;

  return adminHotelRepository.update(id, data);
}

export async function deleteAdminHotel(id: string) {
  await getAdminHotel(id);
  await adminHotelRepository.delete(id);
}
