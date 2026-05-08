import "server-only";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const adminCarRepository = {
  async findManyPaginated(args: {
    where: Prisma.AdminCarWhereInput;
    skip: number;
    take: number;
  }) {
    const [rows, total] = await Promise.all([
      prisma.adminCar.findMany({
        where: args.where,
        orderBy: { created_at: "desc" },
        skip: args.skip,
        take: args.take,
      }),
      prisma.adminCar.count({ where: args.where }),
    ]);
    return { rows, total };
  },

  findById(id: string) {
    return prisma.adminCar.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.adminCar.findUnique({ where: { slug } });
  },

  create(data: Prisma.AdminCarCreateInput) {
    return prisma.adminCar.create({ data });
  },

  update(id: string, data: Prisma.AdminCarUpdateInput) {
    return prisma.adminCar.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.adminCar.delete({ where: { id } });
  },
};
