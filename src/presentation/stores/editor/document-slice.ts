import type { StateCreator } from "zustand";
import type { EditorStore, DocumentSlice } from "./types";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";

export const createDocumentSlice: StateCreator<
  EditorStore,
  [],
  [],
  DocumentSlice
> = (set, get) => ({
  slideshow: null,
  isDirty: false,
  lastSavedAt: null,

  setSlideshow: (slideshow) => {
    get().pushToHistory();
    set({
      slideshow,
      currentSlideIndex: 0,
      isDirty: false,
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
    });
  },

  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),

  updateSlide: (slideIndex, data) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = [...state.slideshow.slides];
      slides[slideIndex] = { ...slides[slideIndex], ...data };
      return { slideshow: { ...state.slideshow, slides }, isDirty: true };
    });
  },

  addSlide: (slide) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      return {
        slideshow: {
          ...state.slideshow,
          slides: [...state.slideshow.slides, slide],
        },
        isDirty: true,
      };
    });
  },

  removeSlide: (slideId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.filter((s) => s.id !== slideId);
      const transitions = state.slideshow.transitions.filter(
        (t) => t.fromSlideId !== slideId && t.toSlideId !== slideId
      );
      return {
        slideshow: { ...state.slideshow, slides, transitions },
        currentSlideIndex: Math.min(state.currentSlideIndex, slides.length - 1),
        isDirty: true,
      };
    });
  },

  reorderSlides: (fromIndex, toIndex) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = [...state.slideshow.slides];
      const [moved] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, moved);
      const reindexed = slides.map((s, i) => ({ ...s, order: i }));
      return {
        slideshow: { ...state.slideshow, slides: reindexed },
        currentSlideIndex: toIndex,
        isDirty: true,
      };
    });
  },

  duplicateSlide: (slideId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slideIndex = state.slideshow.slides.findIndex((s) => s.id === slideId);
      if (slideIndex === -1) return state;

      const originalSlide = state.slideshow.slides[slideIndex];
      const duplicatedSlide: Slide = {
        ...originalSlide,
        id: crypto.randomUUID(),
        canvasObjects: originalSlide.canvasObjects.map((obj) => ({
          ...obj,
          id: crypto.randomUUID(),
        })),
        order: originalSlide.order + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const slides = [...state.slideshow.slides];
      slides.splice(slideIndex + 1, 0, duplicatedSlide);
      const reindexed = slides.map((s, i) => ({ ...s, order: i }));

      return {
        slideshow: { ...state.slideshow, slides: reindexed },
        currentSlideIndex: slideIndex + 1,
        isDirty: true,
      };
    });
  },

  addObject: (slideId, obj) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) =>
        s.id === slideId ? { ...s, canvasObjects: [...s.canvasObjects, obj] } : s
      );
      return { slideshow: { ...state.slideshow, slides }, isDirty: true };
    });
  },

  updateObject: (slideId, objId, data) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              canvasObjects: s.canvasObjects.map((o) =>
                o.id === objId ? { ...o, ...data } : o
              ),
            }
          : s
      );
      return { slideshow: { ...state.slideshow, slides }, isDirty: true };
    });
  },

  removeObject: (slideId, objId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) =>
        s.id === slideId
          ? { ...s, canvasObjects: s.canvasObjects.filter((o) => o.id !== objId) }
          : s
      );
      return {
        slideshow: { ...state.slideshow, slides },
        selectedObjectId:
          state.selectedObjectId === objId ? null : state.selectedObjectId,
        isDirty: true,
      };
    });
  },

  duplicateObject: (slideId, objId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) => {
        if (s.id !== slideId) return s;

        const obj = s.canvasObjects.find((o) => o.id === objId);
        if (!obj) return s;

        const duplicatedObj: CanvasObject = {
          ...obj,
          id: crypto.randomUUID(),
          x: obj.x + 20,
          y: obj.y + 20,
          zIndex: Math.max(...s.canvasObjects.map((o) => o.zIndex)) + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          ...s,
          canvasObjects: [...s.canvasObjects, duplicatedObj],
        };
      });
      return { slideshow: { ...state.slideshow, slides }, isDirty: true };
    });
  },

  reorderObjects: (slideId, objId, direction) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) => {
        if (s.id !== slideId) return s;

        const objIndex = s.canvasObjects.findIndex((o) => o.id === objId);
        if (objIndex === -1) return s;

        const newObjects = [...s.canvasObjects];
        const obj = newObjects[objIndex];

        if (direction === "up") {
          obj.zIndex += 1;
        } else {
          obj.zIndex = Math.max(1, obj.zIndex - 1);
        }

        return { ...s, canvasObjects: newObjects };
      });
      return { slideshow: { ...state.slideshow, slides }, isDirty: true };
    });
  },

  groupObjects: (slideId, objectIds) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow || objectIds.length < 2) return state;
      const normalizedIds = Array.from(new Set(objectIds));
      const groupId = crypto.randomUUID();

      const slides = state.slideshow.slides.map((s) => {
        if (s.id !== slideId) return s;

        const updatedObjects = s.canvasObjects.map((obj) => {
          if (normalizedIds.includes(obj.id)) {
            return { ...obj, groupId };
          }
          return obj;
        });

        return {
          ...s,
          canvasObjects: updatedObjects,
        };
      });

      return {
        slideshow: { ...state.slideshow, slides },
        selectedObjectId: normalizedIds[0] || null,
        selectedObjectIds: normalizedIds,
        isDirty: true,
      };
    });
  },

  ungroupObject: (slideId, groupId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;

      const slide = state.slideshow.slides.find((s) => s.id === slideId);
      if (!slide) return state;

      const legacyGroup = slide.canvasObjects.find((o) => o.id === groupId && o.type === "group");
      const childrenIds = legacyGroup
        ? ((legacyGroup.properties as { childrenIds: string[] }).childrenIds ?? [])
        : slide.canvasObjects.filter((obj) => obj.groupId === groupId).map((obj) => obj.id);

      if (childrenIds.length === 0) return state;

      const slides = state.slideshow.slides.map((s) => {
        if (s.id !== slideId) return s;

        const updatedObjects = s.canvasObjects
          .filter((obj) => obj.id !== groupId || obj.type !== "group")
          .map((obj) => {
            if (childrenIds.includes(obj.id)) {
              return {
                ...obj,
                groupId: undefined,
              };
            }
            return obj;
          });

        return {
          ...s,
          canvasObjects: updatedObjects,
        };
      });

      return {
        slideshow: { ...state.slideshow, slides },
        selectedObjectId: childrenIds[0] || null,
        selectedObjectIds: childrenIds,
        isDirty: true,
      };
    });
  },

  setTransition: (transition) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const transitions = state.slideshow.transitions.filter(
        (t) =>
          !(
            t.fromSlideId === transition.fromSlideId &&
            t.toSlideId === transition.toSlideId
          )
      );
      return {
        slideshow: {
          ...state.slideshow,
          transitions: [...transitions, transition],
        },
        isDirty: true,
      };
    });
  },

  removeTransition: (transitionId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      return {
        slideshow: {
          ...state.slideshow,
          transitions: state.slideshow.transitions.filter(
            (t) => t.id !== transitionId
          ),
        },
        isDirty: true,
      };
    });
  },

  addAudioTrack: (track) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      return {
        slideshow: {
          ...state.slideshow,
          audioTracks: [...state.slideshow.audioTracks, track],
        },
        isDirty: true,
      };
    });
  },

  removeAudioTrack: (trackId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      return {
        slideshow: {
          ...state.slideshow,
          audioTracks: state.slideshow.audioTracks.filter(
            (t) => t.id !== trackId
          ),
        },
        isDirty: true,
      };
    });
  },

  updateAudioTrack: (trackId, data) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      return {
        slideshow: {
          ...state.slideshow,
          audioTracks: state.slideshow.audioTracks.map((t) =>
            t.id === trackId ? { ...t, ...data } : t
          ),
        },
        isDirty: true,
      };
    });
  },

  updateSlideshowMeta: (data) => {
    set((state) => {
      if (!state.slideshow) return state;
      return {
        slideshow: { ...state.slideshow, ...data },
        isDirty: true,
      };
    });
  },

  // Bulk operations
  bulkSetDuration: (slideIds, durationFrames) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) =>
        slideIds.includes(s.id) ? { ...s, durationFrames, updatedAt: new Date() } : s
      );
      return { slideshow: { ...state.slideshow, slides }, isDirty: true };
    });
  },

  bulkApplyEffect: (slideIds, effects) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) =>
        slideIds.includes(s.id)
          ? { ...s, effects: { ...s.effects, ...effects }, updatedAt: new Date() }
          : s
      );
      return { slideshow: { ...state.slideshow, slides }, isDirty: true };
    });
  },

  bulkDeleteSlides: (slideIds) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.filter((s) => !slideIds.includes(s.id));
      const transitions = state.slideshow.transitions.filter(
        (t) => !slideIds.includes(t.fromSlideId) && !slideIds.includes(t.toSlideId)
      );
      const reindexed = slides.map((s, i) => ({ ...s, order: i }));
      return {
        slideshow: { ...state.slideshow, slides: reindexed, transitions },
        currentSlideIndex: Math.min(state.currentSlideIndex, reindexed.length - 1),
        selectedSlideIds: [],
        isDirty: true,
      };
    });
  },

  bulkDuplicateSlides: (slideIds) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      const slidesToDuplicate = state.slideshow.slides.filter((s) => slideIds.includes(s.id));
      const duplicatedSlides = slidesToDuplicate.map((slide) => ({
        ...slide,
        id: crypto.randomUUID(),
        canvasObjects: slide.canvasObjects.map((obj) => ({
          ...obj,
          id: crypto.randomUUID(),
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const allSlides = [...state.slideshow.slides, ...duplicatedSlides];
      const reindexed = allSlides.map((s, i) => ({ ...s, order: i }));
      return {
        slideshow: { ...state.slideshow, slides: reindexed },
        isDirty: true,
      };
    });
  },
});
