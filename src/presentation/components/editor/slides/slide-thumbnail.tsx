"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import { resolveBackgroundToStyle } from "@/domain/slideshow/value-objects/slide-background";
import { getMediaFileUrl } from "@/presentation/components/editor/canvas/media-url";

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

function ObjectPreview({ obj }: { obj: CanvasObject }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${(obj.x / 960) * 100}%`,
    top: `${(obj.y / 540) * 100}%`,
    width: `${(obj.width / 960) * 100}%`,
    height: `${(obj.height / 540) * 100}%`,
    opacity: obj.opacity,
    transform: `rotate(${obj.rotation}deg)`,
  };

  if (obj.type === "text") {
    const props = obj.properties as CanvasObject["properties"] & {
      content: string;
      fontColor: string;
      fontSize: number;
    };
    return (
      <div
        style={{
          ...style,
          color: props.fontColor,
          fontSize: `${(props.fontSize / 960) * 100 * 3.5}%`,
          lineHeight: 1.2,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {props.content}
      </div>
    );
  }

  if (obj.type === "shape") {
    const props = obj.properties as CanvasObject["properties"] & {
      shapeType: string;
      fill: string;
    };
    const borderRadius = props.shapeType === "circle" ? "50%" : "0";
    return (
      <div
        style={{
          ...style,
          backgroundColor: props.fill,
          borderRadius,
          clipPath:
            props.shapeType === "triangle"
              ? "polygon(50% 0%, 0% 100%, 100% 100%)"
              : undefined,
        }}
      />
    );
  }

  if (obj.type === "image") {
    const props = obj.properties as CanvasObject["properties"] & { mediaAssetId: string };
    return (
      <div
        style={{
          ...style,
          backgroundImage: `url(/api/media/${props.mediaAssetId}/file)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  return null;
}

export const SlideThumbnail = memo(function SlideThumbnail({
  slide,
  index,
  isActive,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
}: SlideThumbnailProps) {
  const backgroundStyle = resolveBackgroundToStyle(
    slide.background,
    "#1a1a2e",
    getMediaFileUrl
  );

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "group relative shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
        isActive
          ? "border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.3)]"
          : "border-white/[0.06] hover:border-white/[0.15]"
      )}
    >
      {/* Thumbnail preview */}
      <div
        className="relative aspect-video w-28 overflow-hidden"
        style={backgroundStyle}
      >
        {slide.canvasObjects.map((obj) => (
          <ObjectPreview key={obj.id} obj={obj} />
        ))}
      </div>

      {/* Slide number */}
      <div
        className={cn(
          "absolute left-1 top-1 rounded px-1 py-0.5 text-[9px] font-medium",
          isActive
            ? "bg-rose-500/80 text-white"
            : "bg-black/50 text-slate-400"
        )}
      >
        {index + 1}
      </div>

      {/* Duration badge */}
      <div className="absolute bottom-1 right-1 rounded bg-black/50 px-1 py-0.5 text-[9px] text-slate-400">
        {(slide.durationFrames / 30).toFixed(1)}s
      </div>
    </div>
  );
});
