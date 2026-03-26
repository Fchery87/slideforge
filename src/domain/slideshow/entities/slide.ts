import type { CanvasObject } from "./canvas-object";

export interface Slide {
  id: string;
  slideshowId: string;
  order: number;
  durationFrames: number;
  backgroundColor: string | null;
  canvasObjects: CanvasObject[];
  createdAt: Date;
  updatedAt: Date;
}
