import type { MediaType } from "../value-objects/media-type";
import type { FileDimensions } from "../value-objects/file-dimensions";

export interface MediaAsset {
  id: string;
  userId: string;
  type: MediaType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  url: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  folderId: string | null;
  createdAt: Date;
}

export function isImage(asset: MediaAsset): boolean {
  return asset.type === "image";
}

export function isAudio(asset: MediaAsset): boolean {
  return asset.type === "audio";
}

export function getDimensions(asset: MediaAsset): FileDimensions | null {
  if (asset.width != null && asset.height != null) {
    return { width: asset.width, height: asset.height };
  }
  return null;
}
