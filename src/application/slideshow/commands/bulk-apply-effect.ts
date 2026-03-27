import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { SlideEffects } from "@/domain/slideshow/value-objects/slide-effects";

export interface BulkApplyEffectInput {
  slideshowId: string;
  slideIds: string[];
  effects: Partial<SlideEffects>;
}

export class BulkApplyEffectCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: BulkApplyEffectInput): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(input.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    // Apply effects to each selected slide
    for (const slideId of input.slideIds) {
      const slide = slideshow.slides.find((s) => s.id === slideId);
      if (!slide) continue;

      const mergedEffects = {
        ...slide.effects,
        ...input.effects,
      };

      await this.slideshowRepo.updateSlide(slideId, {
        effects: mergedEffects,
      });
    }
  }
}
