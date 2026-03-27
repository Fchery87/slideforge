import type { CanvasObject } from "./canvas-object";
import type { SlideEffects } from "../value-objects/slide-effects";
import type { SlideBackground } from "../value-objects/slide-background";

export interface Slide {
  id: string;
  slideshowId: string;
  order: number;
  durationFrames: number;
  background: SlideBackground;
  layoutId?: string;
  notes?: string;
  canvasObjects: CanvasObject[];
  effects?: SlideEffects;
  createdAt: Date;
  updatedAt: Date;
}
