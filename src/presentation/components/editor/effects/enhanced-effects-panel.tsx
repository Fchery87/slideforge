"use client";

import { useState } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransitionType } from "@/domain/slideshow/value-objects/transition-type";
import {
  type KenBurnsEffect,
  type ColorFilter,
  type OverlayEffect,
  type ParallaxEffect,
  KenBurnsDirection,
  FilterType,
  OverlayType,
  ParallaxType,
  KEN_BURNS_PRESETS,
  FILTER_PRESETS,
  OVERLAY_PRESETS,
  PARALLAX_PRESETS,
  createDefaultKenBurnsEffect,
  createDefaultColorFilter,
  createDefaultOverlayEffect,
  createDefaultParallaxEffect,
} from "@/domain/slideshow/value-objects/slide-effects";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRightLeft,
  Expand,
  Palette,
  Sparkles,
  Layers,
  SlidersHorizontal,
  ZoomIn,
  Play,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const TRANSITION_TYPES: { value: TransitionType; label: string; icon: React.ReactNode }[] = [
  { value: "none", label: "None", icon: <span className="text-xs">✕</span> },
  { value: "fade", label: "Fade", icon: <span className="text-xs">◐</span> },
  { value: "slide", label: "Slide", icon: <ArrowRightLeft className="h-3 w-3" /> },
  { value: "zoom", label: "Zoom", icon: <ZoomIn className="h-3 w-3" /> },
  { value: "dissolve", label: "Dissolve", icon: <span className="text-xs">◯</span> },
  { value: "wipe", label: "Wipe", icon: <span className="text-xs">▶</span> },
];

const KEN_BURNS_DIRECTIONS: { value: KenBurnsDirection; label: string; icon: React.ReactNode }[] = [
  { value: "zoom-in", label: "Zoom In", icon: <ZoomIn className="h-3 w-3" /> },
  { value: "zoom-out", label: "Zoom Out", icon: <Expand className="h-3 w-3" /> },
  { value: "pan-left", label: "Pan Left", icon: <ChevronLeft className="h-3 w-3" /> },
  { value: "pan-right", label: "Pan Right", icon: <ChevronRight className="h-3 w-3" /> },
  { value: "pan-up", label: "Pan Up", icon: <ChevronUp className="h-3 w-3" /> },
  { value: "pan-down", label: "Pan Down", icon: <ChevronDown className="h-3 w-3" /> },
];

const FILTER_TYPES: { value: FilterType; label: string; preview: string }[] = [
  { value: "none", label: "None", preview: "bg-gray-500" },
  { value: "grayscale", label: "Grayscale", preview: "bg-gradient-to-br from-gray-300 to-gray-600" },
  { value: "sepia", label: "Sepia", preview: "bg-gradient-to-br from-amber-400 to-amber-700" },
  { value: "vintage", label: "Vintage", preview: "bg-gradient-to-br from-orange-300 to-yellow-600" },
  { value: "cinematic", label: "Cinematic", preview: "bg-gradient-to-br from-blue-900 to-slate-800" },
  { value: "black-white", label: "B&W", preview: "bg-gradient-to-br from-gray-100 to-gray-900" },
  { value: "warm", label: "Warm", preview: "bg-gradient-to-br from-orange-400 to-red-500" },
  { value: "cool", label: "Cool", preview: "bg-gradient-to-br from-cyan-400 to-blue-600" },
  { value: "vivid", label: "Vivid", preview: "bg-gradient-to-br from-pink-500 to-purple-600" },
  { value: "dramatic", label: "Dramatic", preview: "bg-gradient-to-br from-red-900 to-black" },
];

const OVERLAY_TYPES: { value: OverlayType; label: string; icon: string }[] = [
  { value: "none", label: "None", icon: "✕" },
  { value: "film-grain", label: "Film Grain", icon: "▒" },
  { value: "dust", label: "Dust", icon: "•" },
  { value: "light-leak", label: "Light Leak", icon: "✦" },
  { value: "vignette", label: "Vignette", icon: "◉" },
  { value: "lens-flare", label: "Lens Flare", icon: "✹" },
  { value: "particles", label: "Particles", icon: "✧" },
  { value: "snow", label: "Snow", icon: "❄" },
  { value: "rain", label: "Rain", icon: "≋" },
  { value: "confetti", label: "Confetti", icon: "🎉" },
];

