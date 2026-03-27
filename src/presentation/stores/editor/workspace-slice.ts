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

  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),

  setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),

  toggleRightPanel: (panel) =>
    set((state) => ({
      activeRightPanel: state.activeRightPanel === panel ? null : panel,
    })),

  setActiveBottomSurface: (surface) => set({ activeBottomSurface: surface }),

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
});
