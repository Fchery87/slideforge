import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slide } from "@/domain/slideshow/entities/slide";
import { nanoid } from "nanoid";

export interface AddSlideInput {
  slideshowId: string;
  order: number;
  durationFrames?: number;
  backgroundColor?: string | null;
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
      backgroundColor: input.backgroundColor ?? null,
      createdAt: now,
      updatedAt: now,
    };
    return this.slideshowRepo.addSlide(slide);
  }
}
