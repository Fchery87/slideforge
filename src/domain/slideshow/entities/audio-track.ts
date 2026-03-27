export interface AudioTrack {
  id: string;
  slideshowId: string;
  mediaAssetId: string;
  trackIndex: number;
  startFrame: number;
  endFrame: number;
  trimStartFrame: number;
  trimEndFrame: number | null;
  volume: number;
  fadeInFrames: number;
  fadeOutFrames: number;
  createdAt: Date;
}
