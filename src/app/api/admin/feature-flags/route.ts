import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { db } from "@/infrastructure/database/client";
import { featureFlags } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const flags = await db.select().from(featureFlags);
  return NextResponse.json(flags);
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();

  if (body.id) {
    await db.update(featureFlags).set({ enabled: body.enabled, updatedAt: new Date() }).where(eq(featureFlags.id, body.id));
  } else {
    await db.insert(featureFlags).values({
      id: nanoid(),
      key: body.key,
      description: body.description,
      enabled: body.enabled ?? false,
    });
  }

  return NextResponse.json({ success: true });
}
