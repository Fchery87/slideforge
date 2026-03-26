"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward, X } from "lucide-react";

export function PreviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { slideshow, currentSlideIndex, setCurrentSlideIndex } = useEditorStore();

  const openPreview = useCallback(() => {
    setIsOpen(true);
    setIsPlaying(false);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

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

  useEffect(() => {
    const handleOpenPreview = () => openPreview();
    window.addEventListener("open-preview-modal", handleOpenPreview);
    return () => window.removeEventListener("open-preview-modal", handleOpenPreview);
  }, [openPreview]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
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
  }, [isOpen, closePreview, togglePlay, nextSlide, prevSlide]);

  if (!isOpen || !slideshow) return null;

  const currentSlide = slideshow.slides[currentSlideIndex];
  const resolution = slideshow.resolution === "1080p" ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };

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
          {/* Slide Content */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: currentSlide?.backgroundColor || slideshow.backgroundColor || "#1a1a2e",
            }}
          >
            <p className="text-slate-400">
              Preview placeholder - {currentSlide?.canvasObjects.length || 0} objects
            </p>
          </div>
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
      </div>
    </div>
  );
}

export function PreviewButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const event = new CustomEvent("open-preview-modal");
        window.dispatchEvent(event);
      }}
      className="border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
    >
      <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
      Fullscreen Preview
    </Button>
  );
}
