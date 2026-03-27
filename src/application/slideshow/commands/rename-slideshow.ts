import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export class RenameSlideshowCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(slideshowId: string, title: string): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");
    if (!title.trim()) throw new Error("Title cannot be empty");
    await this.slideshowRepo.update(slideshowId, { title: title.trim(), updatedAt: new Date() });
  }
}
