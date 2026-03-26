import type { Slide } from "../entities/slide";

export function reindexSlideOrder(slides: Slide[]): Slide[] {
  return slides
    .sort((a, b) => a.order - b.order)
    .map((slide, index) => ({ ...slide, order: index }));
}

export function validateSlideOrder(slides: Slide[]): boolean {
  const sorted = [...slides].sort((a, b) => a.order - b.order);
  return sorted.every((slide, index) => slide.order === index);
}

export function findInsertPosition(slides: Slide[], afterSlideId?: string): number {
  if (!afterSlideId) return slides.length;
  const index = slides.findIndex((s) => s.id === afterSlideId);
  return index === -1 ? slides.length : index + 1;
}
