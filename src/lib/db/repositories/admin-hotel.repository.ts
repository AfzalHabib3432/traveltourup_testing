import "server-only";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const adminHotelRepository = {
  async findManyPaginated(args: {
    where: Prisma.AdminHotelWhereInput;
    skip: number;
    take: number;
  }) {
    const [rows, total] = await Promise.all([
      prisma.adminHotel.findMany({
        where: args.where,
        orderBy: { created_at: "desc" },
        skip: args.skip,
        take: args.take,
      }),
      prisma.adminHotel.count({ where: args.where }),
    ]);
    return { rows, total };
  },

  findById(id: string) {
    return prisma.adminHotel.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.adminHotel.findUnique({ where: { slug } });
  },

  create(data: Prisma.AdminHotelCreateInput) {
    return prisma.adminHotel.create({ data });
  },

  update(id: string, data: Prisma.AdminHotelUpdateInput) {
    return prisma.adminHotel.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.adminHotel.delete({ where: { id } });
  },
};
