"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { TransitionType } from "@/domain/slideshow/value-objects/transition-type";

const TRANSITION_TYPES: { value: TransitionType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
  { value: "dissolve", label: "Dissolve" },
  { value: "wipe", label: "Wipe" },
];

export function EffectsPanel() {
  const { slideshow, currentSlideIndex, setTransition } = useEditorStore();

  if (!slideshow) return null;

  const currentSlide = slideshow.slides[currentSlideIndex];
  const nextSlide = slideshow.slides[currentSlideIndex + 1];

  const transition = nextSlide
    ? slideshow.transitions.find(
        (t) => t.fromSlideId === currentSlide?.id && t.toSlideId === nextSlide.id
      )
    : null;

  async function handleSetTransition(type: TransitionType) {
    if (!slideshow || !currentSlide || !nextSlide) return;

    const newTransition = {
      id: transition?.id ?? crypto.randomUUID(),
      slideshowId: slideshow.id,
      fromSlideId: currentSlide.id,
      toSlideId: nextSlide.id,
      type,
      durationFrames: 30,
      easing: "ease-in-out",
      createdAt: new Date(),
    };

    setTransition(newTransition);

    await fetch(`/api/slideshows/${slideshow.id}/transitions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransition),
    });
  }

  return (
    <div className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-300">Transitions</h3>
      {!nextSlide ? (
        <p className="text-xs text-slate-500">Add another slide to set transitions</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Transition to Slide {currentSlideIndex + 2}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TRANSITION_TYPES.map((t) => (
              <Button
                key={t.value}
                variant={transition?.type === t.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSetTransition(t.value)}
                className={`cursor-pointer text-xs ${
                  transition?.type === t.value
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
