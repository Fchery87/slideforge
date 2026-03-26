"use client";

import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";

export function useKeyboardShortcuts() {
  const {
    slideshow,
    currentSlideIndex,
    selectedObjectId,
    isEditMode,
    isPlaying,
    setCurrentSlideIndex,
    selectObject,
    setPlaying,
    removeObject,
    toggleEditMode,
  } = useEditorStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!slideshow) return;

      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentSlideIndex > 0) setCurrentSlideIndex(currentSlideIndex - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentSlideIndex < slideshow.slides.length - 1)
            setCurrentSlideIndex(currentSlideIndex + 1);
          break;
        case "Delete":
        case "Backspace":
          if (selectedObjectId && isEditMode) {
            e.preventDefault();
            const slide = slideshow.slides[currentSlideIndex];
            if (slide) removeObject(slide.id, selectedObjectId);
          }
          break;
        case "e":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleEditMode();
          }
          break;
      }
    },
    [slideshow, currentSlideIndex, selectedObjectId, isEditMode, isPlaying, setCurrentSlideIndex, selectObject, setPlaying, removeObject, toggleEditMode]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
