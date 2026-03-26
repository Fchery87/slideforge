import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { UpdateCanvasObjectsCommand } from "@/application/slideshow/commands/update-canvas-objects";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";
import type { CanvasObject } from "@/domain/slideshow/entities/canvas-object";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; slideId: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slideId } = await params;
  const body = await request.json();
  const command = new UpdateCanvasObjectsCommand(slideshowRepo);
  await command.execute(slideId, body.objects as CanvasObject[]);
  return NextResponse.json({ success: true });
}
