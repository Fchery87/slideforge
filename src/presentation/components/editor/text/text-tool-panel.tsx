"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import { Type, Heading1, Heading2, Pilcrow, MessageSquare, CalendarDays, Heart } from "lucide-react";
import { nanoid } from "nanoid";

const TEXT_PRESETS = [
  {
    id: "heading",
    label: "Title",
    icon: Heading1,
    properties: {
      content: "Your Title Here",
      fontFamily: "Plus Jakarta Sans",
      fontSize: 64,
      fontColor: "#F8FAFC",
      fontWeight: "bold" as const,
      textAlign: "center" as const,
    },
  },
  {
    id: "subheading",
    label: "Subtitle",
    icon: Heading2,
    properties: {
      content: "Add a subtitle",
      fontFamily: "Plus Jakarta Sans",
      fontSize: 36,
      fontColor: "#CBD5E1",
      fontWeight: "bold" as const,
      textAlign: "center" as const,
    },
  },
  {
    id: "caption",
    label: "Caption",
    icon: MessageSquare,
    properties: {
      content: "Caption text",
      fontFamily: "Plus Jakarta Sans",
      fontSize: 18,
      fontColor: "#94A3B8",
      fontWeight: "normal" as const,
      textAlign: "center" as const,
    },
  },
  {
    id: "date",
    label: "Date / Location",
    icon: CalendarDays,
    properties: {
      content: "January 1, 2026",
      fontFamily: "Plus Jakarta Sans",
      fontSize: 20,
      fontColor: "#CBD5E1",
      fontWeight: "normal" as const,
      textAlign: "center" as const,
    },
  },
  {
    id: "closing",
    label: "Closing Message",
    icon: Heart,
    properties: {
      content: "Thank You",
      fontFamily: "Plus Jakarta Sans",
      fontSize: 28,
      fontColor: "#F8FAFC",
      fontWeight: "bold" as const,
      textAlign: "center" as const,
    },
  },
  {
    id: "body",
    label: "Body Text",
    icon: Pilcrow,
    properties: {
      content: "Add paragraph copy",
      fontFamily: "Plus Jakarta Sans",
      fontSize: 24,
      fontColor: "#E2E8F0",
      fontWeight: "normal" as const,
      textAlign: "left" as const,
    },
  },
];

export function TextToolPanel() {
  const { slideshow, currentSlideIndex, addObject } = useEditorStore();
  const currentSlide = slideshow?.slides[currentSlideIndex];

  const handleAddText = useCallback((properties: CanvasObject["properties"]) => {
    if (!currentSlide) return;
    const obj: CanvasObject = {
      id: nanoid(),
      slideId: currentSlide.id,
      type: "text",
      x: 96,
      y: 96,
      width: 420,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: currentSlide.canvasObjects.length + 1,
      properties,
      sourceAssetId: null,
      animation: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addObject(currentSlide.id, obj);
  }, [addObject, currentSlide]);

  if (!slideshow || !currentSlide) return null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300">Text Presets</h3>
      </div>
      <p className="text-xs text-slate-500">
        Quick text blocks for title, subheading, and body copy.
      </p>

      <div className="space-y-2">
        {TEXT_PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <Button
              key={preset.id}
              variant="outline"
              onClick={() => handleAddText(preset.properties)}
              className="w-full justify-start gap-2 border-white/[0.08] text-slate-200 hover:bg-white/[0.04]"
            >
              <Icon className="h-4 w-4 text-slate-400" />
              {preset.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
