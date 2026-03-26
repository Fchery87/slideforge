import type { TransitionType } from "../value-objects/transition-type";

export interface Transition {
  id: string;
  slideshowId: string;
  fromSlideId: string;
  toSlideId: string;
  type: TransitionType;
  durationFrames: number;
  easing: string;
  createdAt: Date;
}
