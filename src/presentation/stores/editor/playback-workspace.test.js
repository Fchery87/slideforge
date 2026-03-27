import { beforeEach, describe, expect, test } from "bun:test";
import { useEditorStore } from "@/presentation/stores/editor-store";

const resetStore = () => {
  useEditorStore.setState({
    isPlaying: false,
    isPreviewMode: false,
    isPresenterMode: false,
    isEditMode: true,
    currentFrame: 0,
    activeLeftTab: "media",
    activeRightPanel: "properties",
    activeBottomSurface: "timeline",
    zoom: 1,
  });
};

describe("editor playback/workspace state", () => {
  beforeEach(() => {
    resetStore();
  });

  test("entering preview mode exits edit and presenter modes", () => {
    const state = useEditorStore.getState();

    state.setPresenterMode(true);
    state.setPreviewMode(true);

    const next = useEditorStore.getState();
    expect(next.isPreviewMode).toBe(true);
    expect(next.isPresenterMode).toBe(false);
    expect(next.isEditMode).toBe(false);
  });

  test("toggling edit mode switches between edit and preview surfaces", () => {
    const state = useEditorStore.getState();

    state.toggleEditMode();
    let next = useEditorStore.getState();
    expect(next.isEditMode).toBe(false);
    expect(next.isPreviewMode).toBe(true);
    expect(next.isPresenterMode).toBe(false);

    next.toggleEditMode();
    next = useEditorStore.getState();
    expect(next.isEditMode).toBe(true);
    expect(next.isPreviewMode).toBe(false);
    expect(next.isPresenterMode).toBe(false);
  });
});
