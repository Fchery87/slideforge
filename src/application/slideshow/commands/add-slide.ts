import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { SlideBackground } from "@/domain/slideshow/value-objects/slide-background";
import { migrateLegacyBackgroundColor } from "@/domain/slideshow/value-objects/slide-background";
import { nanoid } from "nanoid";

export interface AddSlideInput {
  slideshowId: string;
  order: number;
  durationFrames?: number;
  background?: SlideBackground;
}

export class AddSlideCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: AddSlideInput): Promise<Slide> {
    const now = new Date();
    const slide: Omit<Slide, "canvasObjects"> = {
      id: nanoid(),
      slideshowId: input.slideshowId,
      order: input.order,
      durationFrames: input.durationFrames ?? 150,
      background: input.background ?? migrateLegacyBackgroundColor(null),
      createdAt: now,
      updatedAt: now,
    };
    return this.slideshowRepo.addSlide(slide);
  }
}
