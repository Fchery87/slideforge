import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";
import { nanoid } from "nanoid";

export interface AddAudioTrackInput {
  slideshowId: string;
  mediaAssetId: string;
  endFrame: number;
  volume?: number;
}

export class AddAudioTrackCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: AddAudioTrackInput): Promise<AudioTrack> {
    const slideshow = await this.slideshowRepo.findById(input.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    const trackIndex = slideshow.audioTracks.length;

    const track: AudioTrack = {
      id: nanoid(),
      slideshowId: input.slideshowId,
      mediaAssetId: input.mediaAssetId,
      trackIndex,
      startFrame: 0,
      endFrame: input.endFrame,
      trimStartFrame: 0,
      trimEndFrame: null,
      volume: input.volume ?? 100,
      fadeInFrames: 0,
      fadeOutFrames: 0,
      createdAt: new Date(),
    };

    return this.slideshowRepo.addAudioTrack(track);
  }
}
