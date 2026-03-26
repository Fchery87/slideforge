import { getPresignedDownloadUrl } from "@/infrastructure/storage/r2-storage-service";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";
import type { ExportJob } from "@/domain/export/entities/export-job";
import { Resolutions } from "@/domain/slideshow/value-objects/resolution";
import { RemotionCodecMap } from "@/domain/export/value-objects/export-format";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";

export interface CompositionInputProps {
  slideshow: Slideshow;
  totalFrames: number;
  [key: string]: unknown;
}

export function buildCompositionInput(slideshow: Slideshow): CompositionInputProps {
  return {
    slideshow,
    totalFrames: getTotalDurationFrames(slideshow),
  };
}

export function getExportConfig(job: ExportJob) {
  const codec = RemotionCodecMap[job.format];
  const resolution = Resolutions[job.resolution];

  return {
    codec,
    width: resolution.width,
    height: resolution.height,
    outName: `export-${job.id}.${job.format}`,
  };
}
