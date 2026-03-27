"use client";

import { useCallback, useRef } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { SlideThumbnail } from "./slide-thumbnail";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import type { Slide } from "@/domain/slideshow/entities/slide";
import { migrateLegacyBackgroundColor } from "@/domain/slideshow/value-objects/slide-background";

export function SlideStrip() {
  const {
    slideshow,
    currentSlideIndex,
    setCurrentSlideIndex,
    addSlide,
    reorderSlides,
    duplicateSlide,
    removeSlide,
  } = useEditorStore();

  const dragIndexRef = useRef<number | null>(null);

  const handleAddSlide = useCallback(() => {
    if (!slideshow) return;
    const order = slideshow.slides.length;
    const newSlide: Slide = {
      id: nanoid(),
      slideshowId: slideshow.id,
      order,
      durationFrames: slideshow.fps * 5,
      background: migrateLegacyBackgroundColor(null),
      canvasObjects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addSlide(newSlide);
    setCurrentSlideIndex(order);
  }, [slideshow, addSlide, setCurrentSlideIndex]);

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      const fromIndex = dragIndexRef.current;
      if (fromIndex === null || fromIndex === targetIndex) return;
      reorderSlides(fromIndex, targetIndex);
      dragIndexRef.current = null;
    },
    [reorderSlides]
  );

  if (!slideshow) return null;

  return (
    <div className="flex h-full items-center gap-2 overflow-x-auto px-4 py-2">
      {slideshow.slides.map((slide, index) => (
        <SlideThumbnail
          key={slide.id}
          slide={slide}
          index={index}
          isActive={index === currentSlideIndex}
          onClick={() => setCurrentSlideIndex(index)}
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
        />
      ))}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSlide}
          className="shrink-0 border-dashed border-white/[0.1] bg-transparent text-slate-500 hover:border-white/[0.2] hover:text-slate-300"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Slide
        </Button>
        {slideshow.slides.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const currentSlide = slideshow.slides[currentSlideIndex];
              if (currentSlide) duplicateSlide(currentSlide.id);
            }}
            className="shrink-0 border-dashed border-white/[0.1] bg-transparent text-slate-500 hover:border-white/[0.2] hover:text-slate-300"
          >
            <Copy className="mr-1 h-3.5 w-3.5" />
            Duplicate
          </Button>
        )}
        {slideshow.slides.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const currentSlide = slideshow.slides[currentSlideIndex];
              if (currentSlide && window.confirm("Delete this slide?")) {
                removeSlide(currentSlide.id);
              }
            }}
            className="shrink-0 border-dashed border-red-500/30 bg-transparent text-red-300 hover:border-red-400 hover:text-red-200"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete Slide
          </Button>
        )}
      </div>
    </div>
  );
}
