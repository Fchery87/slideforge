"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Grid3X3, Magnet } from "lucide-react";

export function GridSettingsPanel() {
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [snapThreshold, setSnapThreshold] = useState(10);

  const toggleGrid = useCallback(() => {
    const newValue = !gridEnabled;
    setGridEnabled(newValue);
    // Dispatch event to canvas
    const event = new CustomEvent("toggle-grid", { detail: { enabled: newValue, size: gridSize } });
    window.dispatchEvent(event);
  }, [gridEnabled, gridSize]);

  const toggleSnap = useCallback(() => {
    const newValue = !snapEnabled;
    setSnapEnabled(newValue);
    // Dispatch event to canvas
    const event = new CustomEvent("toggle-snap", { detail: { enabled: newValue, threshold: snapThreshold } });
    window.dispatchEvent(event);
  }, [snapEnabled, snapThreshold]);

  useEffect(() => {
    // Update grid size when it changes
    if (gridEnabled) {
      const event = new CustomEvent("toggle-grid", { detail: { enabled: true, size: gridSize } });
      window.dispatchEvent(event);
    }
  }, [gridSize, gridEnabled]);

  useEffect(() => {
    // Update snap threshold when it changes
    if (snapEnabled) {
      const event = new CustomEvent("toggle-snap", { detail: { enabled: true, threshold: snapThreshold } });
      window.dispatchEvent(event);
    }
  }, [snapThreshold, snapEnabled]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Grid3X3 className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200">Grid & Snapping</h3>
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
          onCheckedChange={toggleGrid}
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
          onCheckedChange={toggleSnap}
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
        <p className="mb-1">• Snapping auto-aligns objects to grid</p>
        <p>• Hold Shift to disable snapping temporarily</p>
      </div>
    </div>
  );
}
