import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";

export class UpdateCanvasObjectsCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideId: string, objects: CanvasObject[]): Promise<void> {
    await this.slideshowRepo.upsertCanvasObjects(slideId, objects);
  }
}
