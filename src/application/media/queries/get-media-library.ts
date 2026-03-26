import type { IMediaAssetRepository } from "@/domain/media/repositories/media-asset-repository.interface";
import type { MediaAsset } from "@/domain/media/entities/media-asset";
import type { MediaType } from "@/domain/media/value-objects/media-type";

export class GetMediaLibraryQuery {
  constructor(private mediaRepo: IMediaAssetRepository) {}

  async execute(
    userId: string,
    options: { type?: MediaType; folderId?: string | null; page?: number; limit?: number } = {}
  ): Promise<{ items: MediaAsset[]; total: number }> {
    return this.mediaRepo.findByUserId(userId, {
      type: options.type,
      folderId: options.folderId,
      page: options.page ?? 1,
      limit: options.limit ?? 20,
    });
  }
}
