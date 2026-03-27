import { relations } from "drizzle-orm";
import { userProfiles } from "./users";
import { mediaAssets, mediaFolders } from "./media-assets";
import { slideshows } from "./slideshows";
import { slides } from "./slides";
import { canvasObjects } from "./canvas-objects";
import { transitions } from "./transitions";
import { audioTracks } from "./audio-tracks";
import { exportJobs } from "./export-jobs";

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  mediaAssets: many(mediaAssets),
  slideshows: many(slideshows),
  exportJobs: many(exportJobs),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [mediaAssets.userId],
    references: [userProfiles.id],
  }),
  folder: one(mediaFolders, {
    fields: [mediaAssets.folderId],
    references: [mediaFolders.id],
  }),
  slideshow: one(slideshows, {
    fields: [mediaAssets.slideshowId],
    references: [slideshows.id],
  }),
  audioTracks: many(audioTracks),
}));

export const mediaFoldersRelations = relations(mediaFolders, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [mediaFolders.userId],
    references: [userProfiles.id],
  }),
  mediaAssets: many(mediaAssets),
}));

export const slideshowsRelations = relations(slideshows, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [slideshows.userId],
    references: [userProfiles.id],
  }),
  coverAsset: one(mediaAssets, {
    fields: [slideshows.coverAssetId],
    references: [mediaAssets.id],
  }),
  slides: many(slides),
  transitions: many(transitions),
  audioTracks: many(audioTracks),
  exportJobs: many(exportJobs),
  mediaAssets: many(mediaAssets),
}));

export const slidesRelations = relations(slides, ({ one, many }) => ({
  slideshow: one(slideshows, {
    fields: [slides.slideshowId],
    references: [slideshows.id],
  }),
  canvasObjects: many(canvasObjects),
}));

export const canvasObjectsRelations = relations(canvasObjects, ({ one }) => ({
  slide: one(slides, {
    fields: [canvasObjects.slideId],
    references: [slides.id],
  }),
}));

export const transitionsRelations = relations(transitions, ({ one }) => ({
  slideshow: one(slideshows, {
    fields: [transitions.slideshowId],
    references: [slideshows.id],
  }),
  fromSlide: one(slides, {
    fields: [transitions.fromSlideId],
    references: [slides.id],
    relationName: "fromSlide",
  }),
  toSlide: one(slides, {
    fields: [transitions.toSlideId],
    references: [slides.id],
    relationName: "toSlide",
  }),
}));

export const audioTracksRelations = relations(audioTracks, ({ one }) => ({
  slideshow: one(slideshows, {
    fields: [audioTracks.slideshowId],
    references: [slideshows.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [audioTracks.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const exportJobsRelations = relations(exportJobs, ({ one }) => ({
  user: one(userProfiles, {
    fields: [exportJobs.userId],
    references: [userProfiles.id],
  }),
  slideshow: one(slideshows, {
    fields: [exportJobs.slideshowId],
    references: [slideshows.id],
  }),
}));
