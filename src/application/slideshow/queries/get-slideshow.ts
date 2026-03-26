import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";

export class GetSlideshowQuery {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(id: string): Promise<Slideshow | null> {
    return this.slideshowRepo.findById(id);
  }
}
