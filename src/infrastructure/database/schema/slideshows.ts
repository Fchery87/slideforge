import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const resolutionEnum = pgEnum("resolution", ["720p", "1080p"]);

export const slideshows = pgTable("slideshows", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled Slideshow"),
  description: text("description"),
  resolution: resolutionEnum("resolution").notNull().default("1080p"),
  fps: integer("fps").notNull().default(30),
  backgroundColor: text("background_color").notNull().default("#000000"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
