import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { RemoveSlideCommand } from "@/application/slideshow/commands/remove-slide";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";
import { migrateLegacyBackgroundColor } from "@/domain/slideshow/value-objects/slide-background";
import type { Slide } from "@/domain/slideshow/entities/slide";
import type { SlideBackground } from "@/domain/slideshow/value-objects/slide-background";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; slideId: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id, slideId } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  
  // Check if slide exists in DB, if not create it (upsert)
  const existingSlide = existing.slides.find((s) => s.id === slideId);
  
  if (!existingSlide) {
    // Slide doesn't exist yet — create it
    const newSlide: Omit<Slide, "canvasObjects"> = {
      id: slideId,
      slideshowId: id,
      order: body.order ?? existing.slides.length,
      durationFrames: body.durationFrames ?? 150,
      background: body.background ?? migrateLegacyBackgroundColor(body.backgroundColor ?? null),
      effects: body.effects,
      notes: body.notes,
      layoutId: body.layoutId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await slideshowRepo.addSlide(newSlide);
    return NextResponse.json(newSlide);
  }

  const updatedSlide = await slideshowRepo.updateSlide(slideId, {
    durationFrames: body.durationFrames,
    background: body.background ?? (body.backgroundColor !== undefined ? migrateLegacyBackgroundColor(body.backgroundColor) : undefined),
    effects: body.effects,
    notes: body.notes,
    layoutId: body.layoutId,
  });

  return NextResponse.json(updatedSlide);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; slideId: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slideId } = await params;
  const command = new RemoveSlideCommand(slideshowRepo);
  await command.execute(slideId);
  return NextResponse.json({ success: true });
}
