import type { IExportJobRepository } from "@/domain/export/repositories/export-job-repository.interface";
import type { ExportJob } from "@/domain/export/entities/export-job";
import type { ExportFormat } from "@/domain/export/value-objects/export-format";
import type { ResolutionKey } from "@/domain/slideshow/value-objects/resolution";
import { nanoid } from "nanoid";

export interface QueueExportInput {
  userId: string;
  slideshowId: string;
  format: ExportFormat;
  resolution: ResolutionKey;
}

export class QueueExportCommand {
  constructor(private exportRepo: IExportJobRepository) {}

  async execute(input: QueueExportInput): Promise<ExportJob> {
    const job: ExportJob = {
      id: nanoid(),
      userId: input.userId,
      slideshowId: input.slideshowId,
      format: input.format,
      resolution: input.resolution,
      status: "queued",
      progress: 0,
      outputStorageKey: null,
      outputUrl: null,
      fileSizeBytes: null,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    };
    return this.exportRepo.create(job);
  }
}
