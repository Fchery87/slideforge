import { create } from "zustand";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import type { Transition } from "@/domain/slideshow/entities/transition";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";

type HistoryState = {
  slideshow: Slideshow | null;
  currentSlideIndex: number;
  selectedObjectId: string | null;
};

interface ClipboardItem {
  type: 'object' | 'slide';
  data: CanvasObject | Slide;
}

interface EditorState {
  slideshow: Slideshow | null;
  currentSlideIndex: number;
  selectedObjectId: string | null;
  selectedObjectIds: string[]; // Multi-select support
  isEditMode: boolean;
  isPlaying: boolean;
  currentFrame: number;
  zoom: number;
  isDirty: boolean;

  // Undo/Redo
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Clipboard
  clipboard: ClipboardItem | null;
  canPaste: boolean;

  // Actions
  setSlideshow: (slideshow: Slideshow) => void;
  setCurrentSlideIndex: (index: number) => void;
  selectObject: (objectId: string | null) => void;
  addToSelection: (objectId: string) => void;
  removeFromSelection: (objectId: string) => void;
  clearSelection: () => void;
  toggleEditMode: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  setZoom: (zoom: number) => void;
  markDirty: () => void;
  markClean: () => void;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;

  // Clipboard actions
  copy: () => void;
  cut: () => void;
  paste: () => void;

  // Slide operations
  updateSlide: (slideIndex: number, data: Partial<Slide>) => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  duplicateSlide: (slideId: string) => void;

  // Canvas object operations
  addObject: (slideId: string, obj: CanvasObject) => void;
  updateObject: (slideId: string, objId: string, data: Partial<CanvasObject>) => void;
  removeObject: (slideId: string, objId: string) => void;
  duplicateObject: (slideId: string, objId: string) => void;
  reorderObjects: (slideId: string, objId: string, direction: "up" | "down") => void;

  // Group operations
  groupObjects: (slideId: string, objectIds: string[]) => void;
  ungroupObject: (slideId: string, groupId: string) => void;

  // Transition operations
  setTransition: (transition: Transition) => void;
  removeTransition: (transitionId: string) => void;

  // Audio operations
  addAudioTrack: (track: AudioTrack) => void;
  removeAudioTrack: (trackId: string) => void;
  updateAudioTrack: (trackId: string, data: Partial<AudioTrack>) => void;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
  slideshow: null,
  currentSlideIndex: 0,
  selectedObjectId: null,
  selectedObjectIds: [],
  isEditMode: true,
  isPlaying: false,
  currentFrame: 0,
  zoom: 1,
  isDirty: false,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  clipboard: null,
  canPaste: false,

