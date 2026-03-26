"use client";

import { useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";
import { Button } from "@/components/ui/button";

function formatTime(frames: number, fps: number): string {
  const totalSeconds = frames / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function TimelineControls() {
  const slideshow = useEditorStore((s) => s.slideshow);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);

  const fps = slideshow?.fps ?? 30;
  const totalFrames = slideshow ? getTotalDurationFrames(slideshow) : 0;

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

  const stepBack = useCallback(() => {
    setPlaying(false);
    setCurrentFrame(Math.max(0, currentFrame - 1));
  }, [currentFrame, setPlaying, setCurrentFrame]);

  const stepForward = useCallback(() => {
    setPlaying(false);
    setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1));
  }, [currentFrame, totalFrames, setPlaying, setCurrentFrame]);

  const goToStart = useCallback(() => {
    setPlaying(false);
    setCurrentFrame(0);
  }, [setPlaying, setCurrentFrame]);

  const goToEnd = useCallback(() => {
    setPlaying(false);
    setCurrentFrame(Math.max(0, totalFrames - 1));
  }, [totalFrames, setPlaying, setCurrentFrame]);

  if (!slideshow) return null;

  return (
    <div className="flex items-center gap-1 border-t border-border bg-background px-3 py-1.5">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={goToStart}
        aria-label="Go to start"
      >
        <SkipBack className="size-3" />
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={stepBack}
        aria-label="Step back"
      >
        <ChevronLeft className="size-3" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={stepForward}
        aria-label="Step forward"
      >
        <ChevronRight className="size-3" />
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={goToEnd}
        aria-label="Go to end"
      >
        <SkipForward className="size-3" />
      </Button>

      <div className="ml-2 font-mono text-[0.65rem] text-muted-foreground tabular-nums">
        {formatTime(currentFrame, fps)} / {formatTime(totalFrames, fps)}
      </div>

      <div className="ml-auto font-mono text-[0.6rem] text-muted-foreground/50">
        {currentFrame}f / {totalFrames}f @ {fps}fps
      </div>
    </div>
  );
}
