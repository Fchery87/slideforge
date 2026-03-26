export interface StorageQuota {
  userId: string;
  usedBytes: number;
  quotaBytes: number;
}

export function getUsagePercentage(quota: StorageQuota): number {
  if (quota.quotaBytes === 0) return 100;
  return Math.round((quota.usedBytes / quota.quotaBytes) * 100);
}

export function hasAvailableStorage(quota: StorageQuota, additionalBytes: number): boolean {
  return quota.usedBytes + additionalBytes <= quota.quotaBytes;
}
