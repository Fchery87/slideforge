import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { slideshows } from "./slideshows";
import type { SlideEffects } from "@/domain/slideshow/value-objects/slide-effects";

export const slides = pgTable("slides", {
  id: text("id").primaryKey(),
  slideshowId: text("slideshow_id").notNull().references(() => slideshows.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  durationFrames: integer("duration_frames").notNull().default(150), // 5s at 30fps
  backgroundColor: text("background_color"),
  effects: jsonb("effects").$type<SlideEffects>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
