export const UserRoles = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
