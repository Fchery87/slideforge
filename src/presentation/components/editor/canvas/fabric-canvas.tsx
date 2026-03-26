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

const getId = (obj: FabricObject): string | null =>
  ((obj as unknown as Record<string, unknown>)._slideforgeId as string) ?? null;

async function canvasObjectToFabric(obj: CanvasObject): Promise<FabricObject | null> {
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
}

export function FabricCanvas({ aspectRatio }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const syncingRef = useRef(false);

  const canvasHeight = CANVAS_WIDTH / aspectRatio;

  // Use refs for values needed in event handlers to avoid re-creating the canvas
  const storeRef = useRef(useEditorStore.getState());
  useEffect(() => {
    return useEditorStore.subscribe((state) => {
      storeRef.current = state;
    });
  }, []);

  // Sync store objects to fabric canvas — called when slide data changes
  const syncStoreToCanvas = useCallback(async () => {
    const canvas = fabricRef.current;
    const state = storeRef.current;
    const currentSlide = state.slideshow?.slides[state.currentSlideIndex] ?? null;
    if (!canvas || !currentSlide) return;

    syncingRef.current = true;
    canvas.clear();

    const slideBg = currentSlide.backgroundColor ?? state.slideshow?.backgroundColor ?? "#1a1a2e";
    canvas.backgroundColor = slideBg;

    for (const obj of currentSlide.canvasObjects) {
      const fabricObj = await canvasObjectToFabric(obj);
      if (fabricObj) {
        (fabricObj as unknown as Record<string, unknown>)._slideforgeId = obj.id;
        canvas.add(fabricObj);
      }
    }

    // Restore selection if an object is selected
    if (state.selectedObjectId) {
      const target = canvas
        .getObjects()
        .find((o) => getId(o) === state.selectedObjectId);
      if (target) {
        canvas.setActiveObject(target);
      }
    }

    canvas.renderAll();
    syncingRef.current = false;
  }, []);

  // Initialize canvas once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: canvasHeight,
      backgroundColor: "#1a1a2e",
      selection: true,
    });

    fabricRef.current = canvas;

    canvas.on("selection:created", (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const id = getId(selected);
        if (id) storeRef.current.selectObject(id);
      }
    });

    canvas.on("selection:updated", (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const id = getId(selected);
        if (id) storeRef.current.selectObject(id);
      }
    });

    canvas.on("selection:cleared", () => {
      storeRef.current.selectObject(null);
    });

    canvas.on("object:modified", (e) => {
      if (syncingRef.current) return;
      const store = storeRef.current;
      const currentSlide = store.slideshow?.slides[store.currentSlideIndex] ?? null;
      if (!currentSlide) return;

      const target = e.target;
      if (!target) return;
      const id = getId(target);
      if (!id) return;

      const scaleX = target.scaleX ?? 1;
      const scaleY = target.scaleY ?? 1;

      store.updateObject(currentSlide.id, id, {
        x: target.left ?? 0,
        y: target.top ?? 0,
        width: (target.width ?? 0) * scaleX,
        height: (target.height ?? 0) * scaleY,
        rotation: target.angle ?? 0,
        opacity: target.opacity ?? 1,
      });

      target.set({ scaleX: 1, scaleY: 1 });
      store.markDirty();
    });

    // Initial sync
    syncStoreToCanvas();

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasHeight, syncStoreToCanvas]);

  // Keyboard shortcuts — use a separate effect with a stable handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = storeRef.current;
      const currentSlide = store.slideshow?.slides[store.currentSlideIndex] ?? null;
      if (!currentSlide) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        store.copy();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        store.paste();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        if (store.selectedObjectId) {
          store.duplicateObject(currentSlide.id, store.selectedObjectId);
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (store.selectedObjectId && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          store.removeObject(currentSlide.id, store.selectedObjectId);
        }
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (store.selectedObjectId) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const obj = currentSlide.canvasObjects.find((o) => o.id === store.selectedObjectId);
          if (obj) {
            let x = obj.x;
            let y = obj.y;
            if (e.key === "ArrowUp") y -= step;
            if (e.key === "ArrowDown") y += step;
            if (e.key === "ArrowLeft") x -= step;
            if (e.key === "ArrowRight") x += step;
            store.updateObject(currentSlide.id, store.selectedObjectId, { x, y });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Re-sync canvas when slide data changes (but NOT on every render)
  const slideDataKey = useRef("");
  useEffect(() => {
    return useEditorStore.subscribe((state) => {
      const currentSlide = state.slideshow?.slides[state.currentSlideIndex];
      if (!currentSlide || syncingRef.current) return;

      // Build a lightweight key from the slide data to detect meaningful changes
      const key = JSON.stringify({
        id: currentSlide.id,
        bg: currentSlide.backgroundColor,
        objects: currentSlide.canvasObjects.map((o) => ({
          id: o.id,
          x: o.x,
          y: o.y,
          w: o.width,
          h: o.height,
          r: o.rotation,
          o: o.opacity,
          z: o.zIndex,
          t: o.type,
          p: o.properties,
        })),
      });

      if (key !== slideDataKey.current) {
        slideDataKey.current = key;
        syncStoreToCanvas();
      }
    });
  }, [syncStoreToCanvas]);

  // Sync selection from store to canvas
  useEffect(() => {
    return useEditorStore.subscribe((state) => {
      const canvas = fabricRef.current;
      if (!canvas || syncingRef.current) return;

      const selectedId = state.selectedObjectId;
      const activeObj = canvas.getActiveObject();
      const activeId = activeObj ? getId(activeObj) : null;

      if (selectedId !== activeId) {
        if (selectedId) {
          const target = canvas.getObjects().find((o) => getId(o) === selectedId);
          if (target) {
            canvas.setActiveObject(target);
            canvas.renderAll();
          }
        } else {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    });
  }, []);

  // Responsive scaling — fit the 960px canvas into the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function applyScale() {
      const wrapper = container!.querySelector(".canvas-container") as HTMLElement | null;
      if (!wrapper) return;

      const containerW = container!.clientWidth;
      const containerH = container!.clientHeight;
      if (containerW === 0 || containerH === 0) return;

      const scale = Math.min(containerW / CANVAS_WIDTH, containerH / canvasHeight);

      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.transformOrigin = "top left";
      // Size the outer wrapper to match the scaled dimensions so it centers in the flex parent
      const scaledW = CANVAS_WIDTH * scale;
      const scaledH = canvasHeight * scale;
      wrapper.style.width = `${CANVAS_WIDTH}px`;
      wrapper.style.height = `${canvasHeight}px`;
      // Update the positioning container
      const inner = container!.querySelector("[data-canvas-sizer]") as HTMLElement | null;
      if (inner) {
        inner.style.width = `${scaledW}px`;
        inner.style.height = `${scaledH}px`;
      }
    }

    // Run on next frame to ensure Fabric has created .canvas-container
    const raf = requestAnimationFrame(applyScale);
    const resizeObserver = new ResizeObserver(() => applyScale());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [canvasHeight]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div data-canvas-sizer className="relative rounded-lg shadow-2xl ring-1 ring-white/[0.06]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
