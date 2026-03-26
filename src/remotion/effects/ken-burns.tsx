import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import type { KenBurnsEffect } from "@/domain/slideshow/value-objects/slide-effects";

interface KenBurnsContainerProps {
  effect: KenBurnsEffect;
  children: React.ReactNode;
}

export function KenBurnsContainer({ effect, children }: KenBurnsContainerProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!effect?.enabled) {
    return <>{children}</>;
  }

  const startFrame = 0;
  const endFrame = Math.min(effect.durationFrames, durationInFrames);

  // Get easing function
  const getEasing = () => {
    switch (effect.easing) {
      case "linear":
        return Easing.linear;
      case "ease-in":
        return Easing.ease;
      case "ease-out":
        return Easing.ease;
      case "ease-in-out":
      default:
        return Easing.ease;
    }
  };

  // Calculate scale interpolation
  const scale = interpolate(
    frame,
    [startFrame, endFrame],
    [effect.startScale, effect.endScale],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: getEasing(),
    }
  );

  // Calculate position interpolation (convert percentage to pixels)
  const translateX = interpolate(
    frame,
    [startFrame, endFrame],
    [effect.startX, effect.endX],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: getEasing(),
    }
  );

  const translateY = interpolate(
    frame,
    [startFrame, endFrame],
    [effect.startY, effect.endY],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: getEasing(),
    }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `translate(${translateX}%, ${translateY}%) scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
}
