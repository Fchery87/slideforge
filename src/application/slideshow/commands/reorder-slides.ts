import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export class ReorderSlidesCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideshowId: string, slideIds: string[]): Promise<void> {
    await this.slideshowRepo.reorderSlides(slideshowId, slideIds);
  }
}
