import type { ResolutionKey } from "../value-objects/resolution";
import type { Slide } from "./slide";
import type { Transition } from "./transition";
import type { AudioTrack } from "./audio-track";

export interface Slideshow {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  resolution: ResolutionKey;
  fps: number;
  backgroundColor: string;
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
