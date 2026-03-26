import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";
import { nanoid } from "nanoid";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const track: AudioTrack = {
    id: nanoid(),
    slideshowId: id,
    mediaAssetId: body.mediaAssetId,
    trackIndex: body.trackIndex ?? existing.audioTracks.length,
    startFrame: body.startFrame ?? 0,
    endFrame: body.endFrame,
    volume: body.volume ?? 100,
    fadeInFrames: body.fadeInFrames ?? 0,
    fadeOutFrames: body.fadeOutFrames ?? 0,
    createdAt: new Date(),
  };
  const result = await slideshowRepo.addAudioTrack(track);
  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });

  await slideshowRepo.removeAudioTrack(trackId);
  return NextResponse.json({ success: true });
}
