export const Resolutions = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
} as const;

export type ResolutionKey = keyof typeof Resolutions;

export function getResolutionDimensions(key: ResolutionKey) {
  return Resolutions[key];
}
