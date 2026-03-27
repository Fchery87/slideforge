import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { TransitionType } from "@/domain/slideshow/value-objects/transition-type";
import { nanoid } from "nanoid";

export interface BulkApplyTransitionInput {
  slideshowId: string;
  slideIds: string[];
  transitionType: TransitionType;
  durationFrames?: number;
  easing?: string;
}

export class BulkApplyTransitionCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: BulkApplyTransitionInput): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(input.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    const sortedSlides = slideshow.slides
      .filter((s) => input.slideIds.includes(s.id))
      .sort((a, b) => a.order - b.order);

    // Create transitions between consecutive selected slides
    for (let i = 0; i < sortedSlides.length - 1; i++) {
      await this.slideshowRepo.setTransition({
        id: nanoid(),
        slideshowId: input.slideshowId,
        fromSlideId: sortedSlides[i].id,
        toSlideId: sortedSlides[i + 1].id,
        type: input.transitionType,
        durationFrames: input.durationFrames ?? 30,
        easing: input.easing ?? "ease-in-out",
        createdAt: new Date(),
      });
    }
  }
}
