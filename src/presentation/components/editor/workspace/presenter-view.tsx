"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { SlideRenderer } from "@/presentation/components/shared/slide-renderer";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Monitor,
  Clock,
} from "lucide-react";
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";

export function PresenterView() {
  const {
    slideshow,
    currentSlideIndex,
    setCurrentSlideIndex,
    isPlaying,
    setPlaying,
    isPresenterMode,
    setPresenterMode,
  } = useEditorStore();

  const [elapsed, setElapsed] = useState(0);

  // Timer — tick when playing in presenter mode
  useEffect(() => {
    if (!isPlaying || !isPresenterMode) return;
    const interval = setInterval(() => {
      setElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isPresenterMode]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying || !slideshow || !isPresenterMode) return;

    const currentSlide = slideshow.slides[currentSlideIndex];
    if (!currentSlide) return;

    const durationMs = (currentSlide.durationFrames / slideshow.fps) * 1000;
    const timer = setTimeout(() => {
      if (currentSlideIndex < slideshow.slides.length - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1);
      } else {
        setPlaying(false);
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentSlideIndex,
    slideshow,
    isPresenterMode,
    setCurrentSlideIndex,
    setPlaying,
  ]);

  // Keyboard controls
  useEffect(() => {
    if (!isPresenterMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPresenterMode(false);
        setPlaying(false);
      }
      if (e.key === " ") {
        e.preventDefault();
        setPlaying(!isPlaying);
      }
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (slideshow && currentSlideIndex < slideshow.slides.length - 1) {
          setCurrentSlideIndex(currentSlideIndex + 1);
        }
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex(currentSlideIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPresenterMode,
    isPlaying,
    currentSlideIndex,
    slideshow,
    setPresenterMode,
    setPlaying,
    setCurrentSlideIndex,
  ]);

  const togglePlay = useCallback(() => {
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  const nextSlide = useCallback(() => {
    if (slideshow && currentSlideIndex < slideshow.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }, [slideshow, currentSlideIndex, setCurrentSlideIndex]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, setCurrentSlideIndex]);

  const handleClose = useCallback(() => {
    setPresenterMode(false);
    setPlaying(false);
    setElapsed(0);
  }, [setPresenterMode, setPlaying]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isPresenterMode || !slideshow) return null;

  const currentSlide = slideshow.slides[currentSlideIndex];
  const nextSlideData = slideshow.slides[currentSlideIndex + 1];
  const resolution = Resolutions[slideshow.resolution] ?? Resolutions["1080p"];

  return (
    <div className="fixed inset-0 z-50 flex bg-[#1a1a2e]">
      {/* Main slide area (70%) */}
      <div className="flex flex-1 flex-col">
        {/* Slide display */}
        <div className="flex flex-1 items-center justify-center bg-black p-6">
          <div
            className="relative overflow-hidden rounded-lg shadow-2xl"
            style={{
              width: resolution.width,
              height: resolution.height,
              maxWidth: "100%",
              maxHeight: "100%",
              aspectRatio: `${resolution.width} / ${resolution.height}`,
            }}
          >
            {currentSlide && (
              <SlideRenderer
                slide={currentSlide}
                fallbackBg={slideshow.backgroundColor}
                width={resolution.width}
                height={resolution.height}
              />
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex h-14 items-center justify-between border-t border-white/[0.08] bg-[#0a0a1a] px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10 bg-rose-600 hover:bg-rose-700"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              disabled={currentSlideIndex === slideshow.slides.length - 1}
              className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>
              Slide {currentSlideIndex + 1} / {slideshow.slides.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(elapsed)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="mr-1.5 h-4 w-4" />
            Exit
          </Button>
        </div>
      </div>

      {/* Sidebar (30%) - Notes + Next slide */}
      <div className="flex w-[340px] shrink-0 flex-col border-l border-white/[0.08] bg-[#0f0f1e]">
        {/* Next slide preview */}
        <div className="shrink-0 border-b border-white/[0.08] p-4">
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Next Slide
          </h3>
          {nextSlideData ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.1]">
              <SlideRenderer
                slide={nextSlideData}
                fallbackBg={slideshow.backgroundColor}
                width={resolution.width}
                height={resolution.height}
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.02]">
              <p className="text-xs text-slate-600">End of presentation</p>
            </div>
          )}
        </div>

        {/* Presenter notes */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Notes
          </h3>
          {currentSlide?.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {currentSlide.notes}
            </p>
          ) : (
            <p className="text-sm text-slate-600 italic">No notes for this slide</p>
          )}
        </div>

        {/* Timer + slide list */}
        <div className="shrink-0 border-t border-white/[0.08] p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {formatTime(elapsed)} elapsed
            </span>
            <span>
              Slide {currentSlideIndex + 1} of {slideshow.slides.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PresenterModeButton() {
  const { setPresenterMode } = useEditorStore();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPresenterMode(true)}
      className="border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
    >
      <Monitor className="mr-1.5 h-3.5 w-3.5" />
      Present
    </Button>
  );
}
