import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const featureFlags = pgTable("feature_flags", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
