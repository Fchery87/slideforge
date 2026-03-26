import type { UserProfile } from "../entities/user-profile";

export interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>;
  create(profile: UserProfile): Promise<UserProfile>;
  update(id: string, data: Partial<Omit<UserProfile, "id" | "createdAt">>): Promise<UserProfile>;
  findAll(options: { page: number; limit: number; search?: string }): Promise<{ items: UserProfile[]; total: number }>;
  updateRole(id: string, role: UserProfile["role"]): Promise<void>;
  updateStorageUsage(id: string, deltaBytes: number): Promise<void>;
}
