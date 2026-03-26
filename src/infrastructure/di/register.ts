import { container, SERVICE_KEYS } from "./container";
import { DrizzleUserRepository } from "../repositories/drizzle-user-repository";
import { DrizzleMediaRepository } from "../repositories/drizzle-media-repository";
import { DrizzleSlideshowRepository } from "../repositories/drizzle-slideshow-repository";
import { DrizzleExportRepository } from "../repositories/drizzle-export-repository";
import { DrizzleTemplateRepository } from "../repositories/drizzle-template-repository";

container.register(SERVICE_KEYS.USER_REPOSITORY, () => new DrizzleUserRepository());
container.register(SERVICE_KEYS.MEDIA_ASSET_REPOSITORY, () => new DrizzleMediaRepository());
container.register(SERVICE_KEYS.SLIDESHOW_REPOSITORY, () => new DrizzleSlideshowRepository());
container.register(SERVICE_KEYS.EXPORT_JOB_REPOSITORY, () => new DrizzleExportRepository());
container.register(SERVICE_KEYS.TEMPLATE_REPOSITORY, () => new DrizzleTemplateRepository());
