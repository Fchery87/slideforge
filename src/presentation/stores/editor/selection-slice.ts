import type { StateCreator } from "zustand";
import type { EditorStore, SelectionSlice } from "./types";

export const createSelectionSlice: StateCreator<
  EditorStore,
  [],
  [],
  SelectionSlice
> = (set) => ({
  currentSlideIndex: 0,
  selectedObjectId: null,
  selectedObjectIds: [],

  setCurrentSlideIndex: (index) =>
    set({ currentSlideIndex: index, selectedObjectId: null, selectedObjectIds: [] }),

  selectObject: (objectId) =>
    set({ selectedObjectId: objectId, selectedObjectIds: objectId ? [objectId] : [] }),

  addToSelection: (objectId) =>
    set((state) => ({
      selectedObjectId: objectId,
      selectedObjectIds: [...state.selectedObjectIds, objectId],
    })),

  removeFromSelection: (objectId) =>
    set((state) => ({
      selectedObjectIds: state.selectedObjectIds.filter((id) => id !== objectId),
      selectedObjectId:
        state.selectedObjectId === objectId
          ? state.selectedObjectIds.filter((id) => id !== objectId)[0] || null
          : state.selectedObjectId,
    })),

  clearSelection: () => set({ selectedObjectId: null, selectedObjectIds: [] }),
});
