import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { db } from "@/infrastructure/database/client";
import { userProfiles, slideshows, mediaAssets, exportJobs } from "@/infrastructure/database/schema";
import { count, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const [userCount, slideshowCount, mediaCount, exportCount] = await Promise.all([
    db.select({ count: count() }).from(userProfiles),
    db.select({ count: count() }).from(slideshows),
    db.select({ count: count() }).from(mediaAssets),
    db.select({ count: count() }).from(exportJobs),
  ]);

  return NextResponse.json({
    totalUsers: userCount[0].count,
    totalSlideshows: slideshowCount[0].count,
    totalMediaAssets: mediaCount[0].count,
    totalExports: exportCount[0].count,
  });
}
