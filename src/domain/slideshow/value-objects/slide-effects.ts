export type KenBurnsDirection = "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";

export interface KenBurnsEffect {
  enabled: boolean;
  direction: KenBurnsDirection;
  startScale: number; // 1.0 = 100%, 1.5 = 150%, etc.
  endScale: number;
  startX: number; // -50 to 50 (percentage offset)
  startY: number; // -50 to 50 (percentage offset)
  endX: number;
  endY: number;
  durationFrames: number;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export type FilterType = "none" | "grayscale" | "sepia" | "vintage" | "cinematic" | "black-white" | "warm" | "cool" | "vivid" | "dramatic";

export interface ColorFilter {
  enabled: boolean;
  type: FilterType;
  intensity: number; // 0-100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
}

export type OverlayType = "none" | "film-grain" | "dust" | "light-leak" | "vignette" | "lens-flare" | "particles" | "snow" | "rain" | "confetti";

export interface OverlayEffect {
  enabled: boolean;
  type: OverlayType;
  opacity: number; // 0-100
  color?: string; // For light leaks, etc.
  intensity?: number; // For particles, etc.
}

export type ParallaxType = "none" | "horizontal" | "vertical" | "diagonal" | "depth";

export interface ParallaxEffect {
  enabled: boolean;
  type: ParallaxType;
  strength: number; // 0-100
  direction: "left" | "right" | "up" | "down";
}

export interface SlideEffects {
  kenBurns?: KenBurnsEffect;
  filter?: ColorFilter;
  overlay?: OverlayEffect;
  parallax?: ParallaxEffect;
}

// Preset configurations
export const KEN_BURNS_PRESETS: Record<string, Partial<KenBurnsEffect>> = {
  "slow-zoom-in": {
    direction: "zoom-in",
    startScale: 1,
    endScale: 1.2,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    durationFrames: 150,
    easing: "ease-in-out",
  },
  "slow-zoom-out": {
    direction: "zoom-out",
    startScale: 1.2,
    endScale: 1,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    durationFrames: 150,
    easing: "ease-in-out",
  },
  "pan-right": {
    direction: "pan-right",
    startScale: 1.1,
    endScale: 1.1,
    startX: -10,
    startY: 0,
    endX: 10,
    endY: 0,
    durationFrames: 150,
    easing: "linear",
  },
  "pan-left": {
    direction: "pan-left",
    startScale: 1.1,
    endScale: 1.1,
    startX: 10,
    startY: 0,
    endX: -10,
    endY: 0,
    durationFrames: 150,
    easing: "linear",
  },
  "zoom-pan": {
    direction: "zoom-in",
    startScale: 1,
    endScale: 1.3,
    startX: -5,
    startY: -5,
    endX: 5,
    endY: 5,
    durationFrames: 150,
    easing: "ease-out",
  },
};

export const FILTER_PRESETS: Record<FilterType, Partial<ColorFilter>> = {
  none: { enabled: false },
  grayscale: { enabled: true, type: "grayscale", intensity: 100, brightness: 0, contrast: 0, saturation: -100 },
  sepia: { enabled: true, type: "sepia", intensity: 80, brightness: 5, contrast: 10, saturation: -30 },
  vintage: { enabled: true, type: "vintage", intensity: 70, brightness: 10, contrast: -10, saturation: -20 },
  cinematic: { enabled: true, type: "cinematic", intensity: 60, brightness: -5, contrast: 20, saturation: 10 },
  "black-white": { enabled: true, type: "black-white", intensity: 100, brightness: 0, contrast: 30, saturation: -100 },
  warm: { enabled: true, type: "warm", intensity: 50, brightness: 10, contrast: 0, saturation: 20 },
  cool: { enabled: true, type: "cool", intensity: 50, brightness: 0, contrast: 0, saturation: -10 },
  vivid: { enabled: true, type: "vivid", intensity: 80, brightness: 10, contrast: 20, saturation: 40 },
  dramatic: { enabled: true, type: "dramatic", intensity: 90, brightness: -15, contrast: 40, saturation: -10 },
};

export const OVERLAY_PRESETS: Record<OverlayType, Partial<OverlayEffect>> = {
  none: { enabled: false },
  "film-grain": { enabled: true, type: "film-grain", opacity: 30 },
  dust: { enabled: true, type: "dust", opacity: 20 },
  "light-leak": { enabled: true, type: "light-leak", opacity: 40, color: "#ffaa00" },
  vignette: { enabled: true, type: "vignette", opacity: 50 },
  "lens-flare": { enabled: true, type: "lens-flare", opacity: 35 },
  particles: { enabled: true, type: "particles", opacity: 60, intensity: 50 },
  snow: { enabled: true, type: "snow", opacity: 70, intensity: 80 },
  rain: { enabled: true, type: "rain", opacity: 50, intensity: 60 },
  confetti: { enabled: true, type: "confetti", opacity: 80, intensity: 70 },
};

export const PARALLAX_PRESETS: Record<string, Partial<ParallaxEffect>> = {
  "horizontal-left": { enabled: true, type: "horizontal", strength: 30, direction: "left" },
  "horizontal-right": { enabled: true, type: "horizontal", strength: 30, direction: "right" },
  "vertical-up": { enabled: true, type: "vertical", strength: 25, direction: "up" },
  "vertical-down": { enabled: true, type: "vertical", strength: 25, direction: "down" },
  "diagonal": { enabled: true, type: "diagonal", strength: 40, direction: "right" },
  "depth": { enabled: true, type: "depth", strength: 50, direction: "right" },
};

export function createDefaultKenBurnsEffect(): KenBurnsEffect {
  return {
    enabled: false,
    direction: "zoom-in",
    startScale: 1,
    endScale: 1.2,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    durationFrames: 150,
    easing: "ease-in-out",
  };
}

export function createDefaultColorFilter(): ColorFilter {
  return {
    enabled: false,
    type: "none",
    intensity: 50,
    brightness: 0,
    contrast: 0,
    saturation: 0,
  };
}

export function createDefaultOverlayEffect(): OverlayEffect {
  return {
    enabled: false,
    type: "none",
    opacity: 50,
  };
}

export function createDefaultParallaxEffect(): ParallaxEffect {
  return {
    enabled: false,
    type: "none",
    strength: 30,
    direction: "right",
  };
}

export function createDefaultSlideEffects(): SlideEffects {
  return {
    kenBurns: createDefaultKenBurnsEffect(),
    filter: createDefaultColorFilter(),
    overlay: createDefaultOverlayEffect(),
    parallax: createDefaultParallaxEffect(),
  };
}
