"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ImageIcon,
  Music,
  Trash2,
  Loader2,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePresignedUrls } from "@/presentation/hooks/use-presigned-urls";
import type { MediaAsset } from "@/domain/media/entities/media-asset";

type FilterType = "all" | "image" | "audio";

export function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { urls: presignedUrls } = usePresignedUrls(assets);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filter !== "all" ? `?type=${filter}` : "";
      const res = await fetch(`/api/media${params}`);
      if (!res.ok) throw new Error("Failed to load media assets");
      const data = await res.json();
      setAssets(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete file");
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const filtered = assets;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
          Media Library
        </h1>
        <Button className="cursor-pointer bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all duration-200 hover:bg-rose-700">
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="flex gap-2">
        {(["all", "image", "audio"] as const).map((t) => (
          <Button
            key={t}
            variant={filter === t ? "default" : "outline"}
            size="sm"
            className={`cursor-pointer ${
              filter === t
                ? ""
                : "border-white/[0.1] text-slate-300 hover:bg-white/[0.04] hover:text-white"
            }`}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : t === "image" ? "Images" : "Audio"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-16">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <p className="mt-2 text-sm text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
            onClick={fetchAssets}
          >
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <div className="text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">
              Upload images and audio to use in your slideshows
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((asset) => (
            <Card
              key={asset.id}
              className={`group relative overflow-hidden border-white/[0.08] bg-[#16163a] transition-all duration-200 hover:border-white/[0.15] ${
                deletingId === asset.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#0F0F23]">
                {asset.type === "image" ? (
                  presignedUrls[asset.id] ? (
                    <img
                      src={presignedUrls[asset.id]}
                      alt={asset.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                    </div>
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music className="h-10 w-10 text-slate-600" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon-sm"
                  className="absolute top-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(asset.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <CardContent className="p-3">
                <p className="truncate text-xs font-medium" title={asset.fileName}>
                  {asset.fileName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {asset.type}
                  </Badge>
                  <span className="text-[10px] text-slate-500">
                    {formatBytes(asset.sizeBytes)}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {formatDistanceToNow(new Date(asset.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
