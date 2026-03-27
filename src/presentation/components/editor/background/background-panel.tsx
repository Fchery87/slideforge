"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Palette, 
  Image as ImageIcon, 
  Waves,
  Check,
  Trash2
} from "lucide-react";
import { resolveBackgroundToCss, createSolidBackground, createGradientBackground, type SlideBackground } from "@/domain/slideshow/value-objects/slide-background";

const PRESET_GRADIENTS = [
  { name: "Sunset", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Ocean", css: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)" },
  { name: "Fire", css: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", css: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { name: "Midnight", css: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  { name: "Berry", css: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)" },
];

const PRESET_COLORS = [
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#533483",
  "#e94560",
  "#1f1f1f",
  "#2d2d2d",
  "#ffffff",
  "#000000",
];

function getBackgroundValue(bg: SlideBackground | undefined): string | null {
  if (!bg) return null;
  if (bg.kind === "solid") return bg.color;
  if (bg.kind === "gradient") return bg.value;
  return null;
}

export function BackgroundPanel() {
  const {
    slideshow,
    currentSlideIndex,
    updateSlide,
  } = useEditorStore();

  const currentSlide = slideshow?.slides[currentSlideIndex];

  const setSolidColor = useCallback((color: string) => {
    if (!currentSlide) return;
    updateSlide(currentSlideIndex, {
      background: createSolidBackground(color),
    });
  }, [currentSlide, currentSlideIndex, updateSlide]);

  const setGradient = useCallback((gradient: string) => {
    if (!currentSlide) return;
    updateSlide(currentSlideIndex, {
      background: createGradientBackground(gradient),
    });
  }, [currentSlide, currentSlideIndex, updateSlide]);

  const clearBackground = useCallback(() => {
    if (!currentSlide) return;
    updateSlide(currentSlideIndex, {
      background: { kind: "theme-default" },
    });
  }, [currentSlide, currentSlideIndex, updateSlide]);

  const currentBg = getBackgroundValue(currentSlide?.background);
  const resolvedBg = resolveBackgroundToCss(currentSlide?.background, slideshow?.backgroundColor ?? "#1a1a2e");

  if (!currentSlide) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <p className="text-center text-sm text-slate-500">
          No slide selected
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200">Background</h3>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Current Background Preview */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          Current Background
        </Label>
        <div
          className="h-24 w-full rounded-lg border border-white/10"
          style={{
            background: resolvedBg,
          }}
        />
        {currentSlide.background.kind !== "theme-default" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearBackground}
            className="mt-2 w-full text-slate-400 hover:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
        )}
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Solid Colors */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          <Palette className="mr-1 inline h-3 w-3" />
          Solid Colors
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSolidColor(color)}
              className={`h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                currentBg === color
                  ? "border-rose-500"
                  : "border-transparent hover:border-white/30"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            >
              {currentBg === color && (
                <Check className="mx-auto h-4 w-4 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="color"
            value={currentBg?.startsWith("#") ? currentBg : "#1a1a2e"}
            onChange={(e) => setSolidColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-white/[0.08] bg-transparent"
          />
          <Input
            value={currentBg?.startsWith("#") ? currentBg : "#1a1a2e"}
            onChange={(e) => setSolidColor(e.target.value)}
            placeholder="#RRGGBB"
            className="h-8 flex-1 bg-white/[0.04] text-xs"
          />
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Gradients */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          <Waves className="mr-1 inline h-3 w-3" />
          Gradients
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_GRADIENTS.map((gradient) => (
            <button
              key={gradient.name}
              onClick={() => setGradient(gradient.css)}
              className={`group relative h-16 overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                currentBg === gradient.css
                  ? "border-rose-500"
                  : "border-transparent hover:border-white/30"
              }`}
              style={{ background: gradient.css }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100">
                {gradient.name}
              </span>
              {currentBg === gradient.css && (
                <Check className="absolute right-2 top-2 h-4 w-4 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Custom Gradient Input */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          Custom CSS Gradient
        </Label>
        <textarea
          value={currentBg?.includes("gradient") ? currentBg : ""}
          onChange={(e) => {
            if (e.target.value.includes("gradient")) {
              setGradient(e.target.value);
            }
          }}
          placeholder="linear-gradient(135deg, #color1 0%, #color2 100%)"
          rows={3}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-ring"
        />
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Image Background */}
      <div>
        <Label className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
          <ImageIcon className="mr-1 inline h-3 w-3" />
          Image Background
        </Label>
        <p className="text-xs text-slate-500">
          Coming soon: Upload images as slide backgrounds
        </p>
      </div>
    </div>
  );
}
