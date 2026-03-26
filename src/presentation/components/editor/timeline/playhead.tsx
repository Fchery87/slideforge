"use client";

import { useMemo, useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";
import { cn } from "@/lib/utils";

type PlayheadProps = {
  pixelsPerFrame: number;
};

export function Playhead({ pixelsPerFrame }: PlayheadProps) {
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const wasPlayingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const left = currentFrame * pixelsPerFrame;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      wasPlayingRef.current = isPlaying;
      if (isPlaying) setPlaying(false);

      const container = containerRef.current?.parentElement;
      if (!container) return;

      const updateFrame = (clientX: number) => {
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left + container.scrollLeft;
        const frame = Math.max(0, Math.round(x / pixelsPerFrame));
        setCurrentFrame(frame);
      };

      updateFrame(e.clientX);

      const onMove = (ev: MouseEvent) => updateFrame(ev.clientX);
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (wasPlayingRef.current) setPlaying(true);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [isPlaying, pixelsPerFrame, setCurrentFrame, setPlaying]
  );

  return (
    <div
      ref={containerRef}
      className="absolute top-0 bottom-0 z-20 cursor-col-resize"
      style={{ left }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute top-0 bottom-0 w-px -translate-x-1/2 bg-red-500" />
      <div className="absolute top-0 left-1/2 size-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500" />
    </div>
  );
}
