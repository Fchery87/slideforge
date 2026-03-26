import type { IExportJobRepository } from "@/domain/export/repositories/export-job-repository.interface";

export class CancelExportCommand {
  constructor(private exportRepo: IExportJobRepository) {}

  async execute(jobId: string): Promise<void> {
    const job = await this.exportRepo.findById(jobId);
    if (!job) throw new Error("Export job not found");
    if (job.status !== "queued" && job.status !== "processing") {
      throw new Error("Cannot cancel a completed or failed export");
    }
    await this.exportRepo.update(jobId, { status: "failed", errorMessage: "Cancelled by user" });
  }
}
