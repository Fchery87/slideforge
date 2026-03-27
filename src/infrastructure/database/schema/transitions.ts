import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { slideshows } from "./slideshows";
import { slides } from "./slides";

export const transitionTypeEnum = pgEnum("transition_type", [
  "none", "fade", "slide", "zoom", "dissolve", "wipe", "blur", "dip-to-black", "dip-to-white"
]);

export const transitions = pgTable("transitions", {
  id: text("id").primaryKey(),
  slideshowId: text("slideshow_id").notNull().references(() => slideshows.id, { onDelete: "cascade" }),
  fromSlideId: text("from_slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  toSlideId: text("to_slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  type: transitionTypeEnum("type").notNull().default("fade"),
  durationFrames: integer("duration_frames").notNull().default(30),
  easing: text("easing").notNull().default("ease-in-out"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
