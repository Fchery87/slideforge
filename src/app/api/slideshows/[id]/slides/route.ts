import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { AddSlideCommand } from "@/application/slideshow/commands/add-slide";
import { ReorderSlidesCommand } from "@/application/slideshow/commands/reorder-slides";
import { RemoveSlideCommand } from "@/application/slideshow/commands/remove-slide";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const command = new AddSlideCommand(slideshowRepo);
  const slide = await command.execute({
    slideshowId: id,
    order: body.order ?? existing.slides.length,
    durationFrames: body.durationFrames,
    backgroundColor: body.backgroundColor,
  });

  return NextResponse.json(slide, { status: 201 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const command = new ReorderSlidesCommand(slideshowRepo);
  await command.execute(id, body.slideIds);
  return NextResponse.json({ success: true });
}
