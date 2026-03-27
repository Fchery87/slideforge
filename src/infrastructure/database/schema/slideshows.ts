import { integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { SlideshowTheme } from "@/domain/slideshow/entities/slideshow";

export const resolutionEnum = pgEnum("resolution", ["720p", "1080p"]);

export const occasionTypeEnum = pgEnum("occasion_type", [
  "birthday", "wedding", "anniversary", "memorial", "graduation",
  "baby_shower", "family_recap", "holiday", "presentation", "custom"
]);

export const slideshowStatusEnum = pgEnum("slideshow_status", [
  "draft", "exporting", "completed", "failed"
]);

export const aspectRatioEnum = pgEnum("aspect_ratio", [
  "16:9", "9:16", "4:3", "1:1"
]);

export const slideshows = pgTable("slideshows", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled Slideshow"),
  description: text("description"),
  occasionType: occasionTypeEnum("occasion_type").notNull().default("custom"),
  status: slideshowStatusEnum("status").notNull().default("draft"),
  aspectRatio: aspectRatioEnum("aspect_ratio").notNull().default("16:9"),
  coverAssetId: text("cover_asset_id"),
  resolution: resolutionEnum("resolution").notNull().default("1080p"),
  fps: integer("fps").notNull().default(30),
  backgroundColor: text("background_color").notNull().default("#000000"),
  theme: jsonb("theme").$type<SlideshowTheme>(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
