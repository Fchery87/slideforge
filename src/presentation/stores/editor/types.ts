import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import type { Transition } from "@/domain/slideshow/entities/transition";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";

export interface ClipboardItem {
  type: "object" | "slide";
  data: CanvasObject | Slide;
}

export type RightPanel =
  | "canvas"
  | "properties"
  | "animation"
  | "effects"
  | "background"
  | "audio"
  | "notes"
  | null;
export type LeftTab = "media" | "layouts" | "templates" | null;
export type BottomSurface = "timeline" | "filmstrip" | null;

export interface HistoryState {
  slideshow: Slideshow | null;
  currentSlideIndex: number;
  selectedObjectId: string | null;
}

export interface DocumentSlice {
  slideshow: Slideshow | null;
  isDirty: boolean;
  lastSavedAt: number | null;
  setSlideshow: (slideshow: Slideshow) => void;
  markDirty: () => void;
  markClean: () => void;
  setLastSavedAt: (timestamp: number) => void;

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

  // Slideshow metadata
  updateSlideshowMeta: (data: Partial<Pick<Slideshow, "title" | "description" | "resolution" | "fps" | "backgroundColor" | "occasionType" | "status" | "aspectRatio" | "coverAssetId">>) => void;

  // Bulk operations
  bulkSetDuration: (slideIds: string[], durationFrames: number) => void;
  bulkApplyEffect: (slideIds: string[], effects: Record<string, unknown>) => void;
  bulkDeleteSlides: (slideIds: string[]) => void;
  bulkDuplicateSlides: (slideIds: string[]) => void;
}

export interface SelectionSlice {
  currentSlideIndex: number;
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  setCurrentSlideIndex: (index: number) => void;
  selectObject: (objectId: string | null) => void;
  selectObjects: (objectIds: string[]) => void;
  addToSelection: (objectId: string) => void;
  removeFromSelection: (objectId: string) => void;
  clearSelection: () => void;

  // Slide multi-select
  selectedSlideIds: string[];
  selectSlide: (slideId: string) => void;
  selectSlides: (slideIds: string[]) => void;
  addSlideToSelection: (slideId: string) => void;
  removeSlideFromSelection: (slideId: string) => void;
  selectAllSlides: () => void;
  clearSlideSelection: () => void;
}

export interface WorkspaceSlice {
  activeLeftTab: LeftTab;
  activeRightPanel: RightPanel;
  activeBottomSurface: BottomSurface;
  zoom: number;
  canvasZoom: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
  gridSize: number;
  snapThreshold: number;
  setActiveLeftTab: (tab: LeftTab) => void;
  setActiveRightPanel: (panel: RightPanel) => void;
  toggleRightPanel: (panel: RightPanel) => void;
  setActiveBottomSurface: (surface: BottomSurface) => void;
  setZoom: (zoom: number) => void;
  setCanvasZoom: (zoom: number) => void;
  setGridEnabled: (enabled: boolean) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapThreshold: (threshold: number) => void;
}

export interface PlaybackSlice {
  isPlaying: boolean;
  isPreviewMode: boolean;
  isPresenterMode: boolean;
  isEditMode: boolean;
  currentFrame: number;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setPreviewMode: (mode: boolean) => void;
  setPresenterMode: (mode: boolean) => void;
  toggleEditMode: () => void;
  setCurrentFrame: (frame: number) => void;
}

export interface HistorySlice {
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
}

export interface ClipboardSlice {
  clipboard: ClipboardItem | null;
  canPaste: boolean;
  copy: () => void;
  cut: () => void;
  paste: () => void;
}

export type EditorStore = DocumentSlice &
  SelectionSlice &
  WorkspaceSlice &
  PlaybackSlice &
  HistorySlice &
  ClipboardSlice;