const PARALLAX_TYPES: { value: ParallaxType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "diagonal", label: "Diagonal" },
  { value: "depth", label: "3D Depth" },
];

export function EffectsPanel() {
  const { slideshow, currentSlideIndex, setTransition, updateSlide } = useEditorStore();
  const [activeTab, setActiveTab] = useState("transitions");

  if (!slideshow) return null;

  const currentSlide = slideshow.slides[currentSlideIndex];
  const nextSlide = slideshow.slides[currentSlideIndex + 1];

  // Get current transition
  const transition = nextSlide
    ? slideshow.transitions.find(
        (t) => t.fromSlideId === currentSlide?.id && t.toSlideId === nextSlide.id
      )
    : null;

  // Get current effects
  const effects = currentSlide?.effects || {
    kenBurns: createDefaultKenBurnsEffect(),
    filter: createDefaultColorFilter(),
    overlay: createDefaultOverlayEffect(),
    parallax: createDefaultParallaxEffect(),
  };

  const kenBurns = effects.kenBurns || createDefaultKenBurnsEffect();
  const filter = effects.filter || createDefaultColorFilter();
  const overlay = effects.overlay || createDefaultOverlayEffect();
  const parallax = effects.parallax || createDefaultParallaxEffect();

  async function handleSetTransition(type: TransitionType) {
    if (!slideshow || !currentSlide || !nextSlide) return;

    const newTransition = {
      id: transition?.id ?? crypto.randomUUID(),
      slideshowId: slideshow.id,
      fromSlideId: currentSlide.id,
      toSlideId: nextSlide.id,
      type,
      durationFrames: 30,
      easing: "ease-in-out",
      createdAt: new Date(),
    };

    setTransition(newTransition);

    await fetch(`/api/slideshows/${slideshow.id}/transitions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransition),
    });
  }

  async function updateSlideEffects(newEffects: typeof effects) {
    if (!slideshow || !currentSlide) return;

    await updateSlide(currentSlideIndex, {
      effects: newEffects,
    });

    // Save to API
    await fetch(`/api/slideshows/${slideshow.id}/slides/${currentSlide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        effects: newEffects,
      }),
    });
  }

  function updateKenBurns(updates: Partial<KenBurnsEffect>) {
    const newKenBurns = { ...kenBurns, ...updates };
    updateSlideEffects({ ...effects, kenBurns: newKenBurns });
  }

  function updateFilter(updates: Partial<ColorFilter>) {
    const newFilter = { ...filter, ...updates };
    updateSlideEffects({ ...effects, filter: newFilter });
  }

  function updateOverlay(updates: Partial<OverlayEffect>) {
    const newOverlay = { ...overlay, ...updates };
    updateSlideEffects({ ...effects, overlay: newOverlay });
  }

  function updateParallax(updates: Partial<ParallaxEffect>) {
    const newParallax = { ...parallax, ...updates };
    updateSlideEffects({ ...effects, parallax: newParallax });
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-3 mt-3 grid w-auto grid-cols-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="transitions" className="flex items-center justify-center">
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>Transitions</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="kenburns" className="flex items-center justify-center">
                <Expand className="h-3.5 w-3.5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>Ken Burns</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="filters" className="flex items-center justify-center">
                <Palette className="h-3.5 w-3.5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>Filters</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="overlays" className="flex items-center justify-center">
                <Layers className="h-3.5 w-3.5" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>Overlays</TooltipContent>
          </Tooltip>
        </TabsList>

        {/* Transitions Tab */}
        <TabsContent value="transitions" className="px-3 py-3">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Slide Transition
              </h3>
              {!nextSlide ? (
                <p className="text-xs text-slate-500">Add another slide to set transitions</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Transition to Slide {currentSlideIndex + 2}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {TRANSITION_TYPES.map((t) => (
                      <Button
                        key={t.value}
                        variant={transition?.type === t.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSetTransition(t.value)}
                        className={`h-16 flex-col gap-1 text-xs ${
                          transition?.type === t.value
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </Button>
                    ))}
                  </div>

                  {transition && transition.type !== "none" && (
                    <div className="space-y-3 rounded-lg bg-white/[0.03] p-3">
                      <div>
                        <Label className="text-xs text-slate-400">Duration</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[transition.durationFrames]}
                            onValueChange={([v]: number[]) =>
                              handleSetTransition(transition.type)
                            }
                            min={15}
                            max={120}
                            step={15}
                            className="flex-1"
                          />
                          <span className="w-12 text-right text-xs text-slate-400">
                            {(transition.durationFrames / 30).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Ken Burns Tab */}
        <TabsContent value="kenburns" className="px-3 py-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ken Burns Effect
              </h3>
              <Switch
                checked={kenBurns.enabled}
                onCheckedChange={(checked) => updateKenBurns({ enabled: checked })}
              />
            </div>

            {kenBurns.enabled && (
              <>
                <Separator className="bg-white/[0.08]" />

                {/* Direction Selection */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Direction</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {KEN_BURNS_DIRECTIONS.map((dir) => (
                      <Button
                        key={dir.value}
                        variant={kenBurns.direction === dir.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateKenBurns({ direction: dir.value })}
                        className={`h-10 gap-1 text-xs ${
                          kenBurns.direction === dir.value
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        {dir.icon}
                        {dir.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Scale Controls */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between">
                      <Label className="text-xs text-slate-400">Start Scale</Label>
                      <span className="text-xs text-slate-500">{Math.round(kenBurns.startScale * 100)}%</span>
                    </div>
                    <Slider
                      value={[kenBurns.startScale]}
                      onValueChange={([v]) => updateKenBurns({ startScale: v })}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <Label className="text-xs text-slate-400">End Scale</Label>
                      <span className="text-xs text-slate-500">{Math.round(kenBurns.endScale * 100)}%</span>
                    </div>
                    <Slider
                      value={[kenBurns.endScale]}
                      onValueChange={([v]) => updateKenBurns({ endScale: v })}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>
                </div>

                {/* Position Controls */}
                <div className="space-y-3">
                  <Label className="text-xs text-slate-400">Start Position</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500">X Offset</Label>
                      <Slider
                        value={[kenBurns.startX]}
                        onValueChange={([v]) => updateKenBurns({ startX: v })}
                        min={-50}
                        max={50}
                        step={5}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Y Offset</Label>
                      <Slider
                        value={[kenBurns.startY]}
                        onValueChange={([v]) => updateKenBurns({ startY: v })}
                        min={-50}
                        max={50}
                        step={5}
                      />
                    </div>
                  </div>

                  <Label className="text-xs text-slate-400">End Position</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500">X Offset</Label>
                      <Slider
                        value={[kenBurns.endX]}
                        onValueChange={([v]) => updateKenBurns({ endX: v })}
                        min={-50}
                        max={50}
                        step={5}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Y Offset</Label>
                      <Slider
                        value={[kenBurns.endY]}
                        onValueChange={([v]) => updateKenBurns({ endY: v })}
                        min={-50}
                        max={50}
                        step={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(KEN_BURNS_PRESETS).map(([name, preset]) => (
                      <Button
                        key={name}
                        variant="outline"
                        size="sm"
                        onClick={() => updateKenBurns({ ...preset, enabled: true })}
                        className="h-8 border-white/[0.1] text-xs capitalize text-slate-300 hover:bg-white/[0.04]"
                      >
                        {name.replace(/-/g, " ")}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Preview Button */}
                <Button
                  variant="outline"
                  className="w-full border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                  onClick={() => {
                    const event = new CustomEvent("preview-ken-burns", {
                      detail: { slideId: currentSlide?.id, kenBurns },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Preview Effect
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="px-3 py-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Color Filters
              </h3>
              <Switch
                checked={filter.enabled}
                onCheckedChange={(checked) => updateFilter({ enabled: checked })}
              />
            </div>

            {filter.enabled && (
              <>
                <Separator className="bg-white/[0.08]" />

                {/* Filter Type Grid */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Filter Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_TYPES.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => updateFilter({ ...FILTER_PRESETS[f.value], type: f.value })}
                        className={`relative overflow-hidden rounded-lg border-2 p-2 text-left transition-all ${
                          filter.type === f.value
                            ? "border-rose-500"
                            : "border-white/[0.1] hover:border-white/[0.2]"
                        }`}
                      >
                        <div className={`mb-2 h-8 w-full rounded ${f.preview}`} />
                        <span className="text-[10px] text-slate-300">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-400">Intensity</Label>
                    <span className="text-xs text-slate-500">{filter.intensity}%</span>
                  </div>
                  <Slider
                    value={[filter.intensity]}
                    onValueChange={([v]) => updateFilter({ intensity: v })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Color Adjustments */}
                <div className="space-y-4">
                  <Label className="text-xs text-slate-400">Color Adjustments</Label>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Brightness</span>
                      <span className="text-xs text-slate-500">{filter.brightness > 0 ? `+${filter.brightness}` : filter.brightness}</span>
                    </div>
                    <Slider
                      value={[filter.brightness]}
                      onValueChange={([v]) => updateFilter({ brightness: v })}
                      min={-100}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Contrast</span>
                      <span className="text-xs text-slate-500">{filter.contrast > 0 ? `+${filter.contrast}` : filter.contrast}</span>
                    </div>
                    <Slider
                      value={[filter.contrast]}
                      onValueChange={([v]) => updateFilter({ contrast: v })}
                      min={-100}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Saturation</span>
                      <span className="text-xs text-slate-500">{filter.saturation > 0 ? `+${filter.saturation}` : filter.saturation}</span>
                    </div>
                    <Slider
                      value={[filter.saturation]}
                      onValueChange={([v]) => updateFilter({ saturation: v })}
                      min={-100}
                      max={100}
                      step={5}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Overlays Tab */}
        <TabsContent value="overlays" className="px-3 py-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Overlay Effects
              </h3>
              <Switch
                checked={overlay.enabled}
                onCheckedChange={(checked) => updateOverlay({ enabled: checked })}
              />
            </div>

            {overlay.enabled && (
              <>
                <Separator className="bg-white/[0.08]" />

                {/* Overlay Type Grid */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Overlay Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {OVERLAY_TYPES.map((o) => (
                      <Button
                        key={o.value}
                        variant={overlay.type === o.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateOverlay({ ...OVERLAY_PRESETS[o.value], type: o.value })}
                        className={`h-14 flex-col gap-1 text-xs ${
                          overlay.type === o.value
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="text-lg">{o.icon}</span>
                        {o.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-400">Opacity</Label>
                    <span className="text-xs text-slate-500">{overlay.opacity}%</span>
                  </div>
                  <Slider
                    value={[overlay.opacity]}
                    onValueChange={([v]) => updateOverlay({ opacity: v })}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Color for light leaks */}
                {overlay.type === "light-leak" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Light Color</Label>
                    <div className="flex gap-2">
                      {["#ffaa00", "#ff6600", "#ffffff", "#ffdd00", "#ff4444"].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateOverlay({ color })}
                          className={`h-8 w-8 rounded-full border-2 ${
                            overlay.color === color ? "border-white" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Intensity for particles */}
                {(overlay.type === "particles" || overlay.type === "snow" || overlay.type === "rain" || overlay.type === "confetti") && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs text-slate-400">Intensity</Label>
                      <span className="text-xs text-slate-500">{overlay.intensity || 50}%</span>
                    </div>
                    <Slider
                      value={[overlay.intensity || 50]}
                      onValueChange={([v]) => updateOverlay({ intensity: v })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
