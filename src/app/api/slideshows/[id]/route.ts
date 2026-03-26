import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { GetSlideshowQuery } from "@/application/slideshow/queries/get-slideshow";
import { DuplicateSlideshowCommand } from "@/application/slideshow/commands/duplicate-slideshow";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const query = new GetSlideshowQuery(slideshowRepo);
  const slideshow = await query.execute(id);

  if (!slideshow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (slideshow.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(slideshow);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const updated = await slideshowRepo.update(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = await slideshowRepo.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await slideshowRepo.delete(id);
  return NextResponse.json({ success: true });
}
