import type { StateCreator } from "zustand";
import type { EditorStore, PlaybackSlice } from "./types";

export const createPlaybackSlice: StateCreator<
  EditorStore,
  [],
  [],
  PlaybackSlice
> = (set) => ({
  isPlaying: false,
  isPreviewMode: false,
  isPresenterMode: false,
  isEditMode: true,
  currentFrame: 0,

  setPlaying: (isPlaying) => set({ isPlaying }),

  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPreviewMode: (isPreviewMode) =>
    set({
      isPreviewMode,
      isPresenterMode: false,
      isEditMode: !isPreviewMode,
      isPlaying: false,
    }),

  setPresenterMode: (isPresenterMode) =>
    set({
      isPresenterMode,
      isPreviewMode: false,
      isEditMode: !isPresenterMode,
      isPlaying: false,
    }),

  toggleEditMode: () =>
    set((state) => {
      if (state.isEditMode) {
        return {
          isEditMode: false,
          isPreviewMode: true,
          isPresenterMode: false,
          isPlaying: false,
        };
      }

      return {
        isEditMode: true,
        isPreviewMode: false,
        isPresenterMode: false,
        isPlaying: false,
      };
    }),

  setCurrentFrame: (currentFrame) => set({ currentFrame }),
});
