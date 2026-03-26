"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  FileDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ExportJob } from "@/domain/export/entities/export-job";

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; color: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }
> = {
  queued: { label: "Queued", icon: Clock, color: "text-slate-400", badgeVariant: "secondary" },
  processing: { label: "Processing", icon: Loader2, color: "text-blue-400", badgeVariant: "default" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-400", badgeVariant: "outline" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-400", badgeVariant: "destructive" },
};

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/exports");
      if (!res.ok) throw new Error("Failed to load exports");
      const data = await res.json();
      setExports(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExports();
  }, [fetchExports]);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/exports/${id}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel export");
      await fetchExports();
    } catch {
      setError("Failed to cancel export");
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
        Exports
      </h1>

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
            onClick={fetchExports}
          >
            Retry
          </Button>
        </div>
      ) : exports.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <div className="text-center">
            <FileDown className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">
              No exports yet. Export a slideshow to see it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {exports.map((job) => {
            const cfg = statusConfig[job.status] ?? statusConfig.queued;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={job.id}
                className="rounded-xl border border-white/[0.08] bg-[#16163a] p-4 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon
                      className={`h-5 w-5 ${cfg.color} ${
                        job.status === "processing" ? "animate-spin" : ""
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {job.format.toUpperCase()} Export
                        </span>
                        <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {job.resolution} &middot;{" "}
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === "completed" && job.outputUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04] hover:text-white"
                        onClick={() => window.open(job.outputUrl!, "_blank")}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </Button>
                    )}
                    {(job.status === "queued" || job.status === "processing") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => handleCancel(job.id)}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {job.status === "processing" && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {job.progress}% complete
                    </p>
                  </div>
                )}

                {job.status === "completed" && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>Size: {formatBytes(job.fileSizeBytes)}</span>
                    {job.completedAt && (
                      <span>
                        Completed{" "}
                        {formatDistanceToNow(new Date(job.completedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                )}

                {job.status === "failed" && job.errorMessage && (
                  <div className="mt-3 rounded-lg bg-red-500/10 p-2 text-xs text-red-400">
                    {job.errorMessage}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
