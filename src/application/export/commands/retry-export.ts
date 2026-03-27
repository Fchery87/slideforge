import type { IExportJobRepository } from "@/domain/export/repositories/export-job-repository.interface";
import type { ExportJob } from "@/domain/export/entities/export-job";
import { nanoid } from "nanoid";

export interface RetryExportInput {
  failedJobId: string;
  userId: string;
}

export class RetryExportCommand {
  constructor(private exportRepo: IExportJobRepository) {}

  async execute(input: RetryExportInput): Promise<ExportJob> {
    const failedJob = await this.exportRepo.findById(input.failedJobId);
    if (!failedJob) throw new Error("Export job not found");

    if (failedJob.status !== "failed") {
      throw new Error("Can only retry failed export jobs");
    }

    const now = new Date();
    const newJob: ExportJob = {
      id: nanoid(),
      userId: input.userId,
      slideshowId: failedJob.slideshowId,
      format: failedJob.format,
      resolution: failedJob.resolution,
      status: "queued",
      progress: 0,
      outputStorageKey: null,
      outputUrl: null,
      fileSizeBytes: null,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      createdAt: now,
    };

    return this.exportRepo.create(newJob);
  }
}
