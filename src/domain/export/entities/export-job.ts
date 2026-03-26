import type { ExportFormat } from "../value-objects/export-format";
import type { ExportStatus } from "../value-objects/export-status";
import type { ResolutionKey } from "../../slideshow/value-objects/resolution";

export interface ExportJob {
  id: string;
  userId: string;
  slideshowId: string;
  format: ExportFormat;
  resolution: ResolutionKey;
  status: ExportStatus;
  progress: number;
  outputStorageKey: string | null;
  outputUrl: string | null;
  fileSizeBytes: number | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}
