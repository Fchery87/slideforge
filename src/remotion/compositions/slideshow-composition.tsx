import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import type { Transition } from "@/domain/slideshow/entities/transition";
import { SlideSequence } from "../sequences/slide-sequence";
import { AudioLayer } from "../audio/audio-layer";
import {
  getTransitionPresentation,
  getTransitionTiming,
} from "../transitions";

export type SlideshowCompositionProps = {
  slideshow: Slideshow;
};

function getTransitionBetween(
  transitions: Transition[],
  fromSlideId: string,
  toSlideId: string
): Transition | undefined {
  return transitions.find(
    (t) => t.fromSlideId === fromSlideId && t.toSlideId === toSlideId
  );
}

export function SlideshowComposition({
  slideshow,
}: SlideshowCompositionProps) {
  const { slides, transitions, audioTracks, backgroundColor } = slideshow;

  const elements: React.ReactNode[] = [];

  slides.forEach((slide, index) => {
    elements.push(
      <TransitionSeries.Sequence
        key={`slide-${slide.id}`}
        durationInFrames={slide.durationFrames}
      >
        <SlideSequence slide={slide} />
      </TransitionSeries.Sequence>
    );

    if (index < slides.length - 1) {
      const nextSlide = slides[index + 1];
      const transition = getTransitionBetween(
        transitions,
        slide.id,
        nextSlide.id
      );

      if (transition && transition.type !== "none") {
        const presentation = getTransitionPresentation(transition.type);
        if (presentation) {
          elements.push(
            <TransitionSeries.Transition
              key={`transition-${transition.id}`}
              presentation={presentation}
              timing={getTransitionTiming(transition.durationFrames)}
            />
          );
        }
      }
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: backgroundColor ?? "#000000" }}>
      <TransitionSeries>{elements}</TransitionSeries>
      <AudioLayer tracks={audioTracks} />
    </AbsoluteFill>
  );
}
