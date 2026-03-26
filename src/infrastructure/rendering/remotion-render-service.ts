import { renderMedia, type Codec } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import path from "path";
import fs from "fs";
import { buildCompositionInput, getExportConfig } from "./composition-builder";
import type { ExportJob } from "@/domain/export/entities/export-job";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import { getR2Client } from "../storage/r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createExportStorageKey } from "@/domain/media/value-objects/storage-key";
import { getPublicUrl } from "../storage/r2-storage-service";

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "slideforge";

export class RemotionRenderService {
  private bundleLocation: string | null = null;

  async ensureBundle(): Promise<string> {
    if (this.bundleLocation) return this.bundleLocation;

    const entryPoint = path.resolve(process.cwd(), "src/remotion/Root.tsx");
    this.bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });
    return this.bundleLocation;
  }

  async render(job: ExportJob, slideshow: Slideshow, onProgress?: (progress: number) => void): Promise<{ outputKey: string; outputUrl: string; fileSize: number }> {
    const input = buildCompositionInput(slideshow);
    const config = getExportConfig(job);
    const bundleLocation = await this.ensureBundle();

    const outputPath = path.join("/tmp", `slideforge-export-${job.id}.${job.format}`);

    const options = {
      composition: {
        id: "Slideshow",
        durationInFrames: input.totalFrames,
        fps: slideshow.fps,
        width: config.width,
        height: config.height,
        defaultProps: input,
        props: input,
      },
      serveUrl: bundleLocation,
      codec: config.codec as Codec,
      outputLocation: outputPath,
      onProgress: ({ progress }: { progress: number }) => {
        if (onProgress) onProgress(Math.round(progress * 100));
      },
    };

    await renderMedia(options as unknown as Parameters<typeof renderMedia>[0]);

    const stats = fs.statSync(outputPath);
    const buffer = fs.readFileSync(outputPath);

    const storageKey = createExportStorageKey(job.userId, job.slideshowId, job.format);
    const r2Client = getR2Client();

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: storageKey,
        Body: buffer,
        ContentType: job.format === "mp4" ? "video/mp4" : job.format === "webm" ? "video/webm" : job.format === "gif" ? "image/gif" : "video/quicktime",
      })
    );

    const outputUrl = getPublicUrl(storageKey);

    fs.unlinkSync(outputPath);

    return { outputKey: storageKey, outputUrl, fileSize: stats.size };
  }
}
