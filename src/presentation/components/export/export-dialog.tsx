"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const formats = [
  { value: "mp4", label: "MP4", desc: "Universal, best for web" },
  { value: "webm", label: "WebM", desc: "Smaller files, web-optimized" },
  { value: "gif", label: "GIF", desc: "Animated, no audio" },
  { value: "prores", label: "ProRes", desc: "Professional editing" },
] as const;

const resolutions = [
  { value: "720p", label: "720p HD", desc: "1280×720" },
  { value: "1080p", label: "1080p Full HD", desc: "1920×1080" },
] as const;

type ExportFormat = (typeof formats)[number]["value"];
type ExportResolution = (typeof resolutions)[number]["value"];

export function ExportDialog() {
  const { slideshow } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("mp4");
  const [resolution, setResolution] = useState<ExportResolution>("1080p");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-export-dialog", handler);
    return () => window.removeEventListener("open-export-dialog", handler);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!slideshow) return;
    setSubmitting(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideshowId: slideshow.id,
          format,
          resolution,
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setSubmitting(false);
    }
  }, [slideshow, format, resolution]);

  if (!slideshow) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-96 border-l-white/[0.08] bg-[#0F0F23] sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-slate-100">Export Slideshow</SheetTitle>
          <SheetDescription>
            Choose your format and resolution for &quot;{slideshow.title}&quot;
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 py-4">
          {/* Format selection */}
          <div>
            <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
              Format
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    "flex flex-col items-start rounded-lg border p-3 text-left transition-all",
                    format === f.value
                      ? "border-rose-500/50 bg-rose-500/10 shadow-[0_0_12px_rgba(225,29,72,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  )}
                >
                  <span className="text-sm font-medium text-slate-200">
                    {f.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution selection */}
          <div>
            <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
              Resolution
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {resolutions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setResolution(r.value)}
                  className={cn(
                    "flex flex-col items-start rounded-lg border p-3 text-left transition-all",
                    resolution === r.value
                      ? "border-rose-500/50 bg-rose-500/10 shadow-[0_0_12px_rgba(225,29,72,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  )}
                >
                  <span className="text-sm font-medium text-slate-200">
                    {r.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={handleSubmit}
            disabled={submitting || success}
            className="w-full bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.2)] hover:bg-rose-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Queuing export...
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Export queued!
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
