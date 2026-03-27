import type {
  CanvasObject,
  ShapeProperties,
  TextProperties,
} from "@/domain/slideshow/entities/canvas-object";
import type { AspectRatio } from "@/domain/slideshow/entities/slideshow";

export type SlideLayoutId =
  | "title"
  | "title-content"
  | "two-column"
  | "full-image"
  | "blank";

// Canvas dimensions per aspect ratio
export const CANVAS_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 960, height: 540 },
  "9:16": { width: 540, height: 960 },
  "4:3": { width: 960, height: 720 },
  "1:1": { width: 720, height: 720 },
};

// Layouts that work well with each aspect ratio
export const LAYOUT_ASPECT_COMPATIBILITY: Record<SlideLayoutId, AspectRatio[]> = {
  "title": ["16:9", "9:16", "4:3", "1:1"],
  "title-content": ["16:9", "4:3"],
  "two-column": ["16:9", "4:3"],
  "full-image": ["16:9", "9:16", "4:3", "1:1"],
  "blank": ["16:9", "9:16", "4:3", "1:1"],
};

export function getCompatibleLayouts(aspectRatio: AspectRatio): SlideLayoutId[] {
  return (Object.keys(LAYOUT_ASPECT_COMPATIBILITY) as SlideLayoutId[]).filter(
    (layoutId) => LAYOUT_ASPECT_COMPATIBILITY[layoutId].includes(aspectRatio)
  );
}

const DEFAULT_TEXT_COLOR = "#F8FAFC";
const DEFAULT_MUTED_COLOR = "#CBD5E1";
const DEFAULT_FONT = "Plus Jakarta Sans";

function createTextObject(
  slideId: string,
  id: string,
  content: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  textAlign: TextProperties["textAlign"] = "left",
  zIndex: number
): CanvasObject {
  return {
    id,
    slideId,
    type: "text",
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    zIndex,
    properties: {
      content,
      fontFamily: DEFAULT_FONT,
      fontSize,
      fontColor: DEFAULT_TEXT_COLOR,
      fontWeight: fontSize >= 40 ? "bold" : "normal",
      textAlign,
      lineHeight: 1.2,
    } satisfies TextProperties,
    sourceAssetId: null,
    animation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createShapeObject(
  slideId: string,
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  zIndex: number
): CanvasObject {
  return {
    id,
    slideId,
    type: "shape",
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    zIndex,
    properties: {
      shapeType: "rectangle",
      fill,
      stroke: "transparent",
      strokeWidth: 0,
    } satisfies ShapeProperties,
    sourceAssetId: null,
    animation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createSlideLayoutObjects(
  layoutId: SlideLayoutId,
  slideId: string
): CanvasObject[] {
  switch (layoutId) {
    case "title":
      return [
        createTextObject(
          slideId,
          crypto.randomUUID(),
          "Presentation Title",
          120,
          170,
          720,
          90,
          54,
          "center",
          1
        ),
        {
          ...createTextObject(
            slideId,
            crypto.randomUUID(),
            "A concise subtitle or presenter name",
            210,
            280,
            540,
            40,
            22,
            "center",
            2
          ),
          properties: {
            content: "A concise subtitle or presenter name",
            fontFamily: DEFAULT_FONT,
            fontSize: 22,
            fontColor: DEFAULT_MUTED_COLOR,
            fontWeight: "normal",
            textAlign: "center",
            lineHeight: 1.3,
          },
        },
      ];
    case "title-content":
      return [
        createTextObject(
          slideId,
          crypto.randomUUID(),
          "Section Heading",
          72,
          56,
          816,
          64,
          40,
          "left",
          1
        ),
        {
          ...createTextObject(
            slideId,
            crypto.randomUUID(),
            "",
            72,
            150,
            816,
            220,
            24,
            "left",
            2
          ),
          properties: {
            fontFamily: DEFAULT_FONT,
            fontSize: 24,
            fontColor: DEFAULT_MUTED_COLOR,
            fontWeight: "normal",
            textAlign: "left",
            lineHeight: 1.5,
            content:
              "Use this space for your main talking points.\n\n• Clear idea one\n• Clear idea two\n• Clear idea three",
          } satisfies TextProperties,
        },
      ];
    case "two-column":
      return [
        createTextObject(
          slideId,
          crypto.randomUUID(),
          "Comparison or Breakdown",
          72,
          48,
          816,
          56,
          38,
          "left",
          1
        ),
        createShapeObject(slideId, crypto.randomUUID(), 468, 140, 2, 280, "rgba(248,250,252,0.15)", 2),
        {
          ...createTextObject(
            slideId,
            crypto.randomUUID(),
            "",
            72,
            146,
            340,
            250,
            22,
            "left",
            3
          ),
          properties: {
            fontFamily: DEFAULT_FONT,
            fontSize: 22,
            fontColor: DEFAULT_MUTED_COLOR,
            fontWeight: "normal",
            textAlign: "left",
            lineHeight: 1.5,
            content: "Left column\n\n• Point one\n• Point two\n• Point three",
          } satisfies TextProperties,
        },
        {
          ...createTextObject(
            slideId,
            crypto.randomUUID(),
            "",
            548,
            146,
            340,
            250,
            22,
            "left",
            4
          ),
          properties: {
            fontFamily: DEFAULT_FONT,
            fontSize: 22,
            fontColor: DEFAULT_MUTED_COLOR,
            fontWeight: "normal",
            textAlign: "left",
            lineHeight: 1.5,
            content: "Right column\n\n• Point one\n• Point two\n• Point three",
          } satisfies TextProperties,
        },
      ];
    case "full-image":
      return [
        createShapeObject(slideId, crypto.randomUUID(), 0, 0, 960, 540, "rgba(15,23,42,0.45)", 1),
        createTextObject(
          slideId,
          crypto.randomUUID(),
          "Replace with a full-bleed image from Media",
          120,
          222,
          720,
          56,
          30,
          "center",
          2
        ),
      ];
    case "blank":
    default:
      return [];
  }
}
