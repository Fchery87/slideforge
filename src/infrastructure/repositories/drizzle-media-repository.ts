import { eq, and, sql, count } from "drizzle-orm";
import { db } from "../database/client";
import { mediaAssets, mediaFolders } from "../database/schema";
import type { IMediaAssetRepository } from "@/domain/media/repositories/media-asset-repository.interface";
import type { MediaAsset } from "@/domain/media/entities/media-asset";
import type { MediaFolder } from "@/domain/media/entities/media-folder";
import type { MediaType } from "@/domain/media/value-objects/media-type";

export class DrizzleMediaRepository implements IMediaAssetRepository {
  async findById(id: string): Promise<MediaAsset | null> {
    const result = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
    return (result[0] as MediaAsset) ?? null;
  }

  async findByUserId(
    userId: string,
    options: { type?: MediaType; folderId?: string | null; page: number; limit: number }
  ): Promise<{ items: MediaAsset[]; total: number }> {
    const offset = (options.page - 1) * options.limit;
    const conditions = [eq(mediaAssets.userId, userId)];
    if (options.type) conditions.push(eq(mediaAssets.type, options.type));
    if (options.folderId !== undefined) {
      conditions.push(
        options.folderId === null
          ? sql`${mediaAssets.folderId} IS NULL`
          : eq(mediaAssets.folderId, options.folderId)
      );
    }
    const whereClause = and(...conditions);

    const [items, totalResult] = await Promise.all([
      db.select().from(mediaAssets).where(whereClause).limit(options.limit).offset(offset).orderBy(sql`${mediaAssets.createdAt} DESC`),
      db.select({ count: count() }).from(mediaAssets).where(whereClause),
    ]);

    return { items: items as MediaAsset[], total: totalResult[0].count };
  }

  async create(asset: MediaAsset): Promise<MediaAsset> {
    await db.insert(mediaAssets).values({
      id: asset.id,
      userId: asset.userId,
      slideshowId: asset.slideshowId,
      type: asset.type,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      storageKey: asset.storageKey,
      url: asset.url,
      width: asset.width,
      height: asset.height,
      durationMs: asset.durationMs,
      processingStatus: asset.processingStatus,
      folderId: asset.folderId,
    });
    return asset;
  }

  async delete(id: string): Promise<void> {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }

  async createFolder(folder: MediaFolder): Promise<MediaFolder> {
    await db.insert(mediaFolders).values({
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
    });
    return folder;
  }

  async findFoldersByUserId(userId: string): Promise<MediaFolder[]> {
    return db.select().from(mediaFolders).where(eq(mediaFolders.userId, userId)) as Promise<MediaFolder[]>;
  }
}
