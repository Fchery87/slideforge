import { Img } from "remotion";
import type { ImageProperties } from "@/domain/slideshow/entities/canvas-object";

type ImageSequenceProps = {
  properties: ImageProperties;
  width: number;
  height: number;
};

export function ImageSequence({ properties, width, height }: ImageSequenceProps) {
  const src = properties.mediaAssetId;

  return (
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}
