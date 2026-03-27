import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { slideshows } from "./slideshows";
import { mediaAssets } from "./media-assets";

export const audioTracks = pgTable("audio_tracks", {
  id: text("id").primaryKey(),
  slideshowId: text("slideshow_id").notNull().references(() => slideshows.id, { onDelete: "cascade" }),
  mediaAssetId: text("media_asset_id").notNull().references(() => mediaAssets.id),
  trackIndex: integer("track_index").notNull().default(0),
  startFrame: integer("start_frame").notNull().default(0),
  endFrame: integer("end_frame").notNull(),
  trimStartFrame: integer("trim_start_frame").notNull().default(0),
  trimEndFrame: integer("trim_end_frame"),
  volume: integer("volume").notNull().default(100),
  fadeInFrames: integer("fade_in_frames").notNull().default(0),
  fadeOutFrames: integer("fade_out_frames").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
