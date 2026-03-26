import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { CreateSlideshowCommand } from "@/application/slideshow/commands/create-slideshow";
import { ListUserSlideshowsQuery } from "@/application/slideshow/queries/list-user-slideshows";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function GET(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const query = new ListUserSlideshowsQuery(slideshowRepo);
  const result = await query.execute(session!.user.id, page, limit);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const command = new CreateSlideshowCommand(slideshowRepo);
  const slideshow = await command.execute({
    userId: session!.user.id,
    title: body.title,
    description: body.description,
    resolution: body.resolution,
    fps: body.fps,
    backgroundColor: body.backgroundColor,
  });

  return NextResponse.json(slideshow, { status: 201 });
}
