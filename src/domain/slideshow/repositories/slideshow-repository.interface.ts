import type { Slideshow } from "../entities/slideshow";
import type { Slide } from "../entities/slide";
import type { CanvasObject } from "../entities/canvas-object";
import type { Transition } from "../entities/transition";
import type { AudioTrack } from "../entities/audio-track";

export interface ISlideshowRepository {
  findById(id: string): Promise<Slideshow | null>;
  findByUserId(userId: string, options: { page: number; limit: number }): Promise<{ items: Slideshow[]; total: number }>;
  create(slideshow: Omit<Slideshow, "slides" | "transitions" | "audioTracks">): Promise<Slideshow>;
  update(id: string, data: Partial<Pick<Slideshow, "title" | "description" | "resolution" | "fps" | "backgroundColor" | "thumbnailUrl">>): Promise<Slideshow>;
  delete(id: string): Promise<void>;

  addSlide(slide: Omit<Slide, "canvasObjects">): Promise<Slide>;
  removeSlide(slideId: string): Promise<void>;
  reorderSlides(slideshowId: string, slideIds: string[]): Promise<void>;

  upsertCanvasObjects(slideId: string, objects: CanvasObject[]): Promise<void>;

  setTransition(transition: Transition): Promise<Transition>;
  removeTransition(transitionId: string): Promise<void>;

  addAudioTrack(track: AudioTrack): Promise<AudioTrack>;
  removeAudioTrack(trackId: string): Promise<void>;
}
