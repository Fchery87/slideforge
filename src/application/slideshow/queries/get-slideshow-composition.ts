import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";

export class GetSlideshowCompositionQuery {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(id: string): Promise<{ slideshow: Slideshow; totalFrames: number; totalDurationSeconds: number } | null> {
    const slideshow = await this.slideshowRepo.findById(id);
    if (!slideshow) return null;

    const totalFrames = getTotalDurationFrames(slideshow);
    const totalDurationSeconds = totalFrames / slideshow.fps;

    return { slideshow, totalFrames, totalDurationSeconds };
  }
}
