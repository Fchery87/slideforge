"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignEndVertical,
  Copy,
  Scissors,
  ClipboardPaste,
  Grid3X3
} from "lucide-react";
import type {
  CanvasObject,
  TextProperties,
  ShapeProperties,
  ImageProperties,
} from "@/domain/slideshow/entities/canvas-object";
import { resolveBackgroundToCss, createSolidBackground } from "@/domain/slideshow/value-objects/slide-background";

import { Resolutions } from "@/domain/slideshow/value-objects/resolution";

import {
  EDITOR_FONTS,
  FONT_CATEGORIES,
  type FontCategory,
} from "@/presentation/components/editor/fonts/font-config";

export function ObjectPropertiesPanel() {
  const {
    slideshow,
    currentSlideIndex,
    selectedObjectId,
    updateObject,
    removeObject,
    duplicateObject,
    reorderObjects,
    updateSlide,
    copy,
    paste,
    cut,
  } = useEditorStore();

  const currentSlide = slideshow?.slides[currentSlideIndex] ?? null;

  const selectedObject: CanvasObject | null = useMemo(() => {
    if (!currentSlide || !selectedObjectId) return null;
    return currentSlide.canvasObjects.find((o) => o.id === selectedObjectId) ?? null;
  }, [currentSlide, selectedObjectId]);

  if (!selectedObject && currentSlide) {
    // Show slide properties when no object is selected
    const fps = slideshow?.fps || 30;
    const durationSeconds = currentSlide.durationFrames / fps;

    return (
      <div className="flex flex-col gap-4 p-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Slide {currentSlideIndex + 1} Properties
        </h3>
        <Separator className="bg-white/[0.08]" />
        
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">
            Duration (seconds)
          </Label>
          <Input
            type="number"
            min={0.5}
            max={60}
            step={0.5}
            value={durationSeconds}
            onChange={(e) => {
              const seconds = Number(e.target.value);
              updateSlide(currentSlideIndex, { 
                durationFrames: Math.round(seconds * fps) 
              });
            }}
            className="h-7 bg-white/[0.04] text-xs"
          />
          <p className="mt-1 text-[10px] text-slate-500">
            {currentSlide.durationFrames} frames at {fps}fps
          </p>
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">
            Background Color
          </Label>
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="color"
              value={resolveBackgroundToCss(currentSlide.background, slideshow?.backgroundColor ?? "#1a1a2e")}
              onChange={(e) => updateSlide(currentSlideIndex, { background: createSolidBackground(e.target.value) })}
              className="h-7 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
            />
            <Input
              value={resolveBackgroundToCss(currentSlide.background, slideshow?.backgroundColor ?? "#1a1a2e")}
              onChange={(e) => updateSlide(currentSlideIndex, { background: createSolidBackground(e.target.value) })}
              className="h-7 bg-white/[0.04] text-xs"
            />
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs text-slate-500">
            {currentSlide.canvasObjects.length} object{currentSlide.canvasObjects.length !== 1 ? 's' : ''} on this slide
          </p>
        </div>
      </div>
    );
  }

  if (!selectedObject) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <p className="text-center text-sm text-slate-500">
          Select an object on the canvas to edit its properties
        </p>
      </div>
    );
  }

  const update = (data: Partial<CanvasObject>) => {
    if (!currentSlide) return;
    updateObject(currentSlide.id, selectedObject.id, data);
  };

  const updateProperties = (props: Record<string, unknown>) => {
    update({
      properties: { ...selectedObject.properties, ...props } as CanvasObject["properties"],
    });
  };

  const handleDelete = () => {
    if (!currentSlide) return;
    removeObject(currentSlide.id, selectedObject.id);
  };

  const handleDuplicate = () => {
    if (!currentSlide) return;
    duplicateObject(currentSlide.id, selectedObject.id);
  };

  const handleCopy = () => {
    copy();
  };

  const handleCut = () => {
    cut();
  };

  const handlePaste = () => {
    paste();
  };

  const bringToFront = () => {
    if (!currentSlide) return;
    const maxZIndex = Math.max(...currentSlide.canvasObjects.map((o) => o.zIndex), 0);
    update({ zIndex: maxZIndex + 1 });
  };

  const sendToBack = () => {
    if (!currentSlide) return;
    const minZIndex = Math.min(...currentSlide.canvasObjects.map((o) => o.zIndex));
    update({ zIndex: minZIndex > 0 ? minZIndex - 1 : 0 });
  };

  const bringForward = () => {
    if (!currentSlide) return;
    reorderObjects(currentSlide.id, selectedObject.id, "up");
  };

  const sendBackward = () => {
    if (!currentSlide) return;
    reorderObjects(currentSlide.id, selectedObject.id, "down");
  };

  const alignLeft = () => {
    update({ x: 0 });
  };

  const alignCenter = () => {
    if (!currentSlide || !slideshow) return;
    const { width: slideWidth } = Resolutions[slideshow.resolution];
    update({ x: (slideWidth - selectedObject.width) / 2 });
  };

  const alignRight = () => {
    if (!slideshow) return;
    const { width: slideWidth } = Resolutions[slideshow.resolution];
    update({ x: slideWidth - selectedObject.width });
  };

  const alignTop = () => {
    update({ y: 0 });
  };

  const alignMiddle = () => {
    if (!currentSlide || !slideshow) return;
    const { height: slideHeight } = Resolutions[slideshow.resolution];
    update({ y: (slideHeight - selectedObject.height) / 2 });
  };

  const alignBottom = () => {
    if (!slideshow) return;
    const { height: slideHeight } = Resolutions[slideshow.resolution];
    update({ y: slideHeight - selectedObject.height });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize text-slate-200">
          {selectedObject.type} Properties
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            className="text-slate-500 hover:text-slate-300"
            title="Copy (Ctrl+C)"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCut}
            className="text-slate-500 hover:text-slate-300"
            title="Cut (Ctrl+X)"
          >
            <Scissors className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handlePaste}
            className="text-slate-500 hover:text-slate-300"
            title="Paste (Ctrl+V)"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDuplicate}
            className="text-slate-500 hover:text-slate-300"
            title="Duplicate (Ctrl+D)"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            className="text-slate-500 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Position & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">X</Label>
          <Input
            type="number"
            value={Math.round(selectedObject.x)}
            onChange={(e) => update({ x: Number(e.target.value) })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Y</Label>
          <Input
            type="number"
            value={Math.round(selectedObject.y)}
            onChange={(e) => update({ y: Number(e.target.value) })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">W</Label>
          <Input
            type="number"
            value={Math.round(selectedObject.width)}
            onChange={(e) => update({ width: Number(e.target.value) })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">H</Label>
          <Input
            type="number"
            value={Math.round(selectedObject.height)}
            onChange={(e) => update({ height: Number(e.target.value) })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
      </div>

      {/* Opacity & Rotation */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Opacity</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={selectedObject.opacity}
            onChange={(e) => update({ opacity: Number(e.target.value) })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Rotation</Label>
          <Input
            type="number"
            value={Math.round(selectedObject.rotation)}
            onChange={(e) => update({ rotation: Number(e.target.value) })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Layer Management */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          <Layers className="mr-1 inline h-3 w-3" />
          Layer Order
        </Label>
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={bringToFront}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <ArrowUp className="mr-1 h-3 w-3" />
            To Front
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={bringForward}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <ArrowUp className="mr-1 h-3 w-3" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={sendBackward}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <ArrowDown className="mr-1 h-3 w-3" />
            Backward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={sendToBack}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <ArrowDown className="mr-1 h-3 w-3" />
            To Back
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          Z-Index: {selectedObject.zIndex}
        </p>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Alignment Tools */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          <AlignHorizontalJustifyCenter className="mr-1 inline h-3 w-3" />
          Align
        </Label>
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={alignLeft}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <AlignLeft className="mr-1 h-3 w-3" />
            Left
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={alignCenter}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <AlignHorizontalJustifyCenter className="mr-1 h-3 w-3" />
            Center
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={alignRight}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <AlignRight className="mr-1 h-3 w-3" />
            Right
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={alignTop}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <AlignStartVertical className="mr-1 h-3 w-3" />
            Top
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={alignMiddle}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <AlignVerticalJustifyCenter className="mr-1 h-3 w-3" />
            Middle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={alignBottom}
            className="h-7 text-[10px] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
          >
            <AlignEndVertical className="mr-1 h-3 w-3" />
            Bottom
          </Button>
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Type-specific properties */}
      {selectedObject.type === "text" && (
        <TextPropertiesEditor
          properties={selectedObject.properties as TextProperties}
          onUpdate={updateProperties}
        />
      )}
      {selectedObject.type === "shape" && (
        <ShapePropertiesEditor
          properties={selectedObject.properties as ShapeProperties}
          onUpdate={updateProperties}
        />
      )}
      {selectedObject.type === "image" && (
        <ImagePropertiesEditor
          properties={selectedObject.properties as ImageProperties}
          onUpdate={updateProperties}
        />
      )}
    </div>
  );
}

function TextPropertiesEditor({
  properties,
  onUpdate,
}: {
  properties: TextProperties;
  onUpdate: (props: Partial<TextProperties>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-slate-500">Content</Label>
        <textarea
          value={properties.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={3}
          className="mt-1 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-ring"
        />
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wider text-slate-500">Font Family</Label>
        <select
          value={properties.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="mt-1 h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-slate-200 outline-none"
          style={{ fontFamily: properties.fontFamily }}
        >
          {FONT_CATEGORIES.map((cat) => (
            <optgroup key={cat.value} label={cat.label}>
              {EDITOR_FONTS.filter((f) => f.category === cat.value).map((f) => (
                <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                  {f.family}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Size</Label>
          <Input
            type="number"
            min={8}
            max={200}
            value={properties.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Color</Label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={properties.fontColor}
              onChange={(e) => onUpdate({ fontColor: e.target.value })}
              className="h-7 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
            />
            <Input
              value={properties.fontColor}
              onChange={(e) => onUpdate({ fontColor: e.target.value })}
              className="h-7 bg-white/[0.04] text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Weight</Label>
          <select
            value={properties.fontWeight}
            onChange={(e) =>
              onUpdate({ fontWeight: e.target.value as "normal" | "bold" })
            }
            className="mt-1 h-7 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-slate-200 outline-none"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Align</Label>
          <select
            value={properties.textAlign}
            onChange={(e) =>
              onUpdate({ textAlign: e.target.value as "left" | "center" | "right" })
            }
            className="mt-1 h-7 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-slate-200 outline-none"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Typography */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          Typography
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-slate-500">Line Height</Label>
            <Input
              type="number"
              min={0.5}
              max={3}
              step={0.1}
              value={properties.lineHeight || 1.2}
              onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
              className="h-7 bg-white/[0.04] text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-slate-500">Letter Spacing</Label>
            <Input
              type="number"
              min={-5}
              max={20}
              step={0.5}
              value={properties.letterSpacing || 0}
              onChange={(e) => onUpdate({ letterSpacing: Number(e.target.value) })}
              className="h-7 bg-white/[0.04] text-xs"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Background */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          Background
        </Label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={properties.backgroundColor || "transparent"}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value === "transparent" ? undefined : e.target.value })}
            className="h-7 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
          />
          <Input
            value={properties.backgroundColor || "transparent"}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value === "transparent" ? undefined : e.target.value })}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
        {properties.backgroundColor && (
          <div className="mt-2">
            <Label className="text-[10px] uppercase tracking-wider text-slate-500">Padding</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={properties.padding || 10}
              onChange={(e) => onUpdate({ padding: Number(e.target.value) })}
              className="h-7 bg-white/[0.04] text-xs"
            />
          </div>
        )}
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Text Shadow */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          Text Shadow
        </Label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={properties.textShadow?.color || "#000000"}
            onChange={(e) => onUpdate({ 
              textShadow: { 
                ...(properties.textShadow || { blur: 4, offsetX: 2, offsetY: 2 }),
                color: e.target.value 
              } 
            })}
            className="h-7 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
          />
          <Input
            type="number"
            min={0}
            max={20}
            value={properties.textShadow?.blur || 0}
            onChange={(e) => onUpdate({ 
              textShadow: { 
                ...(properties.textShadow || { color: "#000000", offsetX: 2, offsetY: 2 }),
                blur: Number(e.target.value) 
              } 
            })}
            placeholder="Blur"
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
        {properties.textShadow && properties.textShadow.blur > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-slate-500">Offset X</Label>
              <Input
                type="number"
                value={properties.textShadow.offsetX}
                onChange={(e) => {
                  const currentShadow = properties.textShadow!;
                  onUpdate({ 
                    textShadow: { 
                      color: currentShadow.color,
                      blur: currentShadow.blur,
                      offsetX: Number(e.target.value),
                      offsetY: currentShadow.offsetY
                    }
                  });
                }}
                className="h-7 bg-white/[0.04] text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-slate-500">Offset Y</Label>
              <Input
                type="number"
                value={properties.textShadow.offsetY}
                onChange={(e) => {
                  const currentShadow = properties.textShadow!;
                  onUpdate({ 
                    textShadow: { 
                      color: currentShadow.color,
                      blur: currentShadow.blur,
                      offsetX: currentShadow.offsetX,
                      offsetY: Number(e.target.value)
                    }
                  });
                }}
                className="h-7 bg-white/[0.04] text-xs"
              />
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Text Outline */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          Text Outline
        </Label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={properties.textOutline?.color || "#000000"}
            onChange={(e) => onUpdate({ 
              textOutline: { 
                ...(properties.textOutline || { width: 2 }),
                color: e.target.value 
              } 
            })}
            className="h-7 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
          />
          <Input
            type="number"
            min={0}
            max={10}
            value={properties.textOutline?.width || 0}
            onChange={(e) => onUpdate({ 
              textOutline: { 
                ...(properties.textOutline || { color: "#000000" }),
                width: Number(e.target.value) 
              } 
            })}
            placeholder="Width"
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function ShapePropertiesEditor({
  properties,
  onUpdate,
}: {
  properties: ShapeProperties;
  onUpdate: (props: Partial<ShapeProperties>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-slate-500">Shape Type</Label>
        <select
          value={properties.shapeType}
          onChange={(e) =>
            onUpdate({
              shapeType: e.target.value as "rectangle" | "circle" | "triangle",
            })
          }
          className="mt-1 h-7 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-slate-200 outline-none"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Fill</Label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={properties.fill}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              className="h-7 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
            />
            <Input
              value={properties.fill}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              className="h-7 bg-white/[0.04] text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Stroke</Label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={properties.stroke}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="h-7 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
            />
            <Input
              value={properties.stroke}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="h-7 bg-white/[0.04] text-xs"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wider text-slate-500">Stroke Width</Label>
        <Input
          type="number"
          min={0}
          max={20}
          value={properties.strokeWidth}
          onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
          className="h-7 bg-white/[0.04] text-xs"
        />
      </div>
    </div>
  );
}

function ImagePropertiesEditor({
  properties,
  onUpdate,
}: {
  properties: ImageProperties;
  onUpdate: (props: Partial<ImageProperties>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-slate-500">Asset ID</Label>
        <p className="mt-1 text-xs text-slate-300 font-mono">
          {properties.mediaAssetId.slice(0, 12)}...
        </p>
      </div>

      {properties.objectFit && (
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">Fit Mode</Label>
          <select
            value={properties.objectFit || "cover"}
            onChange={(e) => onUpdate({ objectFit: e.target.value as "cover" | "contain" | "fill" })}
            className="mt-1 h-7 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-slate-200 outline-none"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </div>
      )}

      <p className="text-[10px] text-slate-500">
        Use the position and size controls above to transform this image.
        Drag a new image from the sidebar to replace.
      </p>
    </div>
  );
}
