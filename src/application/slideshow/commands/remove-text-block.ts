import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export interface RemoveTextBlockInput {
  slideId: string;
  objectId: string;
}

export class RemoveTextBlockCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: RemoveTextBlockInput): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(input.slideId);
    if (!slideshow) throw new Error("Slideshow not found");

    const slide = slideshow.slides.find(s => s.canvasObjects.some(o => o.id === input.objectId));
    if (!slide) throw new Error("Slide not found");

    const object = slide.canvasObjects.find(o => o.id === input.objectId);
    if (!object) throw new Error("Object not found");
    if (object.type !== "text") throw new Error("Object is not a text block");

    // Filter out the object and update
    const remainingObjects = slide.canvasObjects.filter(o => o.id !== input.objectId);
    await this.slideshowRepo.upsertCanvasObjects(input.slideId, remainingObjects);
  }
}
