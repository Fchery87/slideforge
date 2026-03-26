import type { CanvasObject } from "./canvas-object";
import type { SlideEffects } from "../value-objects/slide-effects";

export interface Slide {
  id: string;
  slideshowId: string;
  order: number;
  durationFrames: number;
  backgroundColor: string | null;
  canvasObjects: CanvasObject[];
  effects?: SlideEffects;
  createdAt: Date;
  updatedAt: Date;
}
