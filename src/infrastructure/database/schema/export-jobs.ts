import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { slideshows, resolutionEnum } from "./slideshows";

export const exportFormatEnum = pgEnum("export_format", ["mp4", "webm", "gif", "prores"]);
export const exportStatusEnum = pgEnum("export_status", ["queued", "processing", "completed", "failed"]);

export const exportJobs = pgTable("export_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  slideshowId: text("slideshow_id").notNull().references(() => slideshows.id),
  format: exportFormatEnum("format").notNull(),
  resolution: resolutionEnum("resolution").notNull(),
  status: exportStatusEnum("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  outputStorageKey: text("output_storage_key"),
  outputUrl: text("output_url"),
  fileSizeBytes: integer("file_size_bytes"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
