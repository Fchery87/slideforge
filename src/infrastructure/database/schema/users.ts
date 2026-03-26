import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(), // Same as Better Auth user.id
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  storageUsedBytes: integer("storage_used_bytes").notNull().default(0),
  storageQuotaBytes: integer("storage_quota_bytes").notNull().default(5_368_709_120), // 5GB
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
