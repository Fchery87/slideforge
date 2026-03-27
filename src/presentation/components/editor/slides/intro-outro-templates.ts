export interface IntroOutroTemplate {
  id: string;
  label: string;
  category: "intro" | "outro";
  objects: Array<{
    type: "text";
    preset: string;
    text: string;
    x: number;
    y: number;
  }>;
  background: { kind: "solid"; color: string };
}

export const INTRO_OUTRO_TEMPLATES: IntroOutroTemplate[] = [
  {
    id: "title-slide",
    label: "Title Slide",
    category: "intro",
    objects: [
      { type: "text", preset: "heading", text: "Your Title Here", x: 480, y: 200 },
      { type: "text", preset: "subheading", text: "Subtitle", x: 480, y: 300 },
    ],
    background: { kind: "solid", color: "#1a1a2e" },
  },
  {
    id: "date-slide",
    label: "Event / Date",
    category: "intro",
    objects: [
      { type: "text", preset: "date", text: "March 27, 2026", x: 480, y: 260 },
    ],
    background: { kind: "solid", color: "#16213e" },
  },
  {
    id: "thank-you",
    label: "Thank You",
    category: "outro",
    objects: [
      { type: "text", preset: "closing", text: "Thank You", x: 480, y: 220 },
      { type: "text", preset: "caption", text: "With love and gratitude", x: 480, y: 310 },
    ],
    background: { kind: "solid", color: "#1a1a2e" },
  },
  {
    id: "dedication",
    label: "Dedication",
    category: "outro",
    objects: [
      { type: "text", preset: "closing", text: "In Loving Memory", x: 480, y: 220 },
      { type: "text", preset: "body", text: "1950 - 2026", x: 480, y: 300 },
    ],
    background: { kind: "solid", color: "#0f0f23" },
  },
];
