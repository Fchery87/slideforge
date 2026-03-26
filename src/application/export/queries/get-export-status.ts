import type { IExportJobRepository } from "@/domain/export/repositories/export-job-repository.interface";
import type { ExportJob } from "@/domain/export/entities/export-job";

export class GetExportStatusQuery {
  constructor(private exportRepo: IExportJobRepository) {}

  async execute(jobId: string): Promise<ExportJob | null> {
    return this.exportRepo.findById(jobId);
  }
}
