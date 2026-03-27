import type { ResolutionKey } from "../value-objects/resolution";
import type { Slide } from "./slide";
import type { Transition } from "./transition";
import type { AudioTrack } from "./audio-track";

export type OccasionType =
  | "birthday" | "wedding" | "anniversary" | "memorial" | "graduation"
  | "baby_shower" | "family_recap" | "holiday" | "presentation" | "custom";

export type SlideshowStatus = "draft" | "exporting" | "completed" | "failed";

export type AspectRatio = "16:9" | "9:16" | "4:3" | "1:1";

export interface SlideshowTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headlineFont: string;
  bodyFont: string;
  textColor: string;
}

export interface Slideshow {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  occasionType: OccasionType;
  status: SlideshowStatus;
  aspectRatio: AspectRatio;
  coverAssetId: string | null;
  resolution: ResolutionKey;
  fps: number;
  backgroundColor: string;
  theme?: SlideshowTheme;
  thumbnailUrl: string | null;
  slides: Slide[];
  transitions: Transition[];
  audioTracks: AudioTrack[];
  createdAt: Date;
  updatedAt: Date;
}

export function getTotalDurationFrames(slideshow: Slideshow): number {
  const slideDuration = slideshow.slides.reduce((sum, s) => sum + s.durationFrames, 0);
  const transitionOverlap = slideshow.transitions.reduce((sum, t) => sum + t.durationFrames, 0);
  return slideDuration - transitionOverlap;
}

export function getTotalDurationSeconds(slideshow: Slideshow): number {
  return getTotalDurationFrames(slideshow) / slideshow.fps;
}
