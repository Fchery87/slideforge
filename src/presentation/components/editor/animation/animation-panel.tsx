"use client";

import { useEditorStore } from "@/presentation/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Film } from "lucide-react";
import type { AnimationType, AnimationConfig } from "@/domain/slideshow/entities/canvas-object";

const ANIMATION_TYPES: { value: AnimationType; label: string; category: string }[] = [
  { value: "none", label: "None", category: "Basic" },
  { value: "fade-in", label: "Fade In", category: "Entrance" },
  { value: "fade-out", label: "Fade Out", category: "Exit" },
  { value: "slide-up", label: "Slide Up", category: "Entrance" },
  { value: "slide-down", label: "Slide Down", category: "Entrance" },
  { value: "slide-left", label: "Slide Left", category: "Entrance" },
  { value: "slide-right", label: "Slide Right", category: "Entrance" },
  { value: "scale-in", label: "Scale In", category: "Entrance" },
  { value: "scale-out", label: "Scale Out", category: "Exit" },
  { value: "rotate-in", label: "Rotate In", category: "Entrance" },
  { value: "bounce", label: "Bounce", category: "Attention" },
  { value: "typewriter", label: "Typewriter", category: "Text" },
];

const EASING_OPTIONS = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In-Out" },
  { value: "bounce", label: "Bounce" },
];

export function AnimationPanel() {
  const {
    slideshow,
    currentSlideIndex,
    selectedObjectId,
    updateObject,
  } = useEditorStore();

  const currentSlide = slideshow?.slides[currentSlideIndex] ?? null;
  const selectedObject = currentSlide?.canvasObjects.find(
    (o) => o.id === selectedObjectId
  );

  const getAnimation = (): AnimationConfig => {
    if (!selectedObject) return { type: "none", delayFrames: 0, durationFrames: 30, easing: "ease-out" };
    
    const props = selectedObject.properties as { animation?: AnimationConfig };
    return props.animation || { type: "none", delayFrames: 0, durationFrames: 30, easing: "ease-out" };
  };

  const updateAnimation = (config: Partial<AnimationConfig>) => {
    if (!currentSlide || !selectedObject) return;
    
    const currentAnimation = getAnimation();
    const newAnimation = { ...currentAnimation, ...config };
    
    updateObject(currentSlide.id, selectedObject.id, {
      properties: {
        ...selectedObject.properties,
        animation: newAnimation,
      },
    });
  };

  const animation = getAnimation();
  const fps = slideshow?.fps || 30;

  if (!selectedObject) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <p className="text-center text-sm text-slate-500">
          Select an object to add animations
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Film className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200">Animation</h3>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Animation Type */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          Animation Type
        </Label>
        <div className="grid grid-cols-2 gap-1">
          {ANIMATION_TYPES.map((anim) => (
            <Button
              key={anim.value}
              variant={animation.type === anim.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateAnimation({ type: anim.value })}
              className={`h-7 text-[10px] justify-start ${
                animation.type === anim.value
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              {anim.label}
            </Button>
          ))}
        </div>
      </div>

      {animation.type !== "none" && (
        <>
          <Separator className="bg-white/[0.08]" />

          {/* Timing Controls */}
          <div className="space-y-3">
            <div>
              <Label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">
                Delay (seconds)
              </Label>
              <Input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={(animation.delayFrames / fps).toFixed(1)}
                onChange={(e) => {
                  const seconds = Number(e.target.value);
                  updateAnimation({ delayFrames: Math.round(seconds * fps) });
                }}
                className="h-7 bg-white/[0.04] text-xs"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                {animation.delayFrames} frames
              </p>
            </div>

            <div>
              <Label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">
                Duration (seconds)
              </Label>
              <Input
                type="number"
                min={0.1}
                max={5}
                step={0.1}
                value={(animation.durationFrames / fps).toFixed(1)}
                onChange={(e) => {
                  const seconds = Number(e.target.value);
                  updateAnimation({ durationFrames: Math.round(seconds * fps) });
                }}
                className="h-7 bg-white/[0.04] text-xs"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                {animation.durationFrames} frames
              </p>
            </div>

            <div>
              <Label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">
                Easing
              </Label>
              <select
                value={animation.easing}
                onChange={(e) => updateAnimation({ easing: e.target.value as AnimationConfig["easing"] })}
                className="h-7 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-slate-200 outline-none"
              >
                {EASING_OPTIONS.map((ease) => (
                  <option key={ease.value} value={ease.value}>
                    {ease.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Separator className="bg-white/[0.08]" />

          {/* Preview Button */}
          <Button
            variant="outline"
            className="w-full border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
            onClick={() => {
              // Trigger preview animation
              const event = new CustomEvent("preview-animation", {
                detail: { objectId: selectedObject.id, animation },
              });
              window.dispatchEvent(event);
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Preview Animation
          </Button>
        </>
      )}
    </div>
  );
}
