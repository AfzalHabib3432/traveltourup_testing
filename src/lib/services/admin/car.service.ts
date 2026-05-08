import "server-only";

import { Prisma } from "@/generated/prisma";
import { NotFoundError } from "@/lib/api/errors";
import { serializeAdminCar } from "@/lib/api/serialize";
import { adminCarRepository } from "@/lib/db/repositories/admin-car.repository";
import {
  adminCarListQuerySchema,
  createAdminCarSchema,
  updateAdminCarSchema,
} from "@/lib/validations/admin-car.schema";
import type { z } from "zod";

type ListQuery = z.infer<typeof adminCarListQuerySchema>;
type CreateBody = z.infer<typeof createAdminCarSchema>;
type UpdateBody = z.infer<typeof updateAdminCarSchema>;

export async function listAdminCars(query: ListQuery) {
  const where: Prisma.AdminCarWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.airport_code ? { airport_code: query.airport_code } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;
  const { rows, total } = await adminCarRepository.findManyPaginated({
    where,
    skip,
    take: query.limit,
  });

  return {
    items: rows.map(serializeAdminCar),
    total,
    page: query.page,
    limit: query.limit,
  };
}

export async function getAdminCar(id: string) {
  const row = await adminCarRepository.findById(id);
  if (!row) {
    throw new NotFoundError("Car");
  }
  return serializeAdminCar(row);
}

export async function createAdminCar(body: CreateBody) {
  const row = await adminCarRepository.create({
    name: body.name,
    slug: body.slug,
    description: body.description ?? undefined,
    passengers: body.passengers ?? undefined,
    transmission: body.transmission ?? undefined,
    price_per_day: new Prisma.Decimal(String(body.price_per_day)),
    currency: body.currency,
    airport_code: body.airport_code ?? undefined,
    status: body.status,
  });
  return serializeAdminCar(row);
}

export async function updateAdminCar(id: string, body: UpdateBody) {
  const existing = await adminCarRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Car");
  }

  const data: Prisma.AdminCarUpdateInput = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description;
  if (body.passengers !== undefined) data.passengers = body.passengers;
  if (body.transmission !== undefined) data.transmission = body.transmission;
  if (body.price_per_day !== undefined) {
    data.price_per_day = new Prisma.Decimal(String(body.price_per_day));
  }
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.airport_code !== undefined) data.airport_code = body.airport_code;
  if (body.status !== undefined) data.status = body.status;

  const row = await adminCarRepository.update(id, data);
  return serializeAdminCar(row);
}

export async function deleteAdminCar(id: string) {
  const row = await adminCarRepository.findById(id);
  if (!row) {
    throw new NotFoundError("Car");
  }
  await adminCarRepository.delete(id);
}
