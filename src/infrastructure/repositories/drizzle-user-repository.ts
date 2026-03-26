import { eq, sql, like, or, count } from "drizzle-orm";
import { db } from "../database/client";
import { userProfiles } from "../database/schema";
import type { IUserRepository } from "@/domain/identity/repositories/user-repository.interface";
import type { UserProfile } from "@/domain/identity/entities/user-profile";

export class DrizzleUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserProfile | null> {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.id, id)).limit(1);
    return result[0] ?? null;
  }

  async create(profile: UserProfile): Promise<UserProfile> {
    const result = await db.insert(userProfiles).values(profile).returning();
    return result[0];
  }

  async update(id: string, data: Partial<Omit<UserProfile, "id" | "createdAt">>): Promise<UserProfile> {
    const result = await db
      .update(userProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    return result[0];
  }

  async findAll(options: { page: number; limit: number; search?: string }): Promise<{ items: UserProfile[]; total: number }> {
    const offset = (options.page - 1) * options.limit;

    let whereClause;
    if (options.search) {
      whereClause = or(
        like(userProfiles.displayName, `%${options.search}%`),
      );
    }

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(userProfiles)
        .where(whereClause)
        .limit(options.limit)
        .offset(offset)
        .orderBy(userProfiles.createdAt),
      db
        .select({ count: count() })
        .from(userProfiles)
        .where(whereClause),
    ]);

    return { items: items as UserProfile[], total: totalResult[0].count };
  }

  async updateRole(id: string, role: UserProfile["role"]): Promise<void> {
    await db
      .update(userProfiles)
      .set({ role, updatedAt: new Date() })
      .where(eq(userProfiles.id, id));
  }

  async updateStorageUsage(id: string, deltaBytes: number): Promise<void> {
    await db
      .update(userProfiles)
      .set({
        storageUsedBytes: sql`${userProfiles.storageUsedBytes} + ${deltaBytes}`,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, id));
  }
}
