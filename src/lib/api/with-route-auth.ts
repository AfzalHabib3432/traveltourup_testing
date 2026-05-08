import "server-only";

import { handleApiError } from "@/lib/api/error-handler";
import type { PermissionId } from "@/lib/authz/registry";
import { assertPermission, assertUserId } from "@/lib/authz/server";
import { getServerAuthz } from "@/lib/authz/session";

export type AuthedRouteCtx = { userId: string };

/**
 * Route Handler wrapper: session + optional RBAC + centralized error mapping.
 * Keeps route files thin: parse, call service, return response.
 *
 * - Use `withAuthedRoute` when any signed-in user may call the route (e.g. own bookings).
 * - Use `withPermissionRoute` for admin or feature gates (`assertPermission`).
 */
export async function withAuthedRoute(
  handler: (ctx: AuthedRouteCtx) => Promise<Response>,
): Promise<Response> {
  try {
    const { userId } = await getServerAuthz();
    assertUserId(userId);
    return await handler({ userId });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function withPermissionRoute(
  permission: PermissionId | string,
  handler: (ctx: AuthedRouteCtx) => Promise<Response>,
): Promise<Response> {
  try {
    const { userId, authz } = await getServerAuthz();
    assertUserId(userId);
    assertPermission(authz, permission);
    return await handler({ userId });
  } catch (error) {
    return handleApiError(error);
  }
}
