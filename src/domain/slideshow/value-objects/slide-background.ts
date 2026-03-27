export type SlideBackground =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; value: string }
  | { kind: "image"; mediaAssetId: string; objectFit: "cover" | "contain" }
  | { kind: "theme-default" };

export function createSolidBackground(color: string = "#000000"): SlideBackground {
  return { kind: "solid", color };
}

export function createGradientBackground(value: string): SlideBackground {
  return { kind: "gradient", value };
}

export function createImageBackground(
  mediaAssetId: string,
  objectFit: "cover" | "contain" = "cover"
): SlideBackground {
  return { kind: "image", mediaAssetId, objectFit };
}

export function createThemeDefaultBackground(): SlideBackground {
  return { kind: "theme-default" };
}

export function resolveBackgroundToCss(bg: SlideBackground | null | undefined, fallback: string = "#000000"): string {
  if (!bg) return fallback;
  switch (bg.kind) {
    case "solid":
      return bg.color;
    case "gradient":
      return bg.value;
    case "theme-default":
      return fallback;
    case "image":
      return fallback;
  }
}

export function resolveBackgroundToStyle(
  bg: SlideBackground | null | undefined,
  fallback: string = "#000000",
  imageUrlResolver?: (mediaAssetId: string) => string
): React.CSSProperties {
  if (!bg) return { backgroundColor: fallback };
  switch (bg.kind) {
    case "solid":
      return { backgroundColor: bg.color };
    case "gradient":
      return { background: bg.value };
    case "image": {
      const url = imageUrlResolver ? imageUrlResolver(bg.mediaAssetId) : "";
      return {
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: bg.objectFit,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: fallback,
      };
    }
    case "theme-default":
      return { backgroundColor: fallback };
  }
}

export function migrateLegacyBackgroundColor(color: string | null | undefined): SlideBackground {
  if (!color) return createSolidBackground("#000000");
  return createSolidBackground(color);
}
