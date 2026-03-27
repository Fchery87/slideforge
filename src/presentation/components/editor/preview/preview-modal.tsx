"use client";

import { useCallback, useEffect } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Maximize2, Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";
import { RemotionPreview } from "./remotion-preview";
import { PreviewControls } from "./preview-controls";

function getSlideStartFrame(slideshow: NonNullable<ReturnType<typeof useEditorStore.getState>["slideshow"]>, slideIndex: number) {
  let frame = 0;

  for (let index = 0; index < slideIndex; index++) {
    frame += slideshow.slides[index].durationFrames;
    const transition = slideshow.transitions.find(
      (item) =>
        item.fromSlideId === slideshow.slides[index].id &&
        item.toSlideId === slideshow.slides[index + 1]?.id
    );

    if (transition) {
      frame -= transition.durationFrames;
    }
  }

  return frame;
}

export function PreviewModal() {
  const {
    slideshow,
    currentSlideIndex,
    setCurrentSlideIndex,
    isPreviewMode,
    isPlaying,
    setPlaying,
    setPreviewMode,
    currentFrame,
    setCurrentFrame,
  } = useEditorStore();

  const closePreview = useCallback(() => {
    setPreviewMode(false);
    setPlaying(false);
  }, [setPlaying, setPreviewMode]);

  const togglePlay = useCallback(() => {
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  const nextSlide = useCallback(() => {
    if (slideshow && currentSlideIndex < slideshow.slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      setCurrentFrame(getSlideStartFrame(slideshow, nextIndex));
    }
  }, [slideshow, currentSlideIndex, setCurrentFrame, setCurrentSlideIndex]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const previousIndex = currentSlideIndex - 1;
      if (!slideshow) return;
      setCurrentSlideIndex(previousIndex);
      setCurrentFrame(getSlideStartFrame(slideshow, previousIndex));
    }
  }, [currentSlideIndex, setCurrentFrame, setCurrentSlideIndex, slideshow]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPreviewMode) return;
      
      if (e.key === "Escape") {
        closePreview();
      }
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowRight") {
        nextSlide();
      }
      if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewMode, closePreview, togglePlay, nextSlide, prevSlide]);

  useEffect(() => {
    if (!slideshow) return;

    for (let index = slideshow.slides.length - 1; index >= 0; index--) {
      const startFrame = getSlideStartFrame(slideshow, index);
      if (currentFrame >= startFrame) {
        if (index !== currentSlideIndex) {
          setCurrentSlideIndex(index);
        }
        break;
      }
    }
  }, [currentFrame, currentSlideIndex, setCurrentSlideIndex, slideshow]);

  if (!isPreviewMode || !slideshow) return null;

  const resolution = Resolutions[slideshow.resolution] ?? Resolutions["1080p"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#0a0a1a] px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-200">
            {slideshow.title}
          </span>
          <span className="text-xs text-slate-500">
            Slide {currentSlideIndex + 1} of {slideshow.slides.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={closePreview}
          className="text-slate-400 hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex flex-1 items-center justify-center bg-black p-8">
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl"
          style={{
            width: resolution.width,
            height: resolution.height,
            maxWidth: "100%",
            maxHeight: "calc(100vh - 140px)",
            aspectRatio: `${resolution.width} / ${resolution.height}`,
          }}
        >
          <RemotionPreview />
        </div>
      </div>

      {/* Controls */}
      <div className="flex h-16 items-center justify-center gap-4 border-t border-white/10 bg-[#0a0a1a] px-4">
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
          className="h-12 w-12 bg-rose-600 hover:bg-rose-700"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlideIndex === (slideshow?.slides.length || 0) - 1}
          className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        <span className="ml-2 text-xs text-slate-500">
          Frame {Math.min(currentFrame, Math.max(getTotalDurationFrames(slideshow) - 1, 0)) + 1}
        </span>
      </div>

      <div className="border-t border-white/10 bg-[#080814]">
        <PreviewControls className="mx-auto max-w-4xl" />
      </div>
    </div>
  );
}

export function PreviewButton() {
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPreviewMode(true)}
      className="border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
    >
      <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
      Fullscreen Preview
    </Button>
  );
}
