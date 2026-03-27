import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { db } from "@/infrastructure/database/client";
import { userProfiles, slideshows, mediaAssets, exportJobs } from "@/infrastructure/database/schema";
import { count, sql, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const [userCount, slideshowCount, mediaCount, exportCount, occasionDistribution] = await Promise.all([
    db.select({ count: count() }).from(userProfiles),
    db.select({ count: count() }).from(slideshows),
    db.select({ count: count() }).from(mediaAssets),
    db.select({ count: count() }).from(exportJobs),
    // Occasion type distribution
    db.select({
      occasionType: slideshows.occasionType,
      count: count(),
    })
      .from(slideshows)
      .groupBy(slideshows.occasionType)
      .orderBy(desc(count())),
  ]);

  return NextResponse.json({
    totalUsers: userCount[0].count,
    totalSlideshows: slideshowCount[0].count,
    totalMediaAssets: mediaCount[0].count,
    totalExports: exportCount[0].count,
    occasionDistribution: occasionDistribution.map((row) => ({
      occasionType: row.occasionType,
      count: row.count,
    })),
  });
}
