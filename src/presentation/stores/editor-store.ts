import { create } from "zustand";
import type { EditorStore } from "./editor/types";
import { createDocumentSlice } from "./editor/document-slice";
import { createSelectionSlice } from "./editor/selection-slice";
import { createWorkspaceSlice } from "./editor/workspace-slice";
import { createPlaybackSlice } from "./editor/playback-slice";
import { createHistorySlice } from "./editor/history-slice";
import { createClipboardSlice } from "./editor/clipboard-slice";

export const useEditorStore = create<EditorStore>()((...args) => ({
  ...createDocumentSlice(...args),
  ...createSelectionSlice(...args),
  ...createWorkspaceSlice(...args),
  ...createPlaybackSlice(...args),
  ...createHistorySlice(...args),
  ...createClipboardSlice(...args),
}));

// Re-export types for convenience
export type {
  EditorStore,
  DocumentSlice,
  SelectionSlice,
  WorkspaceSlice,
  PlaybackSlice,
  HistorySlice,
  ClipboardSlice,
  RightPanel,
  LeftTab,
  BottomSurface,
} from "./editor/types";
