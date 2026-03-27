import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { CanvasObject, TextProperties } from "@/domain/slideshow/entities/canvas-object";

export interface UpdateTextBlockInput {
  slideId: string;
  objectId: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  textShadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  textOutline?: {
    color: string;
    width: number;
  };
  backgroundColor?: string;
  padding?: number;
}

export class UpdateTextBlockCommand {
  constructor(private slideshowRepo: ISlideshowRepository) {}

  async execute(input: UpdateTextBlockInput): Promise<CanvasObject> {
    const slideshow = await this.slideshowRepo.findById(input.slideId);
    if (!slideshow) throw new Error("Slideshow not found");

    // Find the slide containing this object
    const slide = slideshow.slides.find(s => s.canvasObjects.some(o => o.id === input.objectId));
    if (!slide) throw new Error("Slide not found");

    const existingObj = slide.canvasObjects.find(o => o.id === input.objectId);
    if (!existingObj) throw new Error("Object not found");
    if (existingObj.type !== "text") throw new Error("Object is not a text block");

    const existingProps = existingObj.properties as TextProperties;

    const updatedObj: CanvasObject = {
      ...existingObj,
      properties: {
        ...existingProps,
        ...(input.text !== undefined && { content: input.text }),
        ...(input.fontFamily !== undefined && { fontFamily: input.fontFamily }),
        ...(input.fontSize !== undefined && { fontSize: input.fontSize }),
        ...(input.fontColor !== undefined && { fontColor: input.fontColor }),
        ...(input.fontWeight !== undefined && { fontWeight: input.fontWeight }),
        ...(input.textAlign !== undefined && { textAlign: input.textAlign }),
        ...(input.lineHeight !== undefined && { lineHeight: input.lineHeight }),
        ...(input.letterSpacing !== undefined && { letterSpacing: input.letterSpacing }),
        ...(input.textShadow !== undefined && { textShadow: input.textShadow }),
        ...(input.textOutline !== undefined && { textOutline: input.textOutline }),
        ...(input.backgroundColor !== undefined && { backgroundColor: input.backgroundColor }),
        ...(input.padding !== undefined && { padding: input.padding }),
      },
      updatedAt: new Date(),
    };

    await this.slideshowRepo.upsertCanvasObjects(input.slideId, [updatedObj]);
    return updatedObj;
  }
}
