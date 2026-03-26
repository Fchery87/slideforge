export interface ExportJobQueued {
  type: "EXPORT_JOB_QUEUED";
  payload: { jobId: string; userId: string; slideshowId: string };
}

export interface ExportJobCompleted {
  type: "EXPORT_JOB_COMPLETED";
  payload: { jobId: string; outputUrl: string };
}

export interface ExportJobFailed {
  type: "EXPORT_JOB_FAILED";
  payload: { jobId: string; errorMessage: string };
}

export type ExportEvent = ExportJobQueued | ExportJobCompleted | ExportJobFailed;
