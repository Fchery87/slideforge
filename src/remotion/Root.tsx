import { Composition } from "remotion";
import {
  SlideshowComposition,
  type SlideshowCompositionProps,
} from "./compositions/slideshow-composition";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import { getResolutionDimensions } from "@/domain/slideshow/value-objects/resolution";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";

const FPS = 30;

const defaultProps: SlideshowCompositionProps = {
  slideshow: {
    id: "",
    userId: "",
    title: "Untitled",
    description: null,
    resolution: "1080p",
    fps: FPS,
    backgroundColor: "#000000",
    thumbnailUrl: null,
    slides: [],
    transitions: [],
    audioTracks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies Slideshow,
};

export const RemotionRoot = () => {
  const { width, height } = getResolutionDimensions("1080p");

  return (
    <Composition
      id="Slideshow"
      component={SlideshowComposition}
      durationInFrames={getTotalDurationFrames(defaultProps.slideshow) || FPS}
      fps={FPS}
      width={width}
      height={height}
      defaultProps={defaultProps}
      calculateMetadata={async ({ props }) => {
        const totalFrames = getTotalDurationFrames(props.slideshow);
        return {
          durationInFrames: Math.max(totalFrames, FPS),
          width: getResolutionDimensions(props.slideshow.resolution).width,
          height: getResolutionDimensions(props.slideshow.resolution).height,
          fps: props.slideshow.fps,
        };
      }}
    />
  );
};
