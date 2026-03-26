import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";

export class ListUserSlideshowsQuery {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(userId: string, page = 1, limit = 20): Promise<{ items: Slideshow[]; total: number }> {
    return this.slideshowRepo.findByUserId(userId, { page, limit });
  }
}
