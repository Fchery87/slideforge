import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id, trackId } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const track = existing.audioTracks.find((t) => t.id === trackId);
  if (!track) return NextResponse.json({ error: "Track not found" }, { status: 404 });

  const body = await request.json();
  const updated = await slideshowRepo.updateAudioTrack(trackId, {
    startFrame: body.startFrame,
    endFrame: body.endFrame,
    volume: body.volume,
    fadeInFrames: body.fadeInFrames,
    fadeOutFrames: body.fadeOutFrames,
  });

  return NextResponse.json(updated);
}
