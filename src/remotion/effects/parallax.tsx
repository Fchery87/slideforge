import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { ParallaxEffect } from "@/domain/slideshow/value-objects/slide-effects";

interface ParallaxContainerProps {
  effect: ParallaxEffect;
  children: React.ReactNode;
}

export function ParallaxContainer({ effect, children }: ParallaxContainerProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!effect?.enabled || effect.type === "none") {
    return <>{children}</>;
  }

  const strength = effect.strength / 100;
  const maxOffset = 100 * strength; // Max pixels to move

  // Calculate offset based on frame
  const offset = interpolate(
    frame,
    [0, durationInFrames],
    effect.direction === "left" || effect.direction === "up" ? [0, -maxOffset] : [0, maxOffset],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  let transform = "";

  switch (effect.type) {
    case "horizontal":
      transform = `translateX(${offset}px)`;
      break;
    case "vertical":
      transform = `translateY(${offset}px)`;
      break;
    case "diagonal":
      transform = `translate(${offset}px, ${offset * 0.5}px)`;
      break;
    case "depth":
      // Simulate depth by combining translate and scale
      const scale = 1 + (offset / 1000);
      transform = `translateZ(${offset}px) scale(${scale})`;
      break;
    default:
      break;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
}
