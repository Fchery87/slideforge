import type { ITemplateRepository } from "@/domain/admin/repositories/template-repository.interface";
import type { Template } from "@/domain/admin/entities/template";
import type { TemplateCategory } from "@/domain/admin/value-objects/template-category";

export class GetTemplatesQuery {
  constructor(private templateRepo: ITemplateRepository) {}

  async execute(options: { category?: TemplateCategory; publishedOnly?: boolean; page?: number; limit?: number } = {}): Promise<{ items: Template[]; total: number }> {
    return this.templateRepo.findAll({
      category: options.category,
      publishedOnly: options.publishedOnly ?? true,
      page: options.page ?? 1,
      limit: options.limit ?? 20,
    });
  }
}
