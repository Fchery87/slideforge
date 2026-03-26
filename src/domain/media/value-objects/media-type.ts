export const MediaTypes = {
  IMAGE: "image",
  AUDIO: "audio",
} as const;

export type MediaType = (typeof MediaTypes)[keyof typeof MediaTypes];
