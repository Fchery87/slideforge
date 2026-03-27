import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { CanvasObject, TextProperties } from "@/domain/slideshow/entities/canvas-object";
import { nanoid } from "nanoid";

export interface AddTextBlockInput {
  slideId: string;
  text: string;
  preset?: "heading" | "subheading" | "body" | "caption" | "date" | "closing";
  x?: number;
  y?: number;
}

const PRESET_STYLES: Record<string, Partial<TextProperties>> = {
  heading: { fontSize: 64, fontWeight: "bold", textAlign: "center" },
  subheading: { fontSize: 36, fontWeight: "bold", textAlign: "center" },
  body: { fontSize: 24, fontWeight: "normal", textAlign: "left" },
  caption: { fontSize: 18, fontWeight: "normal", textAlign: "center" },
  date: { fontSize: 20, fontWeight: "normal", textAlign: "center" },
  closing: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
};

export class AddTextBlockCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: AddTextBlockInput): Promise<CanvasObject> {
    const style = PRESET_STYLES[input.preset ?? "body"] ?? PRESET_STYLES.body;
    const now = new Date();
    const obj: CanvasObject = {
      id: nanoid(),
      slideId: input.slideId,
      type: "text",
      x: input.x ?? 100,
      y: input.y ?? 100,
      width: 400,
      height: 60,
      rotation: 0,
      opacity: 100,
      zIndex: 10,
      properties: {
        content: input.text,
        fontFamily: "Plus Jakarta Sans",
        fontSize: style.fontSize ?? 24,
        fontWeight: style.fontWeight ?? "normal",
        fontColor: "#ffffff",
        textAlign: style.textAlign ?? "left",
      },
      sourceAssetId: null,
      animation: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.slideshowRepo.upsertCanvasObjects(input.slideId, [obj]);
    return obj;
  }
}
