"use client";

import { useState } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import { nanoid } from "nanoid";

const FONTS = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Impact",
  "Comic Sans MS",
];

export function TextToolPanel() {
  const { slideshow, currentSlideIndex, addObject } = useEditorStore();
  const [text, setText] = useState("Your Text Here");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState("#ffffff");

  if (!slideshow) return null;

  const currentSlide = slideshow.slides[currentSlideIndex];
  if (!currentSlide) return null;

  function handleAddText() {
    const sl = useEditorStore.getState().slideshow;
    const cs = sl?.slides[currentSlideIndex];
    if (!sl || !cs) return;

    const obj: CanvasObject = {
      id: nanoid(),
      slideId: currentSlide.id,
      type: "text",
      x: 100,
      y: 100,
      width: 300,
      height: 60,
      rotation: 0,
      opacity: 100,
      zIndex: currentSlide.canvasObjects.length,
      properties: {
        content: text,
        fontFamily,
        fontSize,
        fontColor,
        fontWeight: "normal",
        textAlign: "left",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addObject(cs.id, obj);

    fetch(`/api/slideshows/${sl.id}/slides/${cs.id}/objects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objects: [...currentSlide.canvasObjects, obj] }),
    });
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold text-slate-300">Add Text</h3>

      <div className="space-y-2">
        <Label className="text-xs text-slate-400">Content</Label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border-white/[0.1] bg-white/[0.04] text-white text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-slate-400">Font</Label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-white"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Size</Label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min={8}
            max={200}
            className="border-white/[0.1] bg-white/[0.04] text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Color</Label>
          <input
            type="color"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
            className="h-9 w-full cursor-pointer rounded-md border border-white/[0.1]"
          />
        </div>
      </div>

      <Button
        onClick={handleAddText}
        className="w-full cursor-pointer bg-rose-600 text-sm hover:bg-rose-700"
      >
        Add Text to Slide
      </Button>
    </div>
  );
}
