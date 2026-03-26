import type { IMediaAssetRepository } from "@/domain/media/repositories/media-asset-repository.interface";
import type { MediaFolder } from "@/domain/media/entities/media-folder";
import { nanoid } from "nanoid";

export interface CreateFolderInput {
  userId: string;
  name: string;
}

export class CreateFolderCommand {
  constructor(private mediaRepo: IMediaAssetRepository) {}

  async execute(input: CreateFolderInput): Promise<MediaFolder> {
    const folder: MediaFolder = {
      id: nanoid(),
      userId: input.userId,
      name: input.name,
      createdAt: new Date(),
    };
    return this.mediaRepo.createFolder(folder);
  }
}
