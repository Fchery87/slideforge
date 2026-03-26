import { db } from "../database/client";
import type { IUserRepository } from "@/domain/identity/repositories/user-repository.interface";
import type { IMediaAssetRepository } from "@/domain/media/repositories/media-asset-repository.interface";
import type { ISlideshowRepository } from "@/domain/slideshow/repositories/slideshow-repository.interface";
import type { IExportJobRepository } from "@/domain/export/repositories/export-job-repository.interface";
import type { ITemplateRepository } from "@/domain/admin/repositories/template-repository.interface";

// Repository implementations will be registered here as they are built.
// For now, we define the container interface and a lazy-init pattern.

type ServiceFactory<T> = () => T;

class Container {
  private services = new Map<string, ServiceFactory<unknown>>();
  private instances = new Map<string, unknown>();

  register<T>(key: string, factory: ServiceFactory<T>): void {
    this.services.set(key, factory);
    this.instances.delete(key); // Clear cached instance on re-register
  }

  resolve<T>(key: string): T {
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service "${key}" is not registered in the container`);
    }

    const instance = factory() as T;
    this.instances.set(key, instance);
    return instance;
  }
}

export const container = new Container();

// Service keys
export const SERVICE_KEYS = {
  USER_REPOSITORY: "UserRepository",
  MEDIA_ASSET_REPOSITORY: "MediaAssetRepository",
  SLIDESHOW_REPOSITORY: "SlideshowRepository",
  EXPORT_JOB_REPOSITORY: "ExportJobRepository",
  TEMPLATE_REPOSITORY: "TemplateRepository",
  DATABASE: "Database",
} as const;

// Register the database instance
container.register(SERVICE_KEYS.DATABASE, () => db);

// Helper functions for type-safe resolution
export function getUserRepository(): IUserRepository {
  return container.resolve<IUserRepository>(SERVICE_KEYS.USER_REPOSITORY);
}

export function getMediaAssetRepository(): IMediaAssetRepository {
  return container.resolve<IMediaAssetRepository>(SERVICE_KEYS.MEDIA_ASSET_REPOSITORY);
}

export function getSlideshowRepository(): ISlideshowRepository {
  return container.resolve<ISlideshowRepository>(SERVICE_KEYS.SLIDESHOW_REPOSITORY);
}

export function getExportJobRepository(): IExportJobRepository {
  return container.resolve<IExportJobRepository>(SERVICE_KEYS.EXPORT_JOB_REPOSITORY);
}

export function getTemplateRepository(): ITemplateRepository {
  return container.resolve<ITemplateRepository>(SERVICE_KEYS.TEMPLATE_REPOSITORY);
}
