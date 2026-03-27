"use client";

import { ImageIcon, Type, Plus, Upload, MousePointer, Sparkles } from "lucide-react";

interface EmptyStateProps {
  variant: "canvas" | "filmstrip" | "media";
}

export function EmptyState({ variant }: EmptyStateProps) {
  if (variant === "canvas") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 ring-1 ring-white/[0.06]">
            <MousePointer className="h-7 w-7 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-300">This slide is empty</h3>
            <p className="mt-1 text-xs text-slate-500">
              Add text, images, or shapes from the panels
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1">
              <Type className="h-3 w-3" /> Text
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> Images
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Shapes
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "filmstrip") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
            <Plus className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Start creating</p>
            <p className="mt-0.5 text-[10px] text-slate-600">
              Upload photos to create slides, or add slides manually
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "media") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-white/[0.06]">
          <Upload className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-300">No media yet</h3>
          <p className="mt-1 text-xs text-slate-500">
            Drag photos here or click Upload to get started
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-lg bg-white/[0.02] px-4 py-2.5 ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-400">Images</span>
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-400">Audio</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
