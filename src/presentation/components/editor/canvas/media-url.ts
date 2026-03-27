export function getMediaFileUrl(assetId: string) {
  return `/api/media/${assetId}/file`;
}

export async function resolveMediaAssetUrl(assetId: string) {
  const fallbackUrl = getMediaFileUrl(assetId);

  try {
    const response = await fetch(`/api/media/${assetId}/url`, {
      credentials: "include",
    });

    if (!response.ok) {
      return fallbackUrl;
    }

    const data = (await response.json()) as { presignedUrl?: string };
    return data.presignedUrl || fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}

export async function resolveCanvasImageUrl(assetId: string) {
  return resolveMediaAssetUrl(assetId);
}
