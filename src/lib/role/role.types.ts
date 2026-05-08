export type PermissionDto = {
  id: string;
  resource: string;
  action: string;
  description: string | null;
  category: string | null;
};

export type PermissionGroupDto = {
  category: string;
  permissions: PermissionDto[];
};

export type RoleDetailDto = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  sortOrder: number;
  permissionCount: number;
  permissions: PermissionDto[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RoleListItemDto = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  sortOrder: number;
  permissionCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};
