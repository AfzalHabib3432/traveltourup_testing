export type AuthzContext = {
  userId: string;
  roleIds: string[];
  primaryRoleId: string | null;
  permissions: ReadonlySet<string>;
};

export type RoleAssignment = { role_id: string; is_primary: boolean };
