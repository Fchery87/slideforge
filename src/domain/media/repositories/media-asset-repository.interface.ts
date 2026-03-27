import type { MediaAsset } from "../entities/media-asset";
import type { MediaFolder } from "../entities/media-folder";
import type { MediaType } from "../value-objects/media-type";

export interface IMediaAssetRepository {
  findById(id: string): Promise<MediaAsset | null>;
  findByUserId(userId: string, options: { type?: MediaType; folderId?: string | null; page: number; limit: number }): Promise<{ items: MediaAsset[]; total: number }>;
  create(asset: MediaAsset): Promise<MediaAsset>;
  delete(id: string): Promise<void>;
  createFolder(folder: MediaFolder): Promise<MediaFolder>;
  findFoldersByUserId(userId: string): Promise<MediaFolder[]>;
  isAssetInUse(assetId: string): Promise<boolean>;
}
