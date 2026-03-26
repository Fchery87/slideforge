import { boolean, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const templateCategoryEnum = pgEnum("template_category", [
  "party", "funeral", "wedding", "birthday", "corporate", "other"
]);

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: templateCategoryEnum("category").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  slideshowData: jsonb("slideshow_data").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
