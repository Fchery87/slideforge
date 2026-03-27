import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export interface UpdateSlideDurationInput {
  slideId: string;
  durationFrames: number;
}

export class UpdateSlideDurationCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: UpdateSlideDurationInput): Promise<void> {
    if (input.durationFrames < 1) {
      throw new Error("Duration must be at least 1 frame");
    }

    await this.slideshowRepo.updateSlide(input.slideId, {
      durationFrames: input.durationFrames,
    });
  }
}
