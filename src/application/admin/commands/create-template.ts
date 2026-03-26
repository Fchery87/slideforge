import type { ITemplateRepository } from "@/domain/admin/repositories/template-repository.interface";
import type { Template } from "@/domain/admin/entities/template";
import type { TemplateCategory } from "@/domain/admin/value-objects/template-category";
import { nanoid } from "nanoid";

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category: TemplateCategory;
  thumbnailUrl?: string;
  slideshowData: Record<string, unknown>;
  createdBy: string;
}

export class CreateTemplateCommand {
  constructor(private templateRepo: ITemplateRepository) {}

  async execute(input: CreateTemplateInput): Promise<Template> {
    const template: Template = {
      id: nanoid(),
      name: input.name,
      description: input.description ?? null,
      category: input.category,
      thumbnailUrl: input.thumbnailUrl ?? null,
      slideshowData: input.slideshowData,
      isPublished: false,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.templateRepo.create(template);
  }
}
