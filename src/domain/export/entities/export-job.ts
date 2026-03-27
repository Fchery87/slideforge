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

const VALID_TRANSITIONS: Record<ExportStatus, ExportStatus[]> = {
  queued: ["processing", "failed"],    // failed = cancelled
  processing: ["completed", "failed"],
  completed: [],                        // terminal
  failed: ["queued"],                   // retry creates new job in queued state
};

export function canTransition(from: ExportStatus, to: ExportStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTransition(from: ExportStatus, to: ExportStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid export status transition: ${from} → ${to}`);
  }
}
