import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export interface TrimAudioTrackInput {
  trackId: string;
  trimStartFrame: number;
  trimEndFrame: number;
}

export class TrimAudioTrackCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: TrimAudioTrackInput): Promise<void> {
    if (input.trimStartFrame < 0) {
      throw new Error("Trim start frame cannot be negative");
    }
    if (input.trimEndFrame <= input.trimStartFrame) {
      throw new Error("Trim end frame must be greater than trim start frame");
    }

    await this.slideshowRepo.updateAudioTrack(input.trackId, {
      trimStartFrame: input.trimStartFrame,
      trimEndFrame: input.trimEndFrame,
    });
  }
}
