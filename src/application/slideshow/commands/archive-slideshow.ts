import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export class ArchiveSlideshowCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideshowId: string): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");
    await this.slideshowRepo.delete(slideshowId);
  }
}
