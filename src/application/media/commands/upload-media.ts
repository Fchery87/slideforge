import type { IMediaAssetRepository } from "@/domain/media/repositories/media-asset-repository.interface";
import type { MediaAsset } from "@/domain/media/entities/media-asset";
import { createStorageKey } from "@/domain/media/value-objects/storage-key";
import { getPublicUrl } from "@/infrastructure/storage/r2-storage-service";
import { nanoid } from "nanoid";

export interface UploadMediaInput {
  userId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  type: "image" | "audio";
  storageKey?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  folderId?: string | null;
}

export class UploadMediaCommand {
  constructor(private mediaRepo: IMediaAssetRepository) {}

  async execute(input: UploadMediaInput): Promise<MediaAsset> {
    const id = nanoid();
    const storageKey = input.storageKey ?? createStorageKey(input.userId, input.fileName);

    const asset: MediaAsset = {
      id,
      userId: input.userId,
      type: input.type,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey,
      url: getPublicUrl(storageKey),
      width: input.width ?? null,
      height: input.height ?? null,
      durationMs: input.durationMs ?? null,
      folderId: input.folderId ?? null,
      createdAt: new Date(),
    };

    return this.mediaRepo.create(asset);
  }
}
