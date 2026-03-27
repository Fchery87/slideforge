"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  ActiveSelection,
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
import { resolveBackgroundToStyle } from "@/domain/slideshow/value-objects/slide-background";
import { getMediaFileUrl, resolveCanvasImageUrl } from "./media-url";

interface FabricCanvasProps {
  aspectRatio: number;
}

const CANVAS_WIDTH = 960;

const getId = (obj: FabricObject): string | null =>
  ((obj as unknown as Record<string, unknown>)._slideforgeId as string) ?? null;

const snapValue = (value: number, gridSize: number, threshold: number): number => {
  const snapped = Math.round(value / gridSize) * gridSize;
  return Math.abs(snapped - value) <= threshold ? snapped : value;
};

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
        objectFit?: "cover" | "contain" | "fill";
      };
      try {
        const imageUrl = await resolveCanvasImageUrl(props.mediaAssetId);
        const img = await FabricImage.fromURL(
          imageUrl,
          { crossOrigin: "anonymous" }
        );
        
        // Calculate scaling based on objectFit
        const objectFit = props.objectFit || "contain";
        let scaleX = obj.width / (img.width || 1);
        let scaleY = obj.height / (img.height || 1);
        
        if (objectFit === "contain") {
          // Scale uniformly to fit within bounds
          const uniformScale = Math.min(scaleX, scaleY);
          scaleX = uniformScale;
          scaleY = uniformScale;
        } else if (objectFit === "cover") {
          // Scale uniformly to cover entire area
          const uniformScale = Math.max(scaleX, scaleY);
          scaleX = uniformScale;
          scaleY = uniformScale;
        }
        // "fill" uses the original scaleX and scaleY (stretches to fit)
        
        img.set({
          ...base,
          scaleX,
          scaleY,
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
  const expandingGroupSelectionRef = useRef(false);

  const canvasHeight = CANVAS_WIDTH / aspectRatio;

  const syncCanvasSelectionToStore = useCallback((canvas: Canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      storeRef.current.selectObject(null);
      return;
    }

    if ("getObjects" in activeObject && typeof activeObject.getObjects === "function") {
      const ids = activeObject
        .getObjects()
        .map((item: FabricObject) => getId(item))
        .filter(Boolean) as string[];
      if (ids.length > 1) {
        storeRef.current.selectObjects(ids);
        return;
      }
    }

    const id = getId(activeObject);
    storeRef.current.selectObject(id);
  }, []);

  const expandGroupedSelection = useCallback((canvas: Canvas) => {
    if (expandingGroupSelectionRef.current) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || ("getObjects" in activeObject && typeof activeObject.getObjects === "function")) {
      return;
    }

    const activeId = getId(activeObject);
    if (!activeId) return;

    const store = storeRef.current;
    const currentSlide = store.slideshow?.slides[store.currentSlideIndex];
    const currentObject = currentSlide?.canvasObjects.find((item) => item.id === activeId);
    const groupId = currentObject?.groupId;
    if (!currentSlide || !groupId) return;

    const groupIds = currentSlide.canvasObjects
      .filter((item) => item.groupId === groupId)
      .map((item) => item.id);

    if (groupIds.length < 2) return;

    const groupMembers = canvas
      .getObjects()
      .filter((item) => {
        const id = getId(item);
        return !!id && groupIds.includes(id);
      });

    if (groupMembers.length < 2) return;

    expandingGroupSelectionRef.current = true;
    const selection = new ActiveSelection(groupMembers, { canvas });
    canvas.setActiveObject(selection);
    canvas.requestRenderAll();
    store.selectObjects(groupIds);
    expandingGroupSelectionRef.current = false;
  }, []);

  const syncFabricObjectsToStore = useCallback((fabricObjects: FabricObject[]) => {
    const store = storeRef.current;
    const currentSlide = store.slideshow?.slides[store.currentSlideIndex] ?? null;
    if (!currentSlide) return;

    for (const item of fabricObjects) {
      const id = getId(item);
      if (!id) continue;

      const scaleX = item.scaleX ?? 1;
      const scaleY = item.scaleY ?? 1;

      store.updateObject(currentSlide.id, id, {
        x: item.left ?? 0,
        y: item.top ?? 0,
        width: (item.width ?? 0) * scaleX,
        height: (item.height ?? 0) * scaleY,
        rotation: item.angle ?? 0,
        opacity: item.opacity ?? 1,
      });

      item.set({ scaleX: 1, scaleY: 1 });
    }

    store.markDirty();
  }, []);

  const updateGridOverlay = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const wrapper = canvas.wrapperEl;
    if (!wrapper) return;

    let overlay = wrapper.querySelector("[data-slideforge-grid]") as HTMLDivElement | null;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.setAttribute("data-slideforge-grid", "true");
      Object.assign(overlay.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
      });
      wrapper.insertBefore(overlay, wrapper.firstChild);
    }

    const { gridEnabled, gridSize } = storeRef.current;
    if (!gridEnabled) {
      overlay.style.display = "none";
      return;
    }

    overlay.style.display = "block";
    overlay.style.backgroundImage =
      "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)";
    overlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  }, []);

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

    canvas.backgroundColor = "transparent";

    const wrapper = containerRef.current?.querySelector("[data-canvas-sizer]") as HTMLElement | null;
    if (wrapper) {
      Object.assign(
        wrapper.style,
        resolveBackgroundToStyle(
          currentSlide.background,
          state.slideshow?.backgroundColor ?? "#1a1a2e",
          getMediaFileUrl
        )
      );
    }

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
    updateGridOverlay();

    canvas.on("selection:created", () => {
      if (expandingGroupSelectionRef.current) return;
      expandGroupedSelection(canvas);
      syncCanvasSelectionToStore(canvas);
    });

    canvas.on("selection:updated", () => {
      if (expandingGroupSelectionRef.current) return;
      expandGroupedSelection(canvas);
      syncCanvasSelectionToStore(canvas);
    });

    canvas.on("selection:cleared", () => {
      storeRef.current.selectObject(null);
    });

    canvas.on("object:moving", (e) => {
      const target = e.target;
      if (!target || !storeRef.current.snapEnabled) return;

      if ("getObjects" in target && typeof target.getObjects === "function") {
        for (const item of target.getObjects()) {
          item.set({
            left: snapValue(item.left ?? 0, storeRef.current.gridSize, storeRef.current.snapThreshold),
            top: snapValue(item.top ?? 0, storeRef.current.gridSize, storeRef.current.snapThreshold),
          });
        }
        return;
      }

      target.set({
        left: snapValue(target.left ?? 0, storeRef.current.gridSize, storeRef.current.snapThreshold),
        top: snapValue(target.top ?? 0, storeRef.current.gridSize, storeRef.current.snapThreshold),
      });
    });

    canvas.on("object:modified", (e) => {
      if (syncingRef.current) return;
      const target = e.target;
      if (!target) return;

      if ("getObjects" in target && typeof target.getObjects === "function") {
        syncFabricObjectsToStore(target.getObjects());
        syncCanvasSelectionToStore(canvas);
        return;
      }

      syncFabricObjectsToStore([target]);
      syncCanvasSelectionToStore(canvas);
    });

    // Initial sync
    syncStoreToCanvas();

    return () => {
      const wrapper = canvas.wrapperEl;
      wrapper?.querySelector("[data-slideforge-grid]")?.remove();
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasHeight, expandGroupedSelection, syncCanvasSelectionToStore, syncFabricObjectsToStore, syncStoreToCanvas, updateGridOverlay]);

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
        bg: currentSlide.background,
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

      const selectedIds = state.selectedObjectIds;
      const activeObj = canvas.getActiveObject();
      const activeIds = activeObj && "getObjects" in activeObj && typeof activeObj.getObjects === "function"
        ? activeObj.getObjects().map((item: FabricObject) => getId(item)).filter(Boolean) as string[]
        : activeObj
          ? [getId(activeObj)].filter(Boolean) as string[]
          : [];

      if (JSON.stringify(selectedIds) !== JSON.stringify(activeIds)) {
        if (selectedIds.length > 1) {
          const objects = canvas.getObjects().filter((item) => {
            const id = getId(item);
            return !!id && selectedIds.includes(id);
          });
          if (objects.length > 1) {
            const selection = new ActiveSelection(objects, { canvas });
            canvas.setActiveObject(selection);
            canvas.renderAll();
          }
        } else if (selectedIds.length === 1) {
          const target = canvas.getObjects().find((o) => getId(o) === selectedIds[0]);
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

      const baseScale = Math.min(containerW / CANVAS_WIDTH, containerH / canvasHeight);
      const scale = baseScale * storeRef.current.canvasZoom;

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

  useEffect(() => {
    return useEditorStore.subscribe(() => {
      updateGridOverlay();
    });
  }, [updateGridOverlay]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/slideforge-media");
      if (!raw) return;

      try {
        const asset = JSON.parse(raw);
        const store = storeRef.current;
        const currentSlide = store.slideshow?.slides[store.currentSlideIndex];
        if (!currentSlide || asset.type !== "image") return;

        const id = crypto.randomUUID();
        const CANVAS_WIDTH = 960;
        const CANVAS_HEIGHT = 540;
        const PADDING = 80;
        
        // Get asset dimensions or use defaults
        const assetWidth = asset.width ?? 800;
        const assetHeight = asset.height ?? 600;
        
        // Calculate scale to fit within canvas with padding
        const maxWidth = CANVAS_WIDTH - (PADDING * 2);
        const maxHeight = CANVAS_HEIGHT - (PADDING * 2);
        const scale = Math.min(
          maxWidth / assetWidth,
          maxHeight / assetHeight,
          1
        );
        
        const width = Math.round(assetWidth * scale);
        const height = Math.round(assetHeight * scale);
        
        // Center on canvas
        const x = Math.round((CANVAS_WIDTH - width) / 2);
        const y = Math.round((CANVAS_HEIGHT - height) / 2);
        
        store.addObject(currentSlide.id, {
          id,
          slideId: currentSlide.id,
          type: "image",
          x,
          y,
          width,
          height,
          rotation: 0,
          opacity: 1,
          zIndex: currentSlide.canvasObjects.length + 1,
          properties: {
            mediaAssetId: asset.id,
            objectFit: "contain",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        store.selectObject(id);
      } catch {
        // Invalid drag data
      }
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div data-canvas-sizer className="relative rounded-lg shadow-2xl ring-1 ring-white/[0.06]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
