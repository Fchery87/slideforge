import type { Slide } from "../entities/slide";
import type { AudioTrack } from "../entities/audio-track";

export function reindexSlideOrder(slides: Slide[]): Slide[] {
  return slides
    .sort((a, b) => a.order - b.order)
    .map((slide, index) => ({ ...slide, order: index }));
}

export function validateSlideOrder(slides: Slide[]): boolean {
  const sorted = [...slides].sort((a, b) => a.order - b.order);
  return sorted.every((slide, index) => slide.order === index);
}

export function findInsertPosition(slides: Slide[], afterSlideId?: string): number {
  if (!afterSlideId) return slides.length;
  const index = slides.findIndex((s) => s.id === afterSlideId);
  return index === -1 ? slides.length : index + 1;
}

export function validateAudioTimeRange(track: AudioTrack): boolean {
  return track.startFrame >= 0 && track.endFrame > track.startFrame;
}

export function findOverlappingAudioTracks(tracks: AudioTrack[]): [AudioTrack, AudioTrack][] {
  const overlaps: [AudioTrack, AudioTrack][] = [];
  for (let i = 0; i < tracks.length; i++) {
    for (let j = i + 1; j < tracks.length; j++) {
      if (tracks[i].startFrame < tracks[j].endFrame && tracks[j].startFrame < tracks[i].endFrame) {
        overlaps.push([tracks[i], tracks[j]]);
      }
    }
  }
  return overlaps;
}

export function calculateSlideDurationDistribution(
  totalAudioFrames: number,
  slideCount: number
): number[] {
  if (slideCount === 0) return [];
  const base = Math.floor(totalAudioFrames / slideCount);
  const remainder = totalAudioFrames % slideCount;
  return Array.from({ length: slideCount }, (_, i) => base + (i < remainder ? 1 : 0));
}
