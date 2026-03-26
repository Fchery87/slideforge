import type { ExportJob } from "../entities/export-job";

export interface IExportJobRepository {
  findById(id: string): Promise<ExportJob | null>;
  findByUserId(userId: string, options: { page: number; limit: number }): Promise<{ items: ExportJob[]; total: number }>;
  create(job: ExportJob): Promise<ExportJob>;
  update(id: string, data: Partial<Omit<ExportJob, "id" | "userId" | "slideshowId" | "createdAt">>): Promise<ExportJob>;
  findNextQueued(): Promise<ExportJob | null>;
}
