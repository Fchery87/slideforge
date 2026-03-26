export interface AudioTimeRange {
  startFrame: number;
  endFrame: number;
}

export function getAudioDurationFrames(range: AudioTimeRange): number {
  return range.endFrame - range.startFrame;
}
