"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Grid3X3, Magnet } from "lucide-react";

export function GridSettingsPanel() {
  const {
    canvasZoom,
    setCanvasZoom,
    gridEnabled,
    snapEnabled,
    gridSize,
    snapThreshold,
    setGridEnabled,
    setSnapEnabled,
    setGridSize,
    setSnapThreshold,
  } = useEditorStore();

  const zoomPercent = useMemo(() => `${Math.round(canvasZoom * 100)}%`, [canvasZoom]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Grid3X3 className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200">Canvas Settings</h3>
      </div>

      <Separator className="bg-white/[0.08]" />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs text-slate-300">Canvas Zoom</Label>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            {zoomPercent}
          </span>
        </div>
        <input
          type="range"
          min={25}
          max={200}
          step={5}
          value={Math.round(canvasZoom * 100)}
          onChange={(e) => setCanvasZoom(Number(e.target.value) / 100)}
          className="w-full accent-rose-500"
        />
      </div>

      <Separator className="bg-white/[0.08]" />

      {/* Grid Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-3.5 w-3.5 text-slate-500" />
          <Label className="text-xs text-slate-300">Show Grid</Label>
        </div>
        <Switch
          checked={gridEnabled}
          onCheckedChange={setGridEnabled}
        />
      </div>

      {gridEnabled && (
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">
            Grid Size (px)
          </Label>
          <Input
            type="number"
            min={5}
            max={100}
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
      )}

      <Separator className="bg-white/[0.08]" />

      {/* Snap Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Magnet className="h-3.5 w-3.5 text-slate-500" />
          <Label className="text-xs text-slate-300">Snap to Grid</Label>
        </div>
        <Switch
          checked={snapEnabled}
          onCheckedChange={setSnapEnabled}
        />
      </div>

      {snapEnabled && (
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-slate-500">
            Snap Threshold (px)
          </Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={snapThreshold}
            onChange={(e) => setSnapThreshold(Number(e.target.value))}
            className="h-7 bg-white/[0.04] text-xs"
          />
        </div>
      )}

      <Separator className="bg-white/[0.08]" />

      {/* Help Text */}
      <div className="text-xs text-slate-500">
        <p className="mb-1">• Grid helps with alignment</p>
        <p className="mb-1">• Snapping auto-aligns objects while dragging</p>
        <p>• Use zoom to inspect spacing and timing details</p>
      </div>
    </div>
  );
}
