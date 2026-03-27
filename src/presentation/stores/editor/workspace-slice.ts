import type { StateCreator } from "zustand";
import type { EditorStore, WorkspaceSlice } from "./types";

export const createWorkspaceSlice: StateCreator<
  EditorStore,
  [],
  [],
  WorkspaceSlice
> = (set) => ({
  activeLeftTab: "media",
  activeRightPanel: "properties",
  activeBottomSurface: "timeline",
  zoom: 1,
  canvasZoom: 1,
  gridEnabled: false,
  snapEnabled: true,
  gridSize: 20,
  snapThreshold: 10,

  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),

  setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),

  toggleRightPanel: (panel) =>
    set((state) => ({
      activeRightPanel: state.activeRightPanel === panel ? null : panel,
    })),

  setActiveBottomSurface: (surface) => set({ activeBottomSurface: surface }),

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),

  setCanvasZoom: (zoom) => set({ canvasZoom: Math.max(0.25, Math.min(2, zoom)) }),

  setGridEnabled: (enabled) => set({ gridEnabled: enabled }),

  setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),

  setGridSize: (size) => set({ gridSize: Math.max(5, Math.min(100, Math.round(size || 20))) }),

  setSnapThreshold: (threshold) =>
    set({ snapThreshold: Math.max(1, Math.min(50, Math.round(threshold || 10))) }),
});
