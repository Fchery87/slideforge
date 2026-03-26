import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { GetSlideshowCompositionQuery } from "@/application/slideshow/queries/get-slideshow-composition";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const slideshowRepo = new DrizzleSlideshowRepository();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const query = new GetSlideshowCompositionQuery(slideshowRepo);
  const result = await query.execute(id);

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (result.slideshow.userId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(result);
}
