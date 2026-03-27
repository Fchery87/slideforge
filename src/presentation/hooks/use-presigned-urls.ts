"use client";

import { useEffect, useState, useCallback } from "react";
import type { MediaAsset } from "@/domain/media/entities/media-asset";
import { getMediaFileUrl } from "@/presentation/components/editor/canvas/media-url";

interface PresignedUrlMap {
  [assetId: string]: string;
}

export function usePresignedUrls(assets: MediaAsset[]) {
  const [urls, setUrls] = useState<PresignedUrlMap>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const fetchPresignedUrl = useCallback(async (assetId: string) => {
    if (urls[assetId] || loading.has(assetId)) return;

    setLoading((prev) => new Set(prev).add(assetId));
    
    try {
      const res = await fetch(`/api/media/${assetId}/url`, {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to get presigned URL");
      
      const { presignedUrl } = await res.json();
      
      setUrls((prev) => ({ ...prev, [assetId]: presignedUrl }));
    } catch (err) {
      console.error("Failed to fetch presigned URL for", assetId, err);
      setUrls((prev) => ({ ...prev, [assetId]: getMediaFileUrl(assetId) }));
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
    }
  }, [urls, loading]);

  // Fetch URLs for visible assets
  useEffect(() => {
    assets.forEach((asset) => {
      if (!urls[asset.id]) {
        fetchPresignedUrl(asset.id);
      }
    });
  }, [assets, urls, fetchPresignedUrl]);

  return { urls, fetchPresignedUrl };
}
