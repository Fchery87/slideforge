import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import type { ResolutionKey } from "@/domain/slideshow/value-objects/resolution";
import { nanoid } from "nanoid";

export interface CreateSlideshowInput {
  userId: string;
  title?: string;
  description?: string;
  resolution?: ResolutionKey;
  fps?: number;
  backgroundColor?: string;
}

export class CreateSlideshowCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: CreateSlideshowInput): Promise<Slideshow> {
    const id = nanoid();
    const now = new Date();

    const slideshow: Omit<Slideshow, "slides" | "transitions" | "audioTracks"> = {
      id,
      userId: input.userId,
      title: input.title ?? "Untitled Slideshow",
      description: input.description ?? null,
      resolution: input.resolution ?? "1080p",
      fps: input.fps ?? 30,
      backgroundColor: input.backgroundColor ?? "#000000",
      thumbnailUrl: null,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.slideshowRepo.create(slideshow);

    const firstSlide = {
      id: nanoid(),
      slideshowId: id,
      order: 0,
      durationFrames: 150,
      backgroundColor: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.slideshowRepo.addSlide(firstSlide);

    return this.slideshowRepo.findById(id) as Promise<Slideshow>;
  }
}
