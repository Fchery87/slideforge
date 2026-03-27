import { beforeEach, describe, expect, test } from "bun:test";
import { useEditorStore } from "@/presentation/stores/editor-store";

const makeSlideshow = () => ({
  id: "deck-1",
  title: "Test Deck",
  description: null,
  resolution: "1080p",
  fps: 30,
  backgroundColor: "#000000",
  slides: [
    {
      id: "slide-1",
      slideshowId: "deck-1",
      order: 0,
      durationFrames: 90,
      background: null,
      layoutId: null,
      notes: "",
      effects: null,
      canvasObjects: [
        {
          id: "obj-1",
          slideId: "slide-1",
          type: "text",
          x: 10,
          y: 10,
          width: 100,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          properties: {
            content: "One",
            fontFamily: "Plus Jakarta Sans",
            fontSize: 20,
            fontColor: "#fff",
            fontWeight: "normal",
            textAlign: "left",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "obj-2",
          slideId: "slide-1",
          type: "text",
          x: 140,
          y: 10,
          width: 100,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          properties: {
            content: "Two",
            fontFamily: "Plus Jakarta Sans",
            fontSize: 20,
            fontColor: "#fff",
            fontWeight: "normal",
            textAlign: "left",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  transitions: [],
  audioTracks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("editor grouping", () => {
  beforeEach(() => {
    useEditorStore.setState({
      slideshow: makeSlideshow(),
      currentSlideIndex: 0,
      selectedObjectId: null,
      selectedObjectIds: [],
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      isDirty: false,
    });
  });

  test("groupObjects assigns a shared groupId without creating a phantom group object", () => {
    const state = useEditorStore.getState();

    state.groupObjects("slide-1", ["obj-1", "obj-2"]);

    const next = useEditorStore.getState();
    const objects = next.slideshow.slides[0].canvasObjects;

    expect(objects).toHaveLength(2);
    expect(objects[0].groupId).toBeTruthy();
    expect(objects[0].groupId).toBe(objects[1].groupId);
    expect(next.selectedObjectIds).toEqual(["obj-1", "obj-2"]);
  });

  test("ungroupObject clears shared group membership", () => {
    const state = useEditorStore.getState();

    state.groupObjects("slide-1", ["obj-1", "obj-2"]);
    const groupId = useEditorStore.getState().slideshow.slides[0].canvasObjects[0].groupId;

    useEditorStore.getState().ungroupObject("slide-1", groupId);

    const next = useEditorStore.getState();
    expect(next.slideshow.slides[0].canvasObjects.every((item) => !item.groupId)).toBe(true);
    expect(next.selectedObjectIds).toEqual(["obj-1", "obj-2"]);
  });
});
