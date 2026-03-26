import { eq, sql, count } from "drizzle-orm";
import { db } from "../database/client";
import { exportJobs } from "../database/schema";
import type { IExportJobRepository } from "@/domain/export/repositories/export-job-repository.interface";
import type { ExportJob } from "@/domain/export/entities/export-job";

export class DrizzleExportRepository implements IExportJobRepository {
  async findById(id: string): Promise<ExportJob | null> {
    const result = await db.select().from(exportJobs).where(eq(exportJobs.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: string, options: { page: number; limit: number }): Promise<{ items: ExportJob[]; total: number }> {
    const offset = (options.page - 1) * options.limit;
    const [items, totalResult] = await Promise.all([
      db.select().from(exportJobs).where(eq(exportJobs.userId, userId)).limit(options.limit).offset(offset).orderBy(sql`${exportJobs.createdAt} DESC`),
      db.select({ count: count() }).from(exportJobs).where(eq(exportJobs.userId, userId)),
    ]);
    return { items: items as ExportJob[], total: totalResult[0].count };
  }

  async create(job: ExportJob): Promise<ExportJob> {
    await db.insert(exportJobs).values({
      id: job.id,
      userId: job.userId,
      slideshowId: job.slideshowId,
      format: job.format,
      resolution: job.resolution,
      status: job.status,
      progress: job.progress,
      outputStorageKey: job.outputStorageKey,
      outputUrl: job.outputUrl,
      fileSizeBytes: job.fileSizeBytes,
      errorMessage: job.errorMessage,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
    return job;
  }

  async update(id: string, data: Partial<Omit<ExportJob, "id" | "userId" | "slideshowId" | "createdAt">>): Promise<ExportJob> {
    const result = await db.update(exportJobs).set(data).where(eq(exportJobs.id, id)).returning();
    return result[0] as ExportJob;
  }

  async findNextQueued(): Promise<ExportJob | null> {
    const result = await db
      .select()
      .from(exportJobs)
      .where(eq(exportJobs.status, "queued"))
      .orderBy(exportJobs.createdAt)
      .limit(1);
    return result[0] ?? null;
  }
}
