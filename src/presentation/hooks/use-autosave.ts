"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";

const SAVE_INTERVAL_MS = 3000;

export function useAutosave() {
  const { slideshow, isDirty, markClean } = useEditorStore();
  const savingRef = useRef(false);

  useEffect(() => {
    if (!slideshow || !isDirty) return;

    const timer = setTimeout(async () => {
      if (savingRef.current) return;
      savingRef.current = true;

      try {
        await fetch(`/api/slideshows/${slideshow.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: slideshow.title,
            description: slideshow.description,
            resolution: slideshow.resolution,
            fps: slideshow.fps,
            backgroundColor: slideshow.backgroundColor,
          }),
        });

        for (const slide of slideshow.slides) {
          if (slide.canvasObjects.length > 0) {
            await fetch(`/api/slideshows/${slideshow.id}/slides/${slide.id}/objects`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ objects: slide.canvasObjects }),
            });
          }
        }

        markClean();
      } catch (err) {
        console.error("Autosave failed:", err);
      } finally {
        savingRef.current = false;
      }
    }, SAVE_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [slideshow, isDirty, markClean]);
}
