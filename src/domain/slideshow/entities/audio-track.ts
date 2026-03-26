export interface AudioTrack {
  id: string;
  slideshowId: string;
  mediaAssetId: string;
  trackIndex: number;
  startFrame: number;
  endFrame: number;
  volume: number;
  fadeInFrames: number;
  fadeOutFrames: number;
  createdAt: Date;
}
