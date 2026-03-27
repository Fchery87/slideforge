"use client";

import { useCallback, useRef, useState } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { SlideThumbnail } from "./slide-thumbnail";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2, Layers, Clock, Sparkles, ListChecks, Play, Flag, X } from "lucide-react";
import { nanoid } from "nanoid";
import type { Slide } from "@/domain/slideshow/entities/slide";
import { migrateLegacyBackgroundColor } from "@/domain/slideshow/value-objects/slide-background";
import { INTRO_OUTRO_TEMPLATES, type IntroOutroTemplate } from "./intro-outro-templates";

export function SlideStrip() {
  const {
    slideshow,
    currentSlideIndex,
    setCurrentSlideIndex,
    addSlide,
    reorderSlides,
    duplicateSlide,
    removeSlide,
    selectedSlideIds,
    selectSlide,
    addSlideToSelection,
    removeSlideFromSelection,
    selectAllSlides,
    clearSlideSelection,
    bulkSetDuration,
    bulkDeleteSlides,
    bulkDuplicateSlides,
  } = useEditorStore();

  const dragIndexRef = useRef<number | null>(null);
  const lastClickedIndexRef = useRef<number | null>(null);
  const [showIntroPicker, setShowIntroPicker] = useState(false);
  const [showOutroPicker, setShowOutroPicker] = useState(false);

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

  const handleSlideClick = useCallback(
    (slideId: string, index: number, e: React.MouseEvent) => {
      if (!slideshow) return;

      // Ctrl/Cmd + Click: toggle selection
      if (e.ctrlKey || e.metaKey) {
        if (selectedSlideIds.includes(slideId)) {
          removeSlideFromSelection(slideId);
        } else {
          addSlideToSelection(slideId);
        }
        return;
      }

      // Shift + Click: range select
      if (e.shiftKey && lastClickedIndexRef.current !== null) {
        const start = Math.min(lastClickedIndexRef.current, index);
        const end = Math.max(lastClickedIndexRef.current, index);
        const rangeIds = slideshow.slides.slice(start, end + 1).map((s) => s.id);
        selectSlide(rangeIds[0]);
        rangeIds.slice(1).forEach((id) => addSlideToSelection(id));
        return;
      }

      // Normal click
      setCurrentSlideIndex(index);
      selectSlide(slideId);
      lastClickedIndexRef.current = index;
    },
    [slideshow, selectedSlideIds, setCurrentSlideIndex, selectSlide, addSlideToSelection, removeSlideFromSelection]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedSlideIds.length === 0) return;
    if (window.confirm(`Delete ${selectedSlideIds.length} slides?`)) {
      bulkDeleteSlides(selectedSlideIds);
    }
  }, [selectedSlideIds, bulkDeleteSlides]);

  const handleBulkDuplicate = useCallback(() => {
    if (selectedSlideIds.length === 0) return;
    bulkDuplicateSlides(selectedSlideIds);
  }, [selectedSlideIds, bulkDuplicateSlides]);

  const handleBulkDuration = useCallback(() => {
    if (selectedSlideIds.length === 0) return;
    const duration = prompt("Enter duration in frames (30 = 1 second):");
    if (duration && !isNaN(Number(duration))) {
      bulkSetDuration(selectedSlideIds, Number(duration));
    }
  }, [selectedSlideIds, bulkSetDuration]);

  const handleAddTemplate = useCallback((template: IntroOutroTemplate, position: "start" | "end") => {
    if (!slideshow) return;
    
    const objects = template.objects.map((obj) => ({
      id: nanoid(),
      slideId: "", // Will be set when slide is created
      type: "text" as const,
      x: obj.x,
      y: obj.y,
      width: 420,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      properties: {
        content: obj.text,
        fontFamily: "Plus Jakarta Sans",
        fontSize: obj.preset === "heading" ? 64 : obj.preset === "subheading" ? 36 : obj.preset === "closing" ? 28 : 24,
        fontColor: "#F8FAFC",
        fontWeight: obj.preset === "heading" || obj.preset === "closing" ? "bold" as const : "normal" as const,
        textAlign: "center" as const,
      },
      sourceAssetId: null,
      animation: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const newSlide: Slide = {
      id: nanoid(),
      slideshowId: slideshow.id,
      order: position === "start" ? 0 : slideshow.slides.length,
      durationFrames: slideshow.fps * 5,
      background: { kind: "solid" as const, color: template.background.color },
      canvasObjects: objects.map((obj) => ({ ...obj, slideId: nanoid() })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addSlide(newSlide);
    setShowIntroPicker(false);
    setShowOutroPicker(false);
    
    if (position === "start") {
      setCurrentSlideIndex(0);
    } else {
      setCurrentSlideIndex(slideshow.slides.length);
    }
  }, [slideshow, addSlide, setCurrentSlideIndex]);

  if (!slideshow) return null;

  const hasMultiSelect = selectedSlideIds.length > 1;

  return (
    <div className="flex flex-col">
      {/* Bulk actions toolbar */}
      {hasMultiSelect && (
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-slate-900/80 px-4 py-2 backdrop-blur-sm">
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
            <ListChecks className="h-3.5 w-3.5" />
            {selectedSlideIds.length} slides selected
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDuration}
              className="h-7 gap-1.5 px-2.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <Clock className="h-3 w-3" />
              Duration
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDuplicate}
              className="h-7 gap-1.5 px-2.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <Layers className="h-3 w-3" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAllSlides}
              className="h-7 gap-1.5 px-2.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <Sparkles className="h-3 w-3" />
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSlideSelection}
              className="h-7 px-2.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </Button>
            <div className="mx-1 h-4 w-px bg-white/[0.08]" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              className="h-7 gap-1.5 px-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Intro picker popover */}
      {showIntroPicker && (
        <div className="absolute bottom-full left-4 z-20 mb-2 w-64 rounded-xl border border-white/[0.08] bg-slate-900 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Add Intro Slide</span>
            <Button variant="ghost" size="icon-xs" onClick={() => setShowIntroPicker(false)}>
              <X className="h-3 w-3 text-slate-400" />
            </Button>
          </div>
          <div className="space-y-1.5">
            {INTRO_OUTRO_TEMPLATES.filter(t => t.category === "intro").map((template) => (
              <button
                key={template.id}
                onClick={() => handleAddTemplate(template, "start")}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.04]"
              >
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Outro picker popover */}
      {showOutroPicker && (
        <div className="absolute bottom-full right-4 z-20 mb-2 w-64 rounded-xl border border-white/[0.08] bg-slate-900 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Add Outro Slide</span>
            <Button variant="ghost" size="icon-xs" onClick={() => setShowOutroPicker(false)}>
              <X className="h-3 w-3 text-slate-400" />
            </Button>
          </div>
          <div className="space-y-1.5">
            {INTRO_OUTRO_TEMPLATES.filter(t => t.category === "outro").map((template) => (
              <button
                key={template.id}
                onClick={() => handleAddTemplate(template, "end")}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.04]"
              >
                <Flag className="h-3.5 w-3.5 text-rose-400" />
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slide thumbnails */}
      <div className="relative flex h-full items-center gap-2 overflow-x-auto px-4 py-2">
        {/* Add Intro button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowIntroPicker(!showIntroPicker);
            setShowOutroPicker(false);
          }}
          className="shrink-0 gap-1 text-[10px] text-slate-500 hover:text-slate-300"
        >
          <Play className="h-3 w-3 text-emerald-400/70" />
          Intro
        </Button>

        {slideshow.slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={index}
            isActive={index === currentSlideIndex}
            isSelected={selectedSlideIds.includes(slide.id)}
            onClick={(e) => handleSlideClick(slide.id, index, e)}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          />
        ))}

        {/* Add Outro button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowOutroPicker(!showOutroPicker);
            setShowIntroPicker(false);
          }}
          className="shrink-0 gap-1 text-[10px] text-slate-500 hover:text-slate-300"
        >
          <Flag className="h-3 w-3 text-rose-400/70" />
          Outro
        </Button>

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
          {slideshow.slides.length > 0 && !hasMultiSelect && (
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
          {slideshow.slides.length > 1 && !hasMultiSelect && (
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
    </div>
  );
}
