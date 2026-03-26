import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { slideshows } from "./slideshows";

export const slides = pgTable("slides", {
  id: text("id").primaryKey(),
  slideshowId: text("slideshow_id").notNull().references(() => slideshows.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  durationFrames: integer("duration_frames").notNull().default(150), // 5s at 30fps
  backgroundColor: text("background_color"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
