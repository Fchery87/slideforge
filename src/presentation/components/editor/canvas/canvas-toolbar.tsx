"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Triangle,
  ImagePlus,
} from "lucide-react";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import { nanoid } from "nanoid";

const shapeOptions = [
  { type: "rectangle" as const, icon: Square, label: "Rectangle" },
  { type: "circle" as const, icon: Circle, label: "Circle" },
  { type: "triangle" as const, icon: Triangle, label: "Triangle" },
];

export function CanvasToolbar() {
  const { slideshow, currentSlideIndex, addObject } = useEditorStore();
  const currentSlide = slideshow?.slides[currentSlideIndex] ?? null;

  const addCanvasObject = useCallback(
    (obj: Omit<CanvasObject, "id" | "slideId" | "createdAt" | "updatedAt">) => {
      if (!currentSlide) return;
      const id = nanoid();
      addObject(currentSlide.id, {
        ...obj,
        id,
        slideId: currentSlide.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
    [currentSlide, addObject]
  );

  const addText = useCallback(() => {
    addCanvasObject({
      type: "text",
      x: 100,
      y: 100,
      width: 300,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex: (currentSlide?.canvasObjects.length ?? 0) + 1,
      properties: {
        content: "Double-click to edit",
        fontFamily: "Inter",
        fontSize: 32,
        fontColor: "#F8FAFC",
        fontWeight: "normal",
        textAlign: "center",
      },
    });
  }, [addCanvasObject, currentSlide]);

  const addShape = useCallback(
    (shapeType: "rectangle" | "circle" | "triangle") => {
      addCanvasObject({
        type: "shape",
        x: 150,
        y: 150,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        zIndex: (currentSlide?.canvasObjects.length ?? 0) + 1,
        properties: {
          shapeType,
          fill: "#6366F1",
          stroke: "#818CF8",
          strokeWidth: 2,
        },
      });
    },
    [addCanvasObject, currentSlide]
  );

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border-b border-white/[0.08] bg-[#0a0a1a] px-3 py-1.5">
        {/* Select */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-slate-200">
              <MousePointer2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select (V)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-5 bg-white/[0.08]" />

        {/* Add Text */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-slate-400 hover:text-slate-200"
              onClick={addText}
              disabled={!currentSlide}
            >
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Text (T)</TooltipContent>
        </Tooltip>

        {/* Add Shape */}
        {shapeOptions.map(({ type, icon: Icon, label }) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-400 hover:text-slate-200"
                onClick={() => addShape(type)}
                disabled={!currentSlide}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add {label}</TooltipContent>
          </Tooltip>
        ))}

        <Separator orientation="vertical" className="mx-1 h-5 bg-white/[0.08]" />

        {/* Add Image */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-slate-400 hover:text-slate-200"
              disabled={!currentSlide}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Image from Library</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
