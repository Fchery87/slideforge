import { DrizzleExportRepository } from "@/infrastructure/repositories/drizzle-export-repository";
import { DrizzleSlideshowRepository } from "@/infrastructure/repositories/drizzle-slideshow-repository";
import { RemotionRenderService } from "@/infrastructure/rendering/remotion-render-service";

const POLL_INTERVAL_MS = 5000;

async function processNextJob() {
  const exportRepo = new DrizzleExportRepository();
  const slideshowRepo = new DrizzleSlideshowRepository();
  const renderService = new RemotionRenderService();

  const job = await exportRepo.findNextQueued();
  if (!job) return;

  console.log(`[RenderWorker] Processing job ${job.id} for slideshow ${job.slideshowId}`);

  await exportRepo.update(job.id, {
    status: "processing",
    startedAt: new Date(),
  });

  try {
    const slideshow = await slideshowRepo.findById(job.slideshowId);
    if (!slideshow) throw new Error("Slideshow not found");

    const result = await renderService.render(job, slideshow, async (progress) => {
      await exportRepo.update(job.id, { progress });
    });

    await exportRepo.update(job.id, {
      status: "completed",
      progress: 100,
      outputStorageKey: result.outputKey,
      outputUrl: result.outputUrl,
      fileSizeBytes: result.fileSize,
      completedAt: new Date(),
    });

    console.log(`[RenderWorker] Job ${job.id} completed. Output: ${result.outputKey}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[RenderWorker] Job ${job.id} failed:`, message);

    await exportRepo.update(job.id, {
      status: "failed",
      errorMessage: message,
      completedAt: new Date(),
    });
  }
}

async function main() {
  console.log("[RenderWorker] Starting render worker...");
  console.log("[RenderWorker] Polling interval:", POLL_INTERVAL_MS, "ms");

  while (true) {
    try {
      await processNextJob();
    } catch (error) {
      console.error("[RenderWorker] Poll error:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main().catch(console.error);
