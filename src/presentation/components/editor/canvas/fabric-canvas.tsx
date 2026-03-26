"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Canvas,
  Rect,
  Ellipse,
  Triangle,
  Textbox,
  FabricImage,
  type FabricObject,
} from "fabric";
import { useEditorStore } from "@/presentation/stores/editor-store";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";

interface FabricCanvasProps {
  aspectRatio: number;
}

const CANVAS_WIDTH = 960;

export function FabricCanvas({ aspectRatio }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const syncingRef = useRef(false);

  const {
    slideshow,
    currentSlideIndex,
    selectedObjectId,
    selectObject,
    updateObject,
    removeObject,
    duplicateObject,
    copy,
    paste,
    markDirty,
  } = useEditorStore();

  const currentSlide = slideshow?.slides[currentSlideIndex] ?? null;
  const canvasHeight = CANVAS_WIDTH / aspectRatio;

  const canvasObjectToFabric = useCallback(
    async (obj: CanvasObject): Promise<FabricObject | null> => {
      const base = {
        left: obj.x,
        top: obj.y,
        angle: obj.rotation,
        opacity: obj.opacity,
        selectable: true,
        evented: true,
      } as const;

      switch (obj.type) {
        case "text": {
          const props = obj.properties as CanvasObject["properties"] & {
            content: string;
            fontFamily: string;
            fontSize: number;
            fontColor: string;
            fontWeight: string;
            textAlign: string;
          };
          return new Textbox(props.content, {
            ...base,
            width: obj.width,
            height: obj.height,
            fontFamily: props.fontFamily,
            fontSize: props.fontSize,
            fill: props.fontColor,
            fontWeight: props.fontWeight as "normal" | "bold",
            textAlign: props.textAlign as "left" | "center" | "right",
          });
        }
        case "shape": {
          const props = obj.properties as CanvasObject["properties"] & {
            shapeType: string;
            fill: string;
            stroke: string;
            strokeWidth: number;
          };
          if (props.shapeType === "rectangle") {
            return new Rect({
              ...base,
              width: obj.width,
              height: obj.height,
              fill: props.fill,
              stroke: props.stroke,
              strokeWidth: props.strokeWidth,
            });
          }
          if (props.shapeType === "circle") {
            return new Ellipse({
              ...base,
              rx: obj.width / 2,
              ry: obj.height / 2,
              fill: props.fill,
              stroke: props.stroke,
              strokeWidth: props.strokeWidth,
            });
          }
          if (props.shapeType === "triangle") {
            return new Triangle({
              ...base,
              width: obj.width,
              height: obj.height,
              fill: props.fill,
              stroke: props.stroke,
              strokeWidth: props.strokeWidth,
            });
          }
          return null;
        }
        case "image": {
          const props = obj.properties as CanvasObject["properties"] & {
            mediaAssetId: string;
          };
          try {
            const img = await FabricImage.fromURL(
              `/api/media/${props.mediaAssetId}/file`,
              { crossOrigin: "anonymous" }
            );
            img.set({
              ...base,
              scaleX: obj.width / (img.width || 1),
              scaleY: obj.height / (img.height || 1),
            });
            return img;
          } catch {
            return null;
          }
        }
        default:
          return null;
      }
    },
    []
  );

  const syncStoreToCanvas = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas || !currentSlide) return;

    syncingRef.current = true;
    canvas.clear();

    const slideBg = currentSlide.backgroundColor ?? slideshow?.backgroundColor ?? "#1a1a2e";
    canvas.backgroundColor = slideBg;

    for (const obj of currentSlide.canvasObjects) {
      const fabricObj = await canvasObjectToFabric(obj);
      if (fabricObj) {
        (fabricObj as unknown as Record<string, unknown>)._slideforgeId = obj.id;
        canvas.add(fabricObj);
      }
    }

    canvas.renderAll();
    syncingRef.current = false;
  }, [currentSlide, slideshow?.backgroundColor, canvasObjectToFabric]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: canvasHeight,
      backgroundColor: "#1a1a2e",
      selection: true,
    });

    fabricRef.current = canvas;

    const getId = (obj: FabricObject): string | null =>
      ((obj as unknown as Record<string, unknown>)._slideforgeId as string) ?? null;

    canvas.on("selection:created", (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const id = getId(selected);
        if (id) selectObject(id);
      }
    });

    canvas.on("selection:updated", (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const id = getId(selected);
        if (id) selectObject(id);
      }
    });

    canvas.on("selection:cleared", () => {
      selectObject(null);
    });

    canvas.on("object:modified", (e) => {
      if (syncingRef.current || !currentSlide) return;
      const target = e.target;
      if (!target) return;
      const id = getId(target);
      if (!id) return;

      const scaleX = target.scaleX ?? 1;
      const scaleY = target.scaleY ?? 1;

      updateObject(currentSlide.id, id, {
        x: target.left ?? 0,
        y: target.top ?? 0,
        width: (target.width ?? 0) * scaleX,
        height: (target.height ?? 0) * scaleY,
        rotation: target.angle ?? 0,
        opacity: target.opacity ?? 1,
      });

      target.set({ scaleX: 1, scaleY: 1 });
      markDirty();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentSlide) return;
      
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        copy();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        paste();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        if (selectedObjectId) {
          duplicateObject(currentSlide.id, selectedObjectId);
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          removeObject(currentSlide.id, selectedObjectId);
        }
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (selectedObjectId) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const obj = currentSlide.canvasObjects.find(o => o.id === selectedObjectId);
          if (obj) {
            let x = obj.x;
            let y = obj.y;
            if (e.key === "ArrowUp") y -= step;
            if (e.key === "ArrowDown") y += step;
            if (e.key === "ArrowLeft") x -= step;
            if (e.key === "ArrowRight") x += step;
            updateObject(currentSlide.id, selectedObjectId, { x, y });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasHeight, selectObject, updateObject, markDirty, currentSlide, selectedObjectId, copy, paste, duplicateObject, removeObject]);

  useEffect(() => {
    syncStoreToCanvas();
  }, [syncStoreToCanvas]);

  useEffect(() => {
    if (selectedObjectId && fabricRef.current) {
      const obj = fabricRef.current
        .getObjects()
        .find(
          (o) => ((o as unknown as Record<string, unknown>)._slideforgeId as string) === selectedObjectId
        );
      if (obj) {
        fabricRef.current.setActiveObject(obj);
        fabricRef.current.renderAll();
      }
    }
  }, [selectedObjectId]);

  return (
    <div className="relative rounded-lg shadow-2xl ring-1 ring-white/[0.06]">
      <canvas ref={canvasRef} />
    </div>
  );
}
