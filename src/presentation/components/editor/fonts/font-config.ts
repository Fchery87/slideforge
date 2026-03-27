export interface FontEntry {
  family: string;
  category: FontCategory;
  weights: number[];
  /** Google Fonts family name (if different from display name) */
  googleName?: string;
}

export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "monospace"
  | "handwriting";

export const FONT_CATEGORIES: { value: FontCategory; label: string }[] = [
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "display", label: "Display" },
  { value: "monospace", label: "Monospace" },
  { value: "handwriting", label: "Handwriting" },
];

export const EDITOR_FONTS: FontEntry[] = [
  // — Sans Serif (modern, clean) —
  { family: "Plus Jakarta Sans", category: "sans-serif", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Outfit", category: "sans-serif", weights: [300, 400, 500, 600, 700] },
  { family: "Syne", category: "sans-serif", weights: [400, 500, 600, 700, 800] },
  { family: "Manrope", category: "sans-serif", weights: [300, 400, 500, 600, 700, 800] },
  { family: "DM Sans", category: "sans-serif", weights: [400, 500, 600, 700] },
  { family: "Nunito Sans", category: "sans-serif", weights: [300, 400, 600, 700] },
  { family: "Source Sans 3", category: "sans-serif", weights: [300, 400, 600, 700] },
  { family: "Figtree", category: "sans-serif", weights: [300, 400, 500, 600, 700] },
  { family: "Bricolage Grotesque", category: "sans-serif", weights: [400, 500, 600, 700, 800] },
  { family: "Work Sans", category: "sans-serif", weights: [300, 400, 500, 600, 700] },
  { family: "Urbanist", category: "sans-serif", weights: [300, 400, 500, 600, 700, 800] },

  // — Serif (elegant, editorial) —
  { family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 800] },
  { family: "Crimson Pro", category: "serif", weights: [300, 400, 500, 600, 700] },
  { family: "Newsreader", category: "serif", weights: [300, 400, 500, 600, 700] },
  { family: "Lora", category: "serif", weights: [400, 500, 600, 700] },
  { family: "Cormorant Garamond", category: "serif", weights: [300, 400, 500, 600, 700] },
  { family: "DM Serif Display", category: "serif", weights: [400] },
  { family: "Fraunces", category: "serif", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Bitter", category: "serif", weights: [300, 400, 500, 600, 700] },

  // — Display (headlines, impact) —
  { family: "Archivo Black", category: "display", weights: [400] },
  { family: "Bebas Neue", category: "display", weights: [400] },
  { family: "Anton", category: "display", weights: [400] },
  { family: "Righteous", category: "display", weights: [400] },
  { family: "Abril Fatface", category: "display", weights: [400] },
  { family: "Lexend", category: "display", weights: [300, 400, 500, 600, 700] },
  { family: "Fredoka", category: "display", weights: [400, 500, 600, 700] },
  { family: "Unbounded", category: "display", weights: [300, 400, 500, 600, 700] },

  // — Monospace (code, technical) —
  { family: "JetBrains Mono", category: "monospace", weights: [300, 400, 500, 600, 700] },
  { family: "Fira Code", category: "monospace", weights: [300, 400, 500, 600, 700] },
  { family: "IBM Plex Mono", category: "monospace", weights: [300, 400, 500, 600, 700] },
  { family: "Space Mono", category: "monospace", weights: [400, 700] },
  { family: "Source Code Pro", category: "monospace", weights: [300, 400, 500, 600, 700] },

  // — Handwriting (casual, organic) —
  { family: "Caveat", category: "handwriting", weights: [400, 500, 600, 700] },
  { family: "Kalam", category: "handwriting", weights: [300, 400, 700] },
  { family: "Indie Flower", category: "handwriting", weights: [400] },
  { family: "Satisfy", category: "handwriting", weights: [400] },
  { family: "Dancing Script", category: "handwriting", weights: [400, 500, 600, 700] },
  { family: "Pacifico", category: "handwriting", weights: [400] },
];

/** All font family names as a flat array */
export const FONT_FAMILY_NAMES = EDITOR_FONTS.map((f) => f.family);

/** Build a Google Fonts URL to load all editor fonts */
export function buildGoogleFontsUrl(fonts: FontEntry[] = EDITOR_FONTS): string {
  const families = fonts.map((f) => {
    const name = (f.googleName ?? f.family).replace(/ /g, "+");
    const weights = f.weights.join(";");
    return `family=${name}:wght@${weights}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
