import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";
import type { Transition } from "@/domain/slideshow/entities/transition";
import { nanoid } from "nanoid";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  
  // Validate that both slides exist
  const fromSlide = existing.slides.find(s => s.id === body.fromSlideId);
  const toSlide = existing.slides.find(s => s.id === body.toSlideId);
  
  if (!fromSlide) {
    return NextResponse.json({ error: "From slide not found" }, { status: 400 });
  }
  
  if (!toSlide) {
    return NextResponse.json({ error: "To slide not found" }, { status: 400 });
  }

  const transition: Transition = {
    id: body.id ?? nanoid(),
    slideshowId: id,
    fromSlideId: body.fromSlideId,
    toSlideId: body.toSlideId,
    type: body.type,
    durationFrames: body.durationFrames ?? 30,
    easing: body.easing ?? "ease-in-out",
    createdAt: new Date(),
  };
  const result = await slideshowRepo.setTransition(transition);
  return NextResponse.json(result);
}
