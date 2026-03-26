import type { UserRole } from "../value-objects/user-role";

export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createUserProfile(id: string, overrides?: Partial<Omit<UserProfile, "id">>): UserProfile {
  return {
    id,
    displayName: null,
    avatarUrl: null,
    bio: null,
    role: "user",
    storageUsedBytes: 0,
    storageQuotaBytes: 5_368_709_120,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
