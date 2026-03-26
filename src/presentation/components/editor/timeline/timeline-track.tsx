"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { Transition } from "@/domain/slideshow/entities/transition";

type TimelineTrackProps = {
  slides: Slide[];
  transitions: Transition[];
  currentSlideIndex: number;
  pixelsPerFrame: number;
  onSelectSlide: (index: number) => void;
};

export function TimelineTrack({
  slides,
  transitions,
  currentSlideIndex,
  pixelsPerFrame,
  onSelectSlide,
}: TimelineTrackProps) {
  const blocks = useMemo(() => {
    const items: {
      type: "slide" | "transition";
      index: number;
      startFrame: number;
      durationFrames: number;
      id: string;
      color: string;
      label: string;
    }[] = [];

    let frameOffset = 0;

    slides.forEach((slide, i) => {
      const transition =
        i < slides.length - 1
          ? transitions.find(
              (t) =>
                t.fromSlideId === slide.id &&
                t.toSlideId === slides[i + 1]?.id
            )
          : undefined;

      items.push({
        type: "slide",
        index: i,
        startFrame: frameOffset,
        durationFrames: slide.durationFrames,
        id: slide.id,
        color: i === currentSlideIndex ? "bg-primary" : "bg-muted",
        label: `Slide ${i + 1}`,
      });

      frameOffset += slide.durationFrames;

      if (transition) {
        items.push({
          type: "transition",
          index: i,
          startFrame: frameOffset - transition.durationFrames,
          durationFrames: transition.durationFrames,
          id: transition.id,
          color: "bg-accent",
          label: transition.type,
        });
      }
    });

    return items;
  }, [slides, transitions, currentSlideIndex]);

  return (
    <div className="flex h-12 items-stretch gap-px">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={cn(
            "flex h-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-border/50 transition-colors",
            block.type === "slide"
              ? block.color
              : "bg-amber-500/30 border-amber-500/50",
            block.type === "slide" &&
              block.index === currentSlideIndex &&
              "ring-1 ring-ring"
          )}
          style={{
            width: Math.max(block.durationFrames * pixelsPerFrame, 4),
            minWidth: block.type === "transition" ? 8 : 20,
          }}
          onClick={() => {
            if (block.type === "slide") onSelectSlide(block.index);
          }}
          title={block.label}
        >
          <span className="truncate px-1 text-[0.6rem] font-medium text-foreground/80">
            {block.type === "transition"
              ? block.label
              : `S${block.index + 1}`}
          </span>
        </div>
      ))}
    </div>
  );
}
