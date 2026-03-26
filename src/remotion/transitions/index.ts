import { linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionType } from "@/domain/slideshow/value-objects/transition-type";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTransitionPresentation = any;

export function getTransitionPresentation(
  type: TransitionType
): AnyTransitionPresentation | null {
  switch (type) {
    case "fade":
    case "dissolve":
      return fade();
    case "slide":
      return slide({ direction: "from-right" });
    case "zoom":
    case "wipe":
      return wipe({ direction: "from-left" });
    case "none":
    default:
      return null;
  }
}

export function getTransitionTiming(durationInFrames: number) {
  return linearTiming({ durationInFrames });
}
