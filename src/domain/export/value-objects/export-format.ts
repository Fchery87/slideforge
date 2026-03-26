export const ExportFormats = {
  MP4: "mp4",
  WEBM: "webm",
  GIF: "gif",
  PRORES: "prores",
} as const;

export type ExportFormat = (typeof ExportFormats)[keyof typeof ExportFormats];

export const RemotionCodecMap: Record<ExportFormat, string> = {
  mp4: "h264",
  webm: "vp9",
  gif: "gif",
  prores: "prores",
};
