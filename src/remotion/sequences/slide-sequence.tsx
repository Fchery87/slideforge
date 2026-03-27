import { AbsoluteFill } from "remotion";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { CanvasObject, ShapeProperties } from "@/domain/slideshow/entities/canvas-object";
import { ImageSequence } from "./image-sequence";
import { TextSequence } from "./text-sequence";
import { KenBurnsContainer, FilterContainer, OverlayContainer, ParallaxContainer } from "../effects";
import { createDefaultSlideEffects } from "@/domain/slideshow/value-objects/slide-effects";
import { resolveBackgroundToCss } from "@/domain/slideshow/value-objects/slide-background";

type SlideSequenceProps = {
  slide: Slide;
};

function renderShapeStyle(properties: ShapeProperties): React.CSSProperties {
  const base: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: properties.fill,
    border: `${properties.strokeWidth}px solid ${properties.stroke}`,
  };

  switch (properties.shapeType) {
    case "circle":
      return { ...base, borderRadius: "50%" };
    case "triangle":
      return {
        width: 0,
        height: 0,
        background: "transparent",
        borderLeft: "50% solid transparent",
        borderRight: "50% solid transparent",
        borderBottom: `100% solid ${properties.fill}`,
      };
    case "rectangle":
    default:
      return base;
  }
}

function renderCanvasObject(obj: CanvasObject) {
  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    transform: `rotate(${obj.rotation}deg)`,
    opacity: obj.opacity,
    zIndex: obj.zIndex,
  };

  switch (obj.type) {
    case "image":
      return (
        <div key={obj.id} style={positionStyle}>
          <ImageSequence
            properties={obj.properties as import("@/domain/slideshow/entities/canvas-object").ImageProperties}
            width={obj.width}
            height={obj.height}
          />
        </div>
      );
    case "text":
      return (
        <div key={obj.id} style={positionStyle}>
          <TextSequence
            properties={obj.properties as import("@/domain/slideshow/entities/canvas-object").TextProperties}
            width={obj.width}
            height={obj.height}
          />
        </div>
      );
    case "shape":
      return (
        <div
          key={obj.id}
          style={{
            ...positionStyle,
            ...renderShapeStyle(obj.properties as ShapeProperties),
          }}
        />
      );
    default:
      return null;
  }
}

export function SlideSequence({ slide }: SlideSequenceProps) {
  const sortedObjects = [...slide.canvasObjects].sort(
    (a, b) => a.zIndex - b.zIndex
  );

  // Get effects with defaults
  const defaultEffects = createDefaultSlideEffects();
  const effects = slide.effects || defaultEffects;

  const slideContent = (
    <AbsoluteFill
      style={{
        backgroundColor: resolveBackgroundToCss(slide.background, "#000000"),
      }}
    >
      {sortedObjects.map(renderCanvasObject)}
    </AbsoluteFill>
  );

  // Wrap with effect containers (order matters - from inner to outer)
  return (
    <ParallaxContainer effect={effects.parallax ?? defaultEffects.parallax!}>
      <OverlayContainer overlay={effects.overlay ?? defaultEffects.overlay!}>
        <FilterContainer filter={effects.filter ?? defaultEffects.filter!}>
          <KenBurnsContainer effect={effects.kenBurns ?? defaultEffects.kenBurns!}>
            {slideContent}
          </KenBurnsContainer>
        </FilterContainer>
      </OverlayContainer>
    </ParallaxContainer>
  );
}
