"use client";

import type { Slide } from "@/domain/slideshow/entities/slide";
import type { CanvasObject, TextProperties, ShapeProperties, ImageProperties } from "@/domain/slideshow/entities/canvas-object";
import { resolveBackgroundToStyle } from "@/domain/slideshow/value-objects/slide-background";
import { getMediaFileUrl } from "@/presentation/components/editor/canvas/media-url";

interface SlideRendererProps {
  slide: Slide;
  fallbackBg?: string;
  mediaUrlResolver?: (mediaAssetId: string) => string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface ObjectRendererProps {
  obj: CanvasObject;
  containerWidth: number;
  containerHeight: number;
  mediaUrlResolver?: (mediaAssetId: string) => string;
}

function ObjectRenderer({
  obj,
  containerWidth,
  containerHeight,
  mediaUrlResolver = getMediaFileUrl,
}: ObjectRendererProps) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${(obj.x / containerWidth) * 100}%`,
    top: `${(obj.y / containerHeight) * 100}%`,
    width: `${(obj.width / containerWidth) * 100}%`,
    height: `${(obj.height / containerHeight) * 100}%`,
    transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
    opacity: obj.opacity,
    zIndex: obj.zIndex,
  };

  switch (obj.type) {
    case "text": {
      const props = obj.properties as TextProperties;
      return (
        <div
          style={{
            ...style,
            fontFamily: props.fontFamily || "sans-serif",
            fontSize: `${(props.fontSize / containerHeight) * 100}%`,
            color: props.fontColor || "#ffffff",
            fontWeight: props.fontWeight || "normal",
            textAlign: props.textAlign || "left",
            lineHeight: props.lineHeight ?? 1.2,
            letterSpacing: props.letterSpacing,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            wordBreak: "break-word",
            backgroundColor: props.backgroundColor,
            padding: props.padding,
            textShadow: props.textShadow
              ? `${props.textShadow.offsetX}px ${props.textShadow.offsetY}px ${props.textShadow.blur}px ${props.textShadow.color}`
              : undefined,
            WebkitTextStroke: props.textOutline
              ? `${props.textOutline.width}px ${props.textOutline.color}`
              : undefined,
          }}
        >
          {props.content || ""}
        </div>
      );
    }

    case "shape": {
      const props = obj.properties as ShapeProperties;
      const fill = props.fill || "#6366F1";
      const stroke = props.stroke || "transparent";
      const strokeWidth = props.strokeWidth || 0;

      if (props.shapeType === "circle") {
        return (
          <div style={style}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <ellipse
                cx="50"
                cy="50"
                rx="48"
                ry="48"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            </svg>
          </div>
        );
      }

      if (props.shapeType === "triangle") {
        return (
          <div style={style}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <polygon
                points="50,2 98,98 2,98"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            </svg>
          </div>
        );
      }

      // rectangle (default)
      return (
        <div
          style={{
            ...style,
            backgroundColor: fill,
            border:
              strokeWidth > 0
                ? `${strokeWidth}px solid ${stroke}`
                : undefined,
          }}
        />
      );
    }

    case "image": {
      const props = obj.properties as ImageProperties;
      return (
        <img
          src={mediaUrlResolver(props.mediaAssetId)}
          alt=""
          style={{
            ...style,
            objectFit: props.objectFit || "cover",
          }}
          loading="lazy"
        />
      );
    }

    case "group": {
      // Groups are not fully supported for preview/export yet
      // Render children individually instead
      return null;
    }

    default:
      return null;
  }
}

export function SlideRenderer({
  slide,
  fallbackBg = "#000000",
  mediaUrlResolver = getMediaFileUrl,
  width = 1920,
  height = 1080,
  className,
  style,
}: SlideRendererProps) {
  const backgroundStyle = resolveBackgroundToStyle(
    slide.background,
    fallbackBg,
    mediaUrlResolver
  );
  const sortedObjects = [...slide.canvasObjects].sort(
    (a, b) => a.zIndex - b.zIndex
  );

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...backgroundStyle,
        ...style,
      }}
    >
      {sortedObjects.map((obj) => (
        <ObjectRenderer
          key={obj.id}
          obj={obj}
          containerWidth={width}
          containerHeight={height}
          mediaUrlResolver={mediaUrlResolver}
        />
      ))}
    </div>
  );
}
