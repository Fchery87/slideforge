export const ExportStatuses = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type ExportStatus = (typeof ExportStatuses)[keyof typeof ExportStatuses];
