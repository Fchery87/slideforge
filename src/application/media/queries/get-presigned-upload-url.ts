import { getPresignedUploadUrl } from "@/infrastructure/storage/r2-storage-service";
import { createStorageKey } from "@/domain/media/value-objects/storage-key";

export class GetPresignedUploadUrlQuery {
  async execute(userId: string, fileName: string, contentType: string): Promise<{ presignedUrl: string; storageKey: string }> {
    const storageKey = createStorageKey(userId, fileName);
    const presignedUrl = await getPresignedUploadUrl(storageKey, contentType);
    return { presignedUrl, storageKey };
  }
}
