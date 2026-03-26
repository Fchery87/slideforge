import type { ITemplateRepository } from "@/domain/admin/repositories/template-repository.interface";
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import type { CanvasObjectProperties } from "@/domain/slideshow/entities/canvas-object";
import type { TransitionType } from "@/domain/slideshow/value-objects/transition-type";
import { nanoid } from "nanoid";

export class CreateSlideshowFromTemplateCommand {
  constructor(
    private templateRepo: ITemplateRepository,
    private slideshowRepo: ISlideshowRepository
  ) {}

  async execute(templateId: string, userId: string): Promise<Slideshow> {
    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new Error("Template not found");

    const data = template.slideshowData as {
      title?: string;
      description?: string;
      resolution?: "720p" | "1080p";
      fps?: number;
      backgroundColor?: string;
      slides?: Array<{
        durationFrames?: number;
        backgroundColor?: string | null;
        canvasObjects?: Array<{
          type: string;
          x: number;
          y: number;
          width: number;
          height: number;
          rotation: number;
          opacity: number;
          zIndex: number;
          properties: Record<string, unknown>;
        }>;
      }>;
      transitions?: Array<{
        fromSlideIndex: number;
        toSlideIndex: number;
        type: string;
        durationFrames: number;
        easing: string;
      }>;
    };

    const now = new Date();
    const newId = nanoid();

    await this.slideshowRepo.create({
      id: newId,
      userId,
      title: data.title ?? template.name,
      description: data.description ?? template.description,
      resolution: data.resolution ?? "1080p",
      fps: data.fps ?? 30,
      backgroundColor: data.backgroundColor ?? "#000000",
      thumbnailUrl: template.thumbnailUrl,
      createdAt: now,
      updatedAt: now,
    });

    const slideIdMap: string[] = [];
    for (let i = 0; i < (data.slides?.length ?? 1); i++) {
      const slideData = data.slides?.[i];
      const slideId = nanoid();
      slideIdMap.push(slideId);

      await this.slideshowRepo.addSlide({
        id: slideId,
        slideshowId: newId,
        order: i,
        durationFrames: slideData?.durationFrames ?? 150,
        backgroundColor: slideData?.backgroundColor ?? null,
        createdAt: now,
        updatedAt: now,
      });

      if (slideData?.canvasObjects?.length) {
        const objects = slideData.canvasObjects.map((obj) => ({
          id: nanoid(),
          slideId,
          type: obj.type as "image" | "text" | "shape",
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          rotation: obj.rotation,
          opacity: obj.opacity,
          zIndex: obj.zIndex,
          properties: obj.properties as unknown as CanvasObjectProperties,
          createdAt: now,
          updatedAt: now,
        }));
        await this.slideshowRepo.upsertCanvasObjects(slideId, objects);
      }
    }

    if (data.transitions) {
      for (const t of data.transitions) {
        if (slideIdMap[t.fromSlideIndex] && slideIdMap[t.toSlideIndex]) {
          await this.slideshowRepo.setTransition({
            id: nanoid(),
            slideshowId: newId,
            fromSlideId: slideIdMap[t.fromSlideIndex],
            toSlideId: slideIdMap[t.toSlideIndex],
            type: t.type as TransitionType,
            durationFrames: t.durationFrames,
            easing: t.easing,
            createdAt: now,
          });
        }
      }
    }

    return this.slideshowRepo.findById(newId) as Promise<Slideshow>;
  }
}
