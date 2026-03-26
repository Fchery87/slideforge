"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { cn } from "@/lib/utils";
import { Loader2, Music } from "lucide-react";
import type { MediaAsset } from "@/domain/media/entities/media-asset";

interface MediaBrowserProps {
  type: "image" | "audio";
}

export function MediaBrowser({ type }: MediaBrowserProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const { slideshow, currentSlideIndex, addObject } = useEditorStore();

  const currentSlide = slideshow?.slides[currentSlideIndex] ?? null;

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media?type=${type}&limit=50`);
        if (!res.ok) throw new Error("Failed to load media");
        const data = await res.json();
        setAssets(data.items ?? data);
      } catch {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [type]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, asset: MediaAsset) => {
      e.dataTransfer.setData(
        "application/slideforge-media",
        JSON.stringify(asset)
      );
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleAddImage = useCallback(
    (asset: MediaAsset) => {
      if (!currentSlide || type !== "image") return;
      const id = crypto.randomUUID();
      addObject(currentSlide.id, {
        id,
        slideId: currentSlide.id,
        type: "image",
        x: 50,
        y: 50,
        width: asset.width ?? 400,
        height: asset.height ?? 300,
        rotation: 0,
        opacity: 1,
        zIndex: currentSlide.canvasObjects.length + 1,
        properties: {
          mediaAssetId: asset.id,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
    [currentSlide, type, addObject]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-slate-600">
        No {type} files yet. Upload some above.
      </p>
    );
  }

  if (type === "audio") {
    return (
      <div className="flex flex-col gap-1">
        {assets.map((asset) => (
          <div
            key={asset.id}
            draggable
            onDragStart={(e) => handleDragStart(e, asset)}
            className="flex cursor-grab items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] active:cursor-grabbing"
          >
            <Music className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{asset.fileName}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {assets.map((asset) => (
        <button
          key={asset.id}
          draggable
          onDragStart={(e) => handleDragStart(e, asset)}
          onClick={() => handleAddImage(asset)}
          className={cn(
            "group relative aspect-square overflow-hidden rounded-lg border border-white/[0.06] transition-all",
            "cursor-grab hover:border-white/[0.15] active:cursor-grabbing"
          )}
        >
          <img
            src={asset.url}
            alt={asset.fileName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-0.5 text-[10px] text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">
            {asset.fileName}
          </div>
        </button>
      ))}
    </div>
  );
}
