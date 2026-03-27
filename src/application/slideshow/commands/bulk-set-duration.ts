import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export interface BulkSetDurationInput {
  slideshowId: string;
  slideIds: string[];
  durationFrames: number;
}

export class BulkSetDurationCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: BulkSetDurationInput): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(input.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    if (input.durationFrames < 1) {
      throw new Error("Duration must be at least 1 frame");
    }

    // Update each selected slide
    for (const slideId of input.slideIds) {
      const slide = slideshow.slides.find((s) => s.id === slideId);
      if (!slide) continue;

      await this.slideshowRepo.updateSlide(slideId, {
        durationFrames: input.durationFrames,
      });
    }
  }
}
