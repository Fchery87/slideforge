import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slide } from "@/domain/slideshow/entities/slide";

export interface FitSlidesToAudioInput {
  slideshowId: string;
}

export class FitSlidesToAudioCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: FitSlidesToAudioInput): Promise<void> {
    const slideshow = await this.slideshowRepo.findById(input.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    // Calculate total audio duration in frames
    const totalAudioFrames = slideshow.audioTracks.reduce((sum, track) => {
      return sum + (track.endFrame - track.startFrame);
    }, 0);

    const slideCount = slideshow.slides.length;
    if (slideCount === 0) return;

    // Distribute equal duration across all slides
    const baseDuration = Math.floor(totalAudioFrames / slideCount);
    const remainder = totalAudioFrames % slideCount;

    // Update each slide with calculated duration
    for (let i = 0; i < slideCount; i++) {
      const durationFrames = baseDuration + (i < remainder ? 1 : 0);
      await this.slideshowRepo.updateSlide(slideshow.slides[i].id, {
        durationFrames: Math.max(durationFrames, 30), // Minimum 1 second at 30fps
      });
    }
  }
}
