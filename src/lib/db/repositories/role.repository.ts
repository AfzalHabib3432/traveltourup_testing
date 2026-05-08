import "server-only";

import { prisma } from "@/lib/prisma";

export const roleRepository = {
  findAll() {
    return prisma.role.findMany({
      orderBy: { sort_order: "asc" },
      include: {
        _count: { select: { role_permissions: true, user_roles: true } },
      },
    });
  },

  findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: { permission: true },
          orderBy: { permission: { category: "asc" } },
        },
        _count: { select: { user_roles: true } },
      },
    });
  },

  create(data: { id: string; name: string; description?: string; sort_order?: number }) {
    return prisma.role.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        is_system: false,
        sort_order: data.sort_order ?? 50,
      },
      include: {
        role_permissions: { include: { permission: true } },
        _count: { select: { user_roles: true } },
      },
    });
  },

  update(id: string, data: { name?: string; description?: string | null }) {
    return prisma.role.update({
      where: { id },
      data,
      include: {
        role_permissions: { include: { permission: true } },
        _count: { select: { user_roles: true } },
      },
    });
  },

  deleteRole(id: string) {
    return prisma.role.delete({ where: { id } });
  },

  async setPermissions(roleId: string, permissionIds: string[]) {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { role_id: roleId } });
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permission_id) => ({
            role_id: roleId,
            permission_id,
          })),
        });
      }
    });
  },

  findAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ category: "asc" }, { resource: "asc" }, { action: "asc" }],
    });
  },

  roleIdExists(id: string) {
    return prisma.role.findUnique({ where: { id }, select: { id: true } });
  },
};
