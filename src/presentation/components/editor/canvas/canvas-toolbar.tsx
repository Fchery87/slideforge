"use client";

import { useCallback, useRef } from "react";
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
  Trash2,
} from "lucide-react";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import { nanoid } from "nanoid";

const shapeOptions = [
  { type: "rectangle" as const, icon: Square, label: "Rectangle" },
  { type: "circle" as const, icon: Circle, label: "Circle" },
  { type: "triangle" as const, icon: Triangle, label: "Triangle" },
];

export function CanvasToolbar() {
  const { slideshow, currentSlideIndex, addObject, selectObject, selectedObjectId, removeObject } =
    useEditorStore();
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
        fontFamily: "Plus Jakarta Sans",
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

  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImageFromFile = useCallback(async (file: File) => {
    if (!currentSlide) return;

    try {
      // Get presigned URL
      const presignRes = await fetch(
        `/api/media/presign?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
        { credentials: "include" }
      );
      if (!presignRes.ok) throw new Error("Failed to get presigned URL");
      const { storageKey } = await presignRes.json();

      // Upload to R2
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storageKey", storageKey);
      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // Get image dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 400, height: 300 });
        img.src = URL.createObjectURL(file);
      });

      // Register in media library
      const confirmRes = await fetch("/api/media", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          type: "image",
          storageKey,
          width: dimensions.width,
          height: dimensions.height,
        }),
      });
      if (!confirmRes.ok) throw new Error("Failed to register media");
      const asset = await confirmRes.json();

      // Add to canvas - center and scale appropriately
      const id = nanoid();
      const CANVAS_WIDTH = 960;
      const CANVAS_HEIGHT = 540; // 16:9 aspect ratio
      const PADDING = 80;
      
      // Calculate scale to fit within canvas with padding, preserving aspect ratio
      const maxWidth = CANVAS_WIDTH - (PADDING * 2);
      const maxHeight = CANVAS_HEIGHT - (PADDING * 2);
      const scale = Math.min(
        maxWidth / dimensions.width,
        maxHeight / dimensions.height,
        1
      );
      
      const width = Math.round(dimensions.width * scale);
      const height = Math.round(dimensions.height * scale);
      
      // Center on canvas
      const x = Math.round((CANVAS_WIDTH - width) / 2);
      const y = Math.round((CANVAS_HEIGHT - height) / 2);
      
      addObject(currentSlide.id, {
        id,
        slideId: currentSlide.id,
        type: "image",
        x,
        y,
        width,
        height,
        rotation: 0,
        opacity: 1,
        zIndex: (currentSlide.canvasObjects.length ?? 0) + 1,
        properties: {
          mediaAssetId: asset.id,
          objectFit: "contain",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      selectObject(id);
    } catch (err) {
      console.error("Failed to add image:", err);
    }
  }, [currentSlide, addObject, selectObject]);

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
              onClick={() => imageInputRef.current?.click()}
              disabled={!currentSlide}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Image from Library</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-5 bg-white/[0.08]" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-slate-400 hover:text-red-400"
              onClick={() => {
                if (currentSlide && selectedObjectId) {
                  removeObject(currentSlide.id, selectedObjectId);
                }
              }}
              disabled={!currentSlide || !selectedObjectId}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Selected Object</TooltipContent>
        </Tooltip>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addImageFromFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </TooltipProvider>
  );
}
