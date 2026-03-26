export interface MediaAssetUploaded {
  type: "MEDIA_ASSET_UPLOADED";
  payload: { assetId: string; userId: string; sizeBytes: number };
}

export interface MediaAssetDeleted {
  type: "MEDIA_ASSET_DELETED";
  payload: { assetId: string; userId: string; sizeBytes: number };
}

export type MediaEvent = MediaAssetUploaded | MediaAssetDeleted;
