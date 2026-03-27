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

  selectObjects: (objectIds) =>
    set({
      selectedObjectId: objectIds[0] ?? null,
      selectedObjectIds: Array.from(new Set(objectIds)),
    }),

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

  // Slide multi-select
  selectedSlideIds: [],
  selectSlide: (slideId) => set({ selectedSlideIds: [slideId] }),
  selectSlides: (slideIds) => set({ selectedSlideIds: slideIds }),
  addSlideToSelection: (slideId) => set((state) => ({
    selectedSlideIds: state.selectedSlideIds.includes(slideId)
      ? state.selectedSlideIds
      : [...state.selectedSlideIds, slideId],
  })),
  removeSlideFromSelection: (slideId) => set((state) => ({
    selectedSlideIds: state.selectedSlideIds.filter((id) => id !== slideId),
  })),
  selectAllSlides: () => set((state) => ({
    selectedSlideIds: state.slideshow?.slides.map((s) => s.id) ?? [],
  })),
  clearSlideSelection: () => set({ selectedSlideIds: [] }),
});
