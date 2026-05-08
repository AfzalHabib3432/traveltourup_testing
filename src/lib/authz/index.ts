export {
  ALL_PERMISSIONS,
  PERMISSION_REGISTRY,
  ROLE_BOOTSTRAP,
  DEFAULT_CUSTOMER_ROLE_ID,
  ADMIN_PANEL_ROLE_IDS,
  PROTECTED_ROLE_IDS,
  expandRolePermissionRefs,
  type PermissionId,
  type RoleBootstrap,
} from "./registry";
export { ForbiddenError, UnauthorizedError } from "./errors";
export type { AuthzContext, RoleAssignment } from "./types";
export {
  pickPrimaryRoleId,
  hasPermission,
  hasResourceAction,
  hasRole,
  hasAnyRole,
  hasAllPermissions,
  hasAnyPermission,
} from "./guards";
export {
  getAuthzContextForUserId,
  getPermissionSlugsForUserId,
  userHasPermission,
  assertUserId,
  assertPermission,
  assertAnyPermission,
  assertAllPermissions,
  assertRole,
  assertAnyRole,
  requireUserId,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireAnyRole,
} from "./server";
export { getServerAuthz, type ServerAuthzResult } from "./session";
export { ensureUserProfileForAuthUser, assignDefaultCustomerRole } from "./profile";
export {
  assignRoleToUser,
  removeRoleFromUser,
  grantUserPermission,
  revokeUserPermission,
} from "./mutations";
