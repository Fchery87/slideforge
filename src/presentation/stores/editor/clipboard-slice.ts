import type { StateCreator } from "zustand";
import type { EditorStore, ClipboardSlice } from "./types";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import type { Slide } from "@/domain/slideshow/entities/slide";

export const createClipboardSlice: StateCreator<
  EditorStore,
  [],
  [],
  ClipboardSlice
> = (set, get) => ({
  clipboard: null,
  canPaste: false,

  copy: () => {
    const state = get();
    if (!state.slideshow) return;

    if (state.selectedObjectId) {
      const currentSlide = state.slideshow.slides[state.currentSlideIndex];
      const obj = currentSlide?.canvasObjects.find(
        (o) => o.id === state.selectedObjectId
      );
      if (obj) {
        set({
          clipboard: {
            type: "object",
            data: JSON.parse(JSON.stringify(obj)),
          },
          canPaste: true,
        });
      }
    } else {
      const slide = state.slideshow.slides[state.currentSlideIndex];
      if (slide) {
        set({
          clipboard: {
            type: "slide",
            data: JSON.parse(JSON.stringify(slide)),
          },
          canPaste: true,
        });
      }
    }
  },

  cut: () => {
    const state = get();
    if (!state.slideshow) return;

    state.copy();

    if (state.selectedObjectId) {
      const currentSlide = state.slideshow.slides[state.currentSlideIndex];
      if (currentSlide) {
        state.removeObject(currentSlide.id, state.selectedObjectId);
      }
    } else {
      const slide = state.slideshow.slides[state.currentSlideIndex];
      if (slide) {
        state.removeSlide(slide.id);
      }
    }
  },

  paste: () => {
    const state = get();
    if (!state.slideshow || !state.clipboard) return;

    if (state.clipboard.type === "object") {
      const currentSlide = state.slideshow.slides[state.currentSlideIndex];
      if (currentSlide) {
        const obj = JSON.parse(
          JSON.stringify(state.clipboard.data)
        ) as CanvasObject;
        obj.id = crypto.randomUUID();
        obj.x += 20;
        obj.y += 20;
        obj.zIndex =
          Math.max(...currentSlide.canvasObjects.map((o) => o.zIndex), 0) + 1;
        obj.createdAt = new Date();
        obj.updatedAt = new Date();
        state.addObject(currentSlide.id, obj);
        state.selectObject(obj.id);
      }
    } else if (state.clipboard.type === "slide") {
      const slide = JSON.parse(JSON.stringify(state.clipboard.data)) as Slide;
      slide.id = crypto.randomUUID();
      slide.order = state.slideshow.slides.length;
      slide.canvasObjects = slide.canvasObjects.map((obj) => ({
        ...obj,
        id: crypto.randomUUID(),
      }));
      slide.createdAt = new Date();
      slide.updatedAt = new Date();
      state.addSlide(slide);
    }
  },
});
