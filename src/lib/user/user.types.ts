export type UserRoleDto = {
  id: string;
  name: string;
  isPrimary: boolean;
};

export type UserProfileDto = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  phoneCountryCode: string | null;
  countryCode: string | null;
  avatarPath: string | null;
  roles: UserRoleDto[];
  createdAt: string;
  updatedAt: string;
};

export type UserListItemDto = UserProfileDto & {
  email: string;
};

export type RoleDto = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
};
