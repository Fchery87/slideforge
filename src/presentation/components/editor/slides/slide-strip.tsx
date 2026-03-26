"use client";

import { useCallback, useRef } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { SlideThumbnail } from "./slide-thumbnail";
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";
import { nanoid } from "nanoid";
import type { Slide } from "@/domain/slideshow/entities/slide";

export function SlideStrip() {
  const {
    slideshow,
    currentSlideIndex,
    setCurrentSlideIndex,
    addSlide,
    reorderSlides,
    duplicateSlide,
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
      backgroundColor: null,
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
      </div>
    </div>
  );
}