  copy: () => {
    const state = get();
    if (!state.slideshow) return;
    
    if (state.selectedObjectId) {
      const currentSlide = state.slideshow.slides[state.currentSlideIndex];
      const obj = currentSlide?.canvasObjects.find((o) => o.id === state.selectedObjectId);
      if (obj) {
        set({ 
          clipboard: { type: 'object', data: JSON.parse(JSON.stringify(obj)) },
          canPaste: true 
        });
      }
    } else {
      const slide = state.slideshow.slides[state.currentSlideIndex];
      if (slide) {
        set({ 
          clipboard: { type: 'slide', data: JSON.parse(JSON.stringify(slide)) },
          canPaste: true 
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
    
    if (state.clipboard.type === 'object') {
      const currentSlide = state.slideshow.slides[state.currentSlideIndex];
      if (currentSlide) {
        const obj = JSON.parse(JSON.stringify(state.clipboard.data)) as CanvasObject;
        obj.id = crypto.randomUUID();
        obj.x += 20;
        obj.y += 20;
        obj.zIndex = Math.max(...currentSlide.canvasObjects.map((o) => o.zIndex), 0) + 1;
        obj.createdAt = new Date();
        obj.updatedAt = new Date();
        state.addObject(currentSlide.id, obj);
        state.selectObject(obj.id);
      }
    } else if (state.clipboard.type === 'slide') {
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

  pushToHistory: () => {
    const state = get();
    if (!state.slideshow) return;

    const historyEntry: HistoryState = {
      slideshow: JSON.parse(JSON.stringify(state.slideshow)),
      currentSlideIndex: state.currentSlideIndex,
      selectedObjectId: state.selectedObjectId,
    };

    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
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

  setSlideshow: (slideshow) => {
    get().pushToHistory();
    set({ slideshow, currentSlideIndex: 0, isDirty: false, history: [], historyIndex: -1, canUndo: false, canRedo: false });
  },

  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index, selectedObjectId: null, selectedObjectIds: [] }),
  selectObject: (objectId) => set({ selectedObjectId: objectId, selectedObjectIds: objectId ? [objectId] : [] }),
  addToSelection: (objectId) => set((state) => ({
    selectedObjectId: objectId,
    selectedObjectIds: [...state.selectedObjectIds, objectId],
  })),
  removeFromSelection: (objectId) => set((state) => ({
    selectedObjectIds: state.selectedObjectIds.filter((id) => id !== objectId),
    selectedObjectId: state.selectedObjectId === objectId
      ? state.selectedObjectIds.filter((id) => id !== objectId)[0] || null
      : state.selectedObjectId,
  })),
  clearSelection: () => set({ selectedObjectId: null, selectedObjectIds: [] }),
  toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentFrame: (currentFrame) => set({ currentFrame }),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

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
    set((state) => {
      if (!state.slideshow) return state;
      const slides = state.slideshow.slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              canvasObjects: s.canvasObjects.map((o) => (o.id === objId ? { ...o, ...data } : o)),
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
        selectedObjectId: state.selectedObjectId === objId ? null : state.selectedObjectId,
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
      
      const groupId = crypto.randomUUID();
      const maxZIndex = Math.max(
        ...state.slideshow.slides
          .find((s) => s.id === slideId)?.canvasObjects.map((o) => o.zIndex) || [0]
      );
      
      // Calculate bounding box of all objects
      const objects = state.slideshow.slides
        .find((s) => s.id === slideId)?.canvasObjects
        .filter((o) => objectIds.includes(o.id)) || [];
      
      if (objects.length === 0) return state;
      
      const minX = Math.min(...objects.map((o) => o.x));
      const minY = Math.min(...objects.map((o) => o.y));
      const maxX = Math.max(...objects.map((o) => o.x + o.width));
      const maxY = Math.max(...objects.map((o) => o.y + o.height));
      
      const groupObject: CanvasObject = {
        id: groupId,
        slideId,
        type: "group",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rotation: 0,
        opacity: 1,
        zIndex: maxZIndex + 1,
        properties: {
          childrenIds: objectIds,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const slides = state.slideshow.slides.map((s) => {
        if (s.id !== slideId) return s;
        
        // Add group object and mark children with groupId
        const updatedObjects = s.canvasObjects.map((obj) => {
          if (objectIds.includes(obj.id)) {
            return { ...obj, groupId };
          }
          return obj;
        });
        
        return {
          ...s,
          canvasObjects: [...updatedObjects, groupObject],
        };
      });
      
      return {
        slideshow: { ...state.slideshow, slides },
        selectedObjectId: groupId,
        selectedObjectIds: [groupId],
        isDirty: true,
      };
    });
  },

  ungroupObject: (slideId, groupId) => {
    get().pushToHistory();
    set((state) => {
      if (!state.slideshow) return state;
      
      const group = state.slideshow.slides
        .find((s) => s.id === slideId)?.canvasObjects
        .find((o) => o.id === groupId);
      
      if (!group || group.type !== "group") return state;
      
      const childrenIds = (group.properties as { childrenIds: string[] }).childrenIds;
      
      const slides = state.slideshow.slides.map((s) => {
        if (s.id !== slideId) return s;
        
        // Remove groupId from children and remove the group object
        const updatedObjects = s.canvasObjects
          .filter((obj) => obj.id !== groupId)
          .map((obj) => {
            if (childrenIds.includes(obj.id)) {
              const { groupId: _, ...rest } = obj;
              return rest;
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
        (t) => !(t.fromSlideId === transition.fromSlideId && t.toSlideId === transition.toSlideId)
      );
      return {
        slideshow: { ...state.slideshow, transitions: [...transitions, transition] },
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
          transitions: state.slideshow.transitions.filter((t) => t.id !== transitionId),
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
          audioTracks: state.slideshow.audioTracks.filter((t) => t.id !== trackId),
        },
        isDirty: true,
      };
    });
  },

  updateAudioTrack: (trackId, data) => {
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
}));
