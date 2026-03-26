import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum("media_type", ["image", "audio"]);

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: mediaTypeEnum("type").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: text("storage_key").notNull(),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  durationMs: integer("duration_ms"),
  folderId: text("folder_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaFolders = pgTable("media_folders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
