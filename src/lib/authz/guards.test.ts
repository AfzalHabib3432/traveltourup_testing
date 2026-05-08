import { describe, expect, it } from "vitest";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasResourceAction,
  hasRole,
  pickPrimaryRoleId,
} from "./guards";
import type { AuthzContext } from "./types";

function ctx(partial: Partial<AuthzContext> & Pick<AuthzContext, "userId">): AuthzContext {
  return {
    roleIds: partial.roleIds ?? [],
    primaryRoleId: partial.primaryRoleId ?? null,
    permissions: partial.permissions ?? new Set(),
    userId: partial.userId,
  };
}

describe("pickPrimaryRoleId", () => {
  it("prefers is_primary", () => {
    expect(
      pickPrimaryRoleId([
        { role_id: "customer", is_primary: false },
        { role_id: "agent", is_primary: true },
      ]),
    ).toBe("agent");
  });

  it("falls back to first assignment", () => {
    expect(
      pickPrimaryRoleId([
        { role_id: "supplier", is_primary: false },
        { role_id: "agent", is_primary: false },
      ]),
    ).toBe("supplier");
  });

  it("returns null when empty", () => {
    expect(pickPrimaryRoleId([])).toBeNull();
  });
});

describe("hasPermission / hasResourceAction", () => {
  const adminHotels = ctx({
    userId: "u1",
    permissions: new Set(["admin.hotels:read", "bookings:create"]),
  });

  it("matches slug", () => {
    expect(hasPermission(adminHotels, "admin.hotels:read")).toBe(true);
    expect(hasPermission(adminHotels, "admin.hotels:write")).toBe(false);
  });

  it("matches resource+action", () => {
    expect(hasResourceAction(adminHotels, "admin.hotels", "read")).toBe(true);
    expect(hasResourceAction(adminHotels, "admin.hotels", "write")).toBe(false);
  });

  it("handles null context", () => {
    expect(hasPermission(null, "x")).toBe(false);
  });
});

describe("roles", () => {
  const multi = ctx({
    userId: "u2",
    roleIds: ["customer", "agent"],
    permissions: new Set(["bookings:create"]),
  });

  it("hasRole / hasAnyRole", () => {
    expect(hasRole(multi, "agent")).toBe(true);
    expect(hasRole(multi, "admin")).toBe(false);
    expect(hasAnyRole(multi, ["admin", "agent"])).toBe(true);
    expect(hasAnyRole(multi, ["admin"])).toBe(false);
  });
});

describe("composite permission checks", () => {
  const c = ctx({
    userId: "u3",
    permissions: new Set(["a:1", "b:2"]),
  });

  it("hasAnyPermission", () => {
    expect(hasAnyPermission(c, ["missing", "a:1"])).toBe(true);
    expect(hasAnyPermission(c, ["missing"])).toBe(false);
  });

  it("hasAllPermissions", () => {
    expect(hasAllPermissions(c, ["a:1", "b:2"])).toBe(true);
    expect(hasAllPermissions(c, ["a:1", "c:3"])).toBe(false);
  });
});
