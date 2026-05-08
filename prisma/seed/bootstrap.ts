import type { Prisma } from "../../src/generated/prisma";
import {
  expandRolePermissionRefs,
  PERMISSION_REGISTRY,
  ROLE_BOOTSTRAP,
} from "../../src/lib/authz/registry";

export const BOOTSTRAP_ROLE_SLUGS = ROLE_BOOTSTRAP.map((r) => r.id);

/**
 * Idempotent catalog + bootstrap role grants.
 * Run inside `prisma.$transaction` so partial updates never leave the DB half-seeded.
 */
export async function runBootstrapSeed(tx: Prisma.TransactionClient): Promise<void> {
  for (const p of PERMISSION_REGISTRY) {
    await tx.permission.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        resource: p.resource,
        action: p.action,
        description: p.description,
        category: p.category,
        is_system: true,
      },
      update: {
        resource: p.resource,
        action: p.action,
        description: p.description,
        category: p.category,
      },
    });
  }

  for (const r of ROLE_BOOTSTRAP) {
    await tx.role.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        name: r.name,
        description: r.description,
        is_system: r.isSystem,
        sort_order: r.sortOrder,
      },
      update: {
        name: r.name,
        description: r.description,
        is_system: r.isSystem,
        sort_order: r.sortOrder,
      },
    });
  }

  for (const role of ROLE_BOOTSTRAP) {
    const permissionIds = expandRolePermissionRefs(role.permissionRefs);
    await tx.rolePermission.deleteMany({ where: { role_id: role.id } });
    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permission_id) => ({
          role_id: role.id,
          permission_id,
        })),
      });
    }
  }
}

export function getBootstrapSummary(): {
  permissionCount: number;
  roleCount: number;
  bootstrapRoleIds: string[];
} {
  return {
    permissionCount: PERMISSION_REGISTRY.length,
    roleCount: ROLE_BOOTSTRAP.length,
    bootstrapRoleIds: [...BOOTSTRAP_ROLE_SLUGS],
  };
}
