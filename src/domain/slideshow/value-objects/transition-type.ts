export const TransitionTypes = {
  NONE: "none",
  FADE: "fade",
  SLIDE: "slide",
  ZOOM: "zoom",
  DISSOLVE: "dissolve",
  WIPE: "wipe",
} as const;

export type TransitionType = (typeof TransitionTypes)[keyof typeof TransitionTypes];

export const DEFAULT_TRANSITION_DURATION_FRAMES = 30; // 1 second at 30fps
