import "server-only";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const userRepository = {
  findByAuthId(authId: string) {
    return prisma.user.findUnique({
      where: { id: authId },
      include: {
        user_roles: { include: { role: true } },
      },
    });
  },

  findUserIdsByRoleId(roleId: string) {
    return prisma.userRole.findMany({
      where: { role_id: roleId },
      select: { user_id: true },
    });
  },

  updateProfile(userId: string, data: Parameters<typeof prisma.user.update>[0]["data"]) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: {
        user_roles: { include: { role: true } },
      },
    });
  },

  // --------------- Admin methods ---------------

  async findManyWithRoles(query: {
    q?: string;
    role_id?: string;
    page: number;
    limit: number;
    sort: string;
    order: "asc" | "desc";
  }) {
    const where: Prisma.UserWhereInput = {};

    if (query.q) {
      const term = query.q.trim();
      where.OR = [
        { first_name: { contains: term, mode: "insensitive" } },
        { last_name: { contains: term, mode: "insensitive" } },
      ];
    }

    if (query.role_id) {
      where.user_roles = { some: { role_id: query.role_id } };
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sort]: query.order,
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { user_roles: { include: { role: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  findByIdWithRoles(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { user_roles: { include: { role: true } } },
    });
  },

  findAllRoles() {
    return prisma.role.findMany({ orderBy: { sort_order: "asc" } });
  },

  deleteProfile(userId: string) {
    return prisma.user.delete({ where: { id: userId } });
  },

  async setUserRoles(
    userId: string,
    roleIds: string[],
    primaryRoleId: string,
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { user_id: userId } });
      await tx.userRole.createMany({
        data: roleIds.map((role_id) => ({
          user_id: userId,
          role_id,
          is_primary: role_id === primaryRoleId,
        })),
      });
    });
  },
};
