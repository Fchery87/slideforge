import type { StateCreator } from "zustand";
import type { EditorStore, HistorySlice, HistoryState } from "./types";

const MAX_HISTORY = 50;

export const createHistorySlice: StateCreator<
  EditorStore,
  [],
  [],
  HistorySlice
> = (set, get) => ({
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  pushToHistory: () => {
    const state = get();
    if (!state.slideshow) return;

    const historyEntry: HistoryState = {
      slideshow: JSON.parse(JSON.stringify(state.slideshow)),
      currentSlideIndex: state.currentSlideIndex,
      selectedObjectId: state.selectedObjectId,
    };

    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(historyEntry);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;

    const historyEntry = state.history[state.historyIndex];
    set({
      slideshow: historyEntry.slideshow,
      currentSlideIndex: historyEntry.currentSlideIndex,
      selectedObjectId: historyEntry.selectedObjectId,
      historyIndex: state.historyIndex - 1,
      canUndo: state.historyIndex > 0,
      canRedo: true,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    const historyEntry = state.history[newIndex];
    set({
      slideshow: historyEntry.slideshow,
      currentSlideIndex: historyEntry.currentSlideIndex,
      selectedObjectId: historyEntry.selectedObjectId,
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < state.history.length - 1,
      isDirty: true,
    });
  },
});
