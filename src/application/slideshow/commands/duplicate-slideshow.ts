import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import { migrateLegacyBackgroundColor } from "@/domain/slideshow/value-objects/slide-background";
import { nanoid } from "nanoid";

export class DuplicateSlideshowCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideshowId: string): Promise<Slideshow> {
    const original = await this.slideshowRepo.findById(slideshowId);
    if (!original) throw new Error("Slideshow not found");

    const now = new Date();
    const newId = nanoid();

    await this.slideshowRepo.create({
      id: newId,
      userId: original.userId,
      title: `${original.title} (Copy)`,
      description: original.description,
      resolution: original.resolution,
      fps: original.fps,
      backgroundColor: original.backgroundColor,
      theme: original.theme,
      thumbnailUrl: original.thumbnailUrl,
      createdAt: now,
      updatedAt: now,
    });

    for (const slide of original.slides) {
      const newSlideId = nanoid();
      await this.slideshowRepo.addSlide({
        id: newSlideId,
        slideshowId: newId,
        order: slide.order,
        durationFrames: slide.durationFrames,
        background: slide.background ?? migrateLegacyBackgroundColor(null),
        notes: slide.notes,
        layoutId: slide.layoutId,
        createdAt: now,
        updatedAt: now,
      });

      if (slide.canvasObjects.length > 0) {
        const objects = slide.canvasObjects.map((obj) => ({
          ...obj,
          id: nanoid(),
          slideId: newSlideId,
        }));
        await this.slideshowRepo.upsertCanvasObjects(newSlideId, objects);
      }
    }

    for (const transition of original.transitions) {
      await this.slideshowRepo.setTransition({
        ...transition,
        id: nanoid(),
        slideshowId: newId,
      });
    }

    for (const track of original.audioTracks) {
      await this.slideshowRepo.addAudioTrack({
        ...track,
        id: nanoid(),
        slideshowId: newId,
      });
    }

    return this.slideshowRepo.findById(newId) as Promise<Slideshow>;
  }
}
