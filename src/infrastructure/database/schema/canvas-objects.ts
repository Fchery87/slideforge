import { integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { slides } from "./slides";

export const canvasObjectTypeEnum = pgEnum("canvas_object_type", ["image", "text", "shape", "group"]);

export const canvasObjects = pgTable("canvas_objects", {
  id: text("id").primaryKey(),
  slideId: text("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  type: canvasObjectTypeEnum("type").notNull(),
  x: integer("x").notNull().default(0),
  y: integer("y").notNull().default(0),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  rotation: integer("rotation").notNull().default(0),
  opacity: integer("opacity").notNull().default(100),
  zIndex: integer("z_index").notNull().default(0),
  groupId: text("group_id"),
  properties: jsonb("properties").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
