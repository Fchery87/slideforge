import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export class RemoveSlideCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideId: string): Promise<void> {
    await this.slideshowRepo.removeSlide(slideId);
  }
}
