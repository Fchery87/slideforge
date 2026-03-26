import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { RemoveSlideCommand } from "@/application/slideshow/commands/remove-slide";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; slideId: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id, slideId } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  
  const updatedSlide = await slideshowRepo.updateSlide(slideId, {
    durationFrames: body.durationFrames,
    backgroundColor: body.backgroundColor,
    effects: body.effects,
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
