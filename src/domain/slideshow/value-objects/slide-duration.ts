export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

export const DEFAULT_SLIDE_DURATION_FRAMES = 150; // 5 seconds at 30fps
export const DEFAULT_FPS = 30;
