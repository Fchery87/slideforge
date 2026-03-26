import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { CreateSlideshowFromTemplateCommand } from "@/application/admin/commands/create-slideshow-from-template";
import { DrizzleTemplateRepository } from "@/infrastructure/repositories/drizzle-template-repository";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";

const templateRepo = new DrizzleTemplateRepository();
const slideshowRepo = new DrizzleSlideshowRepository();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const command = new CreateSlideshowFromTemplateCommand(templateRepo, slideshowRepo);
  const slideshow = await command.execute(id, session!.user.id);
  return NextResponse.json(slideshow, { status: 201 });
}
