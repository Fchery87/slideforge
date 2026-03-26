import type { IMediaAssetRepository } from "@/domain/media/repositories/media-asset-repository.interface";

export class DeleteMediaCommand {
  constructor(private mediaRepo: IMediaAssetRepository) {}

  async execute(assetId: string): Promise<void> {
    const asset = await this.mediaRepo.findById(assetId);
    if (!asset) throw new Error("Media asset not found");
    await this.mediaRepo.delete(assetId);
  }
}
