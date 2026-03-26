import type { IExportJobRepository } from "@/domain/export/repositories/export-job-repository.interface";
import type { ExportJob } from "@/domain/export/entities/export-job";

export class ListUserExportsQuery {
  constructor(private exportRepo: IExportJobRepository) {}

  async execute(userId: string, page = 1, limit = 20): Promise<{ items: ExportJob[]; total: number }> {
    return this.exportRepo.findByUserId(userId, { page, limit });
  }
}
