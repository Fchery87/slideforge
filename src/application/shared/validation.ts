import { z } from "zod";

export const createSlideshowSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  occasionType: z.enum([
    "birthday", "wedding", "anniversary", "memorial", "graduation",
    "baby_shower", "family_recap", "holiday", "presentation", "custom"
  ]).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "4:3", "1:1"]).optional(),
  resolution: z.enum(["720p", "1080p"]).optional(),
  fps: z.number().int().min(1).max(60).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateSlideshowSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  occasionType: z.enum([
    "birthday", "wedding", "anniversary", "memorial", "graduation",
    "baby_shower", "family_recap", "holiday", "presentation", "custom"
  ]).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "4:3", "1:1"]).optional(),
  resolution: z.enum(["720p", "1080p"]).optional(),
  fps: z.number().int().min(1).max(60).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const bulkOperationSchema = z.object({
  action: z.enum(["transition", "effect", "duration"]),
  slideIds: z.array(z.string()).min(1),
  transitionType: z.enum(["none", "fade", "slide", "zoom", "dissolve", "wipe"]).optional(),
  durationFrames: z.number().int().min(1).max(9000).optional(),
  easing: z.string().optional(),
  effects: z.record(z.string(), z.unknown()).optional(),
});

export const uploadMediaSchema = z.object({
  fileName: z.string().min(1).max(500),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  type: z.enum(["image", "audio"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationMs: z.number().int().positive().optional(),
  folderId: z.string().nullable().optional(),
});

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map((i: any) => i.message).join(", ")}`);
  }
  return result.data;
}
