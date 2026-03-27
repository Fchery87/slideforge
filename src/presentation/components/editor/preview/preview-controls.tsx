"use client";

import { useCallback, useMemo } from "react";
import { Pause, Play } from "lucide-react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";
import { Button } from "@/components/ui/button";

interface PreviewControlsProps {
  className?: string;
}

function formatTime(frames: number, fps: number): string {
  const totalSeconds = frames / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const millis = Math.floor((totalSeconds % 1) * 100);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${millis.toString().padStart(2, "0")}`;
}

export function PreviewControls({ className }: PreviewControlsProps) {
  const slideshow = useEditorStore((s) => s.slideshow);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);

  const totalFrames = useMemo(
    () => (slideshow ? getTotalDurationFrames(slideshow) : 0),
    [slideshow]
  );

  const fps = slideshow?.fps ?? 30;

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setPlaying(false);
    } else {
      if (currentFrame >= totalFrames - 1) {
        setCurrentFrame(0);
      }
      setPlaying(true);
    }
  }, [isPlaying, currentFrame, totalFrames, setPlaying, setCurrentFrame]);

  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const frame = parseInt(e.target.value, 10);
      setCurrentFrame(frame);
    },
    [setCurrentFrame]
  );

  if (!slideshow) return null;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 ${className ?? ""}`.trim()}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="text-slate-300 hover:text-white"
      >
        {isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
      </Button>

      <span className="font-mono text-[0.7rem] text-slate-500 tabular-nums">
        {formatTime(currentFrame, fps)}
      </span>

      <input
        type="range"
        min={0}
        max={Math.max(totalFrames - 1, 0)}
        value={currentFrame}
        onChange={handleScrub}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-rose-500 [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-rose-500"
      />

      <span className="font-mono text-[0.7rem] text-slate-500 tabular-nums">
        {formatTime(totalFrames, fps)}
      </span>
    </div>
  );
}
