"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Music, Trash2 } from "lucide-react";

interface AudioAsset {
  id: string;
  fileName: string;
  url: string;
  durationMs: number | null;
}

export function AudioPanel() {
  const { slideshow, addAudioTrack, removeAudioTrack } = useEditorStore();
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);

  useEffect(() => {
    fetch("/api/media?type=audio")
      .then((r) => r.json())
      .then((data) => setAudioAssets(data.items ?? []))
      .catch(() => {});
  }, []);

  if (!slideshow) return null;

  const slideshowId = slideshow.id;
  const totalFrames = slideshow.slides.reduce((sum, s) => sum + s.durationFrames, 0);
  const trackCount = slideshow.audioTracks.length;

  async function handleAddTrack(asset: AudioAsset) {
    const track = {
      id: crypto.randomUUID(),
      slideshowId,
      mediaAssetId: asset.id,
      trackIndex: trackCount,
      startFrame: 0,
      endFrame: totalFrames,
      volume: 100,
      fadeInFrames: 0,
      fadeOutFrames: 0,
      createdAt: new Date(),
    };

    addAudioTrack(track);

    await fetch(`/api/slideshows/${slideshowId}/audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(track),
    });
  }

  async function handleRemoveTrack(trackId: string) {
    removeAudioTrack(trackId);
    await fetch(`/api/slideshows/${slideshowId}/audio?trackId=${trackId}`, {
      method: "DELETE",
    });
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold text-slate-300">Audio Tracks</h3>

      {slideshow.audioTracks.length > 0 && (
        <div className="space-y-2">
          {slideshow.audioTracks.map((track, i) => {
            const asset = audioAssets.find((a) => a.id === track.mediaAssetId);
            return (
              <div
                key={track.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] p-2"
              >
                <div className="flex items-center gap-2">
                  <Music className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-300">
                    {asset?.fileName ?? `Track ${i + 1}`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTrack(track.id)}
                  className="h-6 w-6 cursor-pointer p-0 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-xs text-slate-400">Available Audio</h4>
        {audioAssets.length === 0 ? (
          <p className="text-xs text-slate-500">Upload audio files first</p>
        ) : (
          <div className="space-y-1">
            {audioAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleAddTrack(asset)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-white/[0.04]"
              >
                <Music className="h-3 w-3" />
                {asset.fileName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
