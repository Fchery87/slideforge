"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";

const SAVE_INTERVAL_MS = 3000;

export async function persistSlideshow(slideshow: Slideshow) {
  await fetch(`/api/slideshows/${slideshow.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: slideshow.title,
      description: slideshow.description,
      resolution: slideshow.resolution,
      fps: slideshow.fps,
      backgroundColor: slideshow.backgroundColor,
      theme: slideshow.theme,
    }),
  });

  for (const slide of slideshow.slides) {
    await fetch(`/api/slideshows/${slideshow.id}/slides/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        background: slide.background,
        durationFrames: slide.durationFrames,
        effects: slide.effects,
        notes: slide.notes,
        layoutId: slide.layoutId,
      }),
    });

    await fetch(`/api/slideshows/${slideshow.id}/slides/${slide.id}/objects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objects: slide.canvasObjects }),
    });
  }
}

export function useAutosave() {
  const { slideshow, isDirty, markClean, setLastSavedAt } = useEditorStore();
  const savingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  const save = useCallback(async () => {
    if (!slideshow || savingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    savingRef.current = true;
    pendingSaveRef.current = false;

    try {
      await persistSlideshow(slideshow);
      setLastSavedAt(Date.now());
      markClean();
    } catch (err) {
      console.error("Autosave failed:", err);
    } finally {
      savingRef.current = false;
      // If a save was requested while we were saving, save again
      if (pendingSaveRef.current) {
        save();
      }
    }
  }, [slideshow, markClean, setLastSavedAt]);

  useEffect(() => {
    if (!slideshow || !isDirty) return;

    const timer = setTimeout(save, SAVE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [slideshow, isDirty, save]);

  // Expose manual save trigger
  return { save, isSaving: savingRef.current };
}
