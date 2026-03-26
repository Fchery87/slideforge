export interface FeatureFlag {
  id: string;
  key: string;
  description: string | null;
  enabled: boolean;
  updatedAt: Date;
}
