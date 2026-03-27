"use client";

import { useMemo, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Music } from "lucide-react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";
import { Button } from "@/components/ui/button";
import { TimelineTrack } from "./timeline-track";
import { AudioTrackLane } from "./audio-track-lane";
import { Playhead } from "./playhead";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const BASE_PX_PER_FRAME = 2;

export function TimelineContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideshow = useEditorStore((s) => s.slideshow);
  const currentSlideIndex = useEditorStore((s) => s.currentSlideIndex);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setCurrentSlideIndex = useEditorStore((s) => s.setCurrentSlideIndex);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);

  const totalFrames = useMemo(
    () => (slideshow ? getTotalDurationFrames(slideshow) : 0),
    [slideshow]
  );

  const pixelsPerFrame = BASE_PX_PER_FRAME * zoom;
  const trackWidth = totalFrames * pixelsPerFrame;

  // Auto-scroll to keep playhead visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const playheadX = currentFrame * pixelsPerFrame;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;

    if (playheadX < viewLeft + 40 || playheadX > viewRight - 40) {
      container.scrollLeft = playheadX - container.clientWidth / 2;
    }
  }, [currentFrame, pixelsPerFrame]);

  const handleSelectSlide = (index: number) => {
    setCurrentSlideIndex(index);
    if (!slideshow) return;
    let frame = 0;
    for (let i = 0; i < index; i++) {
      frame += slideshow.slides[i].durationFrames;
      const transition = slideshow.transitions.find(
        (t) =>
          t.fromSlideId === slideshow.slides[i].id &&
          t.toSlideId === slideshow.slides[i + 1]?.id
      );
      if (transition) {
        frame -= transition.durationFrames;
      }
    }
    setCurrentFrame(frame);
  };

  const zoomIn = () => setZoom(Math.min(zoom + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => setZoom(Math.max(zoom - ZOOM_STEP, MIN_ZOOM));

  // Time ruler marks - must be before early return to follow rules of hooks
  const rulerMarks = useMemo(() => {
    if (!slideshow) return [];
    const fps = slideshow.fps;
    const marks: { frame: number; label: string }[] = [];
    const step = Math.max(Math.round(fps / zoom), 1);
    for (let f = 0; f <= totalFrames; f += step) {
      const sec = f / fps;
      marks.push({
        frame: f,
        label: `${Math.floor(sec / 60)}:${(Math.floor(sec) % 60).toString().padStart(2, "0")}`,
      });
    }
    return marks;
  }, [slideshow, slideshow?.fps, totalFrames, zoom]);

  if (!slideshow) {
    return (
      <div className="flex h-20 items-center justify-center border-t border-border bg-background text-xs text-muted-foreground">
        No timeline data
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-t border-border bg-background">
      {/* Ruler */}
      <div className="relative h-5 shrink-0 border-b border-border/50 overflow-hidden">
        <div
          className="absolute inset-0 flex"
          style={{ width: trackWidth + 20 }}
        >
          {rulerMarks.map((mark) => (
            <div
              key={mark.frame}
              className="absolute flex flex-col items-center"
              style={{ left: mark.frame * pixelsPerFrame }}
            >
              <span className="font-mono text-[0.5rem] text-muted-foreground/60">
                {mark.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Track area */}
      <div className="relative flex-1 overflow-x-auto overflow-y-hidden" ref={scrollRef}>
        <div
          className="relative h-full"
          style={{ width: Math.max(trackWidth + 20, 200) }}
        >
          {/* Slide track label */}
          <div className="absolute left-0 top-0 flex h-5 items-center px-2">
            <span className="text-[9px] font-medium text-slate-500">Slides</span>
          </div>
          
          {/* Slide track */}
          <div className="absolute inset-y-0 left-0 flex items-center px-2" style={{ top: "20px" }}>
            <TimelineTrack
              slides={slideshow.slides}
              transitions={slideshow.transitions}
              currentSlideIndex={currentSlideIndex}
              pixelsPerFrame={pixelsPerFrame}
              onSelectSlide={handleSelectSlide}
            />
          </div>

          {/* Audio track label (if audio tracks exist) */}
          {slideshow.audioTracks.length > 0 && (
            <div className="absolute left-0 flex items-center gap-1 px-2" style={{ top: "32px" }}>
              <Music className="h-2.5 w-2.5 text-violet-400" />
              <span className="text-[9px] font-medium text-slate-500">Audio</span>
            </div>
          )}

          {/* Audio track lane */}
          <AudioTrackLane
            audioTracks={slideshow.audioTracks}
            pixelsPerFrame={pixelsPerFrame}
            totalFrames={totalFrames}
          />

          <Playhead pixelsPerFrame={pixelsPerFrame} />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center justify-end gap-1 border-t border-border/50 px-2 py-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
        >
          <ZoomOut className="size-3" />
        </Button>
        <span className="font-mono text-[0.6rem] text-muted-foreground tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
        >
          <ZoomIn className="size-3" />
        </Button>
      </div>
    </div>
  );
}
