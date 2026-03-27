import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";

export interface UpdateAudioVolumeInput {
  trackId: string;
  volume: number; // 0-100
}

export class UpdateAudioVolumeCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: UpdateAudioVolumeInput): Promise<void> {
    if (input.volume < 0 || input.volume > 100) {
      throw new Error("Volume must be between 0 and 100");
    }

    await this.slideshowRepo.updateAudioTrack(input.trackId, {
      volume: input.volume,
    });
  }
}
