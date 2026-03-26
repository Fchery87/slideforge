export function createStorageKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${userId}/${timestamp}-${sanitized}`;
}

export function createExportStorageKey(userId: string, slideshowId: string, format: string): string {
  const timestamp = Date.now();
  return `exports/${userId}/${slideshowId}/${timestamp}.${format}`;
}
