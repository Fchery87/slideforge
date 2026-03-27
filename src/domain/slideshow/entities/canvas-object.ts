export type CanvasObjectType = "image" | "text" | "shape" | "group";

export interface GroupProperties {
  childrenIds: string[];
  animation?: AnimationConfig;
}

export type AnimationType = 
  | "none" 
  | "fade-in" 
  | "fade-out"
  | "slide-up" 
  | "slide-down" 
  | "slide-left" 
  | "slide-right"
  | "scale-in"
  | "scale-out"
  | "rotate-in"
  | "bounce"
  | "typewriter";

export interface AnimationConfig {
  type: AnimationType;
  delayFrames: number;
  durationFrames: number;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bounce";
}

export interface ImageProperties {
  mediaAssetId: string;
  objectFit?: "cover" | "contain" | "fill";
  cropRect?: { x: number; y: number; width: number; height: number };
  filters?: Record<string, number>;
  animation?: AnimationConfig;
}

export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  textShadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  textOutline?: {
    color: string;
    width: number;
  };
  backgroundColor?: string;
  padding?: number;
  animation?: AnimationConfig;
}

export interface ShapeProperties {
  shapeType: "rectangle" | "circle" | "triangle";
  fill: string;
  stroke: string;
  strokeWidth: number;
  animation?: AnimationConfig;
}

export type CanvasObjectProperties = ImageProperties | TextProperties | ShapeProperties | GroupProperties;

export interface CanvasObject {
  id: string;
  slideId: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  properties: CanvasObjectProperties;
  groupId?: string; // ID of the group this object belongs to, if any
  sourceAssetId: string | null;
  animation: AnimationConfig | null;
  createdAt: Date;
  updatedAt: Date;
}
