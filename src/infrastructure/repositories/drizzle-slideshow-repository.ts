import { eq, and, sql, asc, count } from "drizzle-orm";
import { db } from "../database/client";
import { slideshows, slides, canvasObjects, transitions, audioTracks } from "../database/schema";
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";
import type { Transition } from "@/domain/slideshow/entities/transition";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";
import { migrateLegacyBackgroundColor } from "@/domain/slideshow/value-objects/slide-background";

function toSlideshow(row: typeof slideshows.$inferSelect, slideRows: (typeof slides.$inferSelect & { canvasObjects: (typeof canvasObjects.$inferSelect)[] })[], transitionRows: (typeof transitions.$inferSelect)[], audioTrackRows: (typeof audioTracks.$inferSelect)[]): Slideshow {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    occasionType: row.occasionType,
    status: row.status,
    aspectRatio: row.aspectRatio,
    coverAssetId: row.coverAssetId,
    resolution: row.resolution,
    fps: row.fps,
    backgroundColor: row.backgroundColor,
    theme: row.theme as Slideshow["theme"],
    thumbnailUrl: row.thumbnailUrl,
    slides: slideRows.map((s) => ({
      id: s.id,
      slideshowId: s.slideshowId,
      order: s.order,
      durationFrames: s.durationFrames,
      background: (s.background as Slide["background"]) ?? migrateLegacyBackgroundColor(s.backgroundColor),
      layoutId: s.layoutId ?? undefined,
      notes: s.notes ?? undefined,
      effects: s.effects as Slide["effects"],
      canvasObjects: s.canvasObjects.map((o) => ({
        id: o.id,
        slideId: o.slideId,
        type: o.type,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
        rotation: o.rotation,
        opacity: o.opacity / 100,
        zIndex: o.zIndex,
        groupId: o.groupId ?? undefined,
        sourceAssetId: o.sourceAssetId ?? null,
        animation: o.animation as CanvasObject["animation"],
        properties: o.properties as CanvasObject["properties"],
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    transitions: transitionRows.map((t) => ({
      id: t.id,
      slideshowId: t.slideshowId,
      fromSlideId: t.fromSlideId,
      toSlideId: t.toSlideId,
      type: t.type,
      durationFrames: t.durationFrames,
      easing: t.easing,
      createdAt: t.createdAt,
    })),
    audioTracks: audioTrackRows.map((a) => ({
      id: a.id,
      slideshowId: a.slideshowId,
      mediaAssetId: a.mediaAssetId,
      trackIndex: a.trackIndex,
      startFrame: a.startFrame,
      endFrame: a.endFrame,
      trimStartFrame: a.trimStartFrame,
      trimEndFrame: a.trimEndFrame,
      volume: a.volume,
      fadeInFrames: a.fadeInFrames,
      fadeOutFrames: a.fadeOutFrames,
      createdAt: a.createdAt,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleSlideshowRepository implements ISlideshowRepository {
  async findById(id: string): Promise<Slideshow | null> {
    const row = await db.query.slideshows.findFirst({
      where: eq(slideshows.id, id),
      with: {
        slides: {
          orderBy: asc(slides.order),
          with: {
            canvasObjects: {
              orderBy: asc(canvasObjects.zIndex),
            },
          },
        },
        transitions: true,
        audioTracks: { orderBy: asc(audioTracks.trackIndex) },
      },
    });
    if (!row) return null;
    return toSlideshow(row, row.slides, row.transitions, row.audioTracks);
  }

  async findByUserId(userId: string, options: { page: number; limit: number }): Promise<{ items: Slideshow[]; total: number }> {
    const offset = (options.page - 1) * options.limit;
    const [items, totalResult] = await Promise.all([
      db.query.slideshows.findMany({
        where: eq(slideshows.userId, userId),
        with: {
          slides: {
            orderBy: asc(slides.order),
            with: {
              canvasObjects: {
                orderBy: asc(canvasObjects.zIndex),
              },
            },
          },
          transitions: true,
          audioTracks: { orderBy: asc(audioTracks.trackIndex) },
        },
        limit: options.limit,
        offset,
        orderBy: [sql`${slideshows.updatedAt} DESC`],
      }),
      db.select({ count: count() }).from(slideshows).where(eq(slideshows.userId, userId)),
    ]);
    return {
      items: items.map((row) => toSlideshow(row, row.slides, row.transitions, row.audioTracks)),
      total: totalResult[0].count,
    };
  }

  async create(slideshow: Omit<Slideshow, "slides" | "transitions" | "audioTracks">): Promise<Slideshow> {
    await db.insert(slideshows).values({
      id: slideshow.id,
      userId: slideshow.userId,
      title: slideshow.title,
      description: slideshow.description,
      occasionType: slideshow.occasionType,
      status: slideshow.status,
      aspectRatio: slideshow.aspectRatio,
      coverAssetId: slideshow.coverAssetId,
      resolution: slideshow.resolution,
      fps: slideshow.fps,
      backgroundColor: slideshow.backgroundColor,
      theme: slideshow.theme,
      thumbnailUrl: slideshow.thumbnailUrl,
      createdAt: slideshow.createdAt,
      updatedAt: slideshow.updatedAt,
    });
    return { ...slideshow, slides: [], transitions: [], audioTracks: [] };
  }

  async update(id: string, data: Partial<Pick<Slideshow, "title" | "description" | "occasionType" | "status" | "aspectRatio" | "coverAssetId" | "resolution" | "fps" | "backgroundColor" | "theme" | "thumbnailUrl">>): Promise<Slideshow> {
    await db.update(slideshows).set({ ...data, updatedAt: new Date() }).where(eq(slideshows.id, id));
    const result = await this.findById(id);
    return result!;
  }

  async updateStatus(id: string, status: Slideshow["status"]): Promise<void> {
    await db.update(slideshows).set({ status, updatedAt: new Date() }).where(eq(slideshows.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(slideshows).where(eq(slideshows.id, id));
  }

  async addSlide(slide: Omit<Slide, "canvasObjects">): Promise<Slide> {
    await db.insert(slides).values({
      id: slide.id,
      slideshowId: slide.slideshowId,
      order: slide.order,
      durationFrames: slide.durationFrames,
      background: slide.background,
      notes: slide.notes,
      layoutId: slide.layoutId,
      effects: slide.effects,
    });
    return { ...slide, canvasObjects: [] };
  }

  async updateSlide(slideId: string, data: Partial<Pick<Slide, "durationFrames" | "background" | "effects" | "notes" | "layoutId">>): Promise<Slide> {
    await db.update(slides).set({
      ...(data.durationFrames !== undefined && { durationFrames: data.durationFrames }),
      ...(data.background !== undefined && { background: data.background }),
      ...(data.effects !== undefined && { effects: data.effects }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.layoutId !== undefined && { layoutId: data.layoutId }),
      updatedAt: new Date(),
    }).where(eq(slides.id, slideId));

    // Fetch and return updated slide
    const slide = await db.query.slides.findFirst({
      where: eq(slides.id, slideId),
      with: {
        canvasObjects: {
          orderBy: asc(canvasObjects.zIndex),
        },
      },
    });

    if (!slide) throw new Error("Slide not found");

    return {
      id: slide.id,
      slideshowId: slide.slideshowId,
      order: slide.order,
      durationFrames: slide.durationFrames,
      background: (slide.background as Slide["background"]) ?? migrateLegacyBackgroundColor(slide.backgroundColor),
      layoutId: slide.layoutId ?? undefined,
      notes: slide.notes ?? undefined,
      effects: slide.effects as Slide["effects"],
      canvasObjects: slide.canvasObjects.map((o) => ({
        id: o.id,
        slideId: o.slideId,
        type: o.type,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
        rotation: o.rotation,
        opacity: o.opacity / 100,
        zIndex: o.zIndex,
        groupId: o.groupId ?? undefined,
        sourceAssetId: o.sourceAssetId ?? null,
        animation: o.animation as CanvasObject["animation"],
        properties: o.properties as CanvasObject["properties"],
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
    };
  }

  async removeSlide(slideId: string): Promise<void> {
    await db.delete(slides).where(eq(slides.id, slideId));
  }

  async reorderSlides(slideshowId: string, slideIds: string[]): Promise<void> {
    for (let i = 0; i < slideIds.length; i++) {
      await db.update(slides).set({ order: i }).where(eq(slides.id, slideIds[i]));
    }
  }

  async upsertCanvasObjects(slideId: string, objects: CanvasObject[]): Promise<void> {
    for (const obj of objects) {
      await db
        .insert(canvasObjects)
        .values({
          id: obj.id,
          slideId,
          type: obj.type,
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          rotation: obj.rotation,
          opacity: Math.round(obj.opacity * 100),
          zIndex: obj.zIndex,
          groupId: obj.groupId ?? null,
          sourceAssetId: obj.sourceAssetId ?? null,
          animation: obj.animation ?? null,
          properties: obj.properties,
        })
        .onConflictDoUpdate({
          target: canvasObjects.id,
          set: {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            rotation: obj.rotation,
            opacity: Math.round(obj.opacity * 100),
            zIndex: obj.zIndex,
            groupId: obj.groupId ?? null,
            sourceAssetId: obj.sourceAssetId ?? null,
            animation: obj.animation ?? null,
            properties: obj.properties,
            updatedAt: new Date(),
          },
        });
    }
  }

  async setTransition(transition: Transition): Promise<Transition> {
    await db
      .insert(transitions)
      .values({
        id: transition.id,
        slideshowId: transition.slideshowId,
        fromSlideId: transition.fromSlideId,
        toSlideId: transition.toSlideId,
        type: transition.type,
        durationFrames: transition.durationFrames,
        easing: transition.easing,
      })
      .onConflictDoUpdate({
        target: transitions.id,
        set: {
          type: transition.type,
          durationFrames: transition.durationFrames,
          easing: transition.easing,
        },
      });
    return transition;
  }

  async removeTransition(transitionId: string): Promise<void> {
    await db.delete(transitions).where(eq(transitions.id, transitionId));
  }

  async addAudioTrack(track: AudioTrack): Promise<AudioTrack> {
    await db.insert(audioTracks).values({
      id: track.id,
      slideshowId: track.slideshowId,
      mediaAssetId: track.mediaAssetId,
      trackIndex: track.trackIndex,
      startFrame: track.startFrame,
      endFrame: track.endFrame,
      trimStartFrame: track.trimStartFrame,
      trimEndFrame: track.trimEndFrame,
      volume: track.volume,
      fadeInFrames: track.fadeInFrames,
      fadeOutFrames: track.fadeOutFrames,
    });
    return track;
  }

  async removeAudioTrack(trackId: string): Promise<void> {
    await db.delete(audioTracks).where(eq(audioTracks.id, trackId));
  }

  async updateAudioTrack(
    trackId: string,
    data: Partial<Pick<AudioTrack, "startFrame" | "endFrame" | "trimStartFrame" | "trimEndFrame" | "volume" | "fadeInFrames" | "fadeOutFrames">>
  ): Promise<AudioTrack> {
    await db
      .update(audioTracks)
      .set(data)
      .where(eq(audioTracks.id, trackId));

    const [row] = await db
      .select()
      .from(audioTracks)
      .where(eq(audioTracks.id, trackId));

    return {
      id: row.id,
      slideshowId: row.slideshowId,
      mediaAssetId: row.mediaAssetId,
      trackIndex: row.trackIndex,
      startFrame: row.startFrame,
      endFrame: row.endFrame,
      trimStartFrame: row.trimStartFrame,
      trimEndFrame: row.trimEndFrame,
      volume: row.volume,
      fadeInFrames: row.fadeInFrames,
      fadeOutFrames: row.fadeOutFrames,
      createdAt: row.createdAt,
    };
  }
}
