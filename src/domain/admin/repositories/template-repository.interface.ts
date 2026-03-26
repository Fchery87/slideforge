import type { Template } from "../entities/template";
import type { TemplateCategory } from "../value-objects/template-category";

export interface ITemplateRepository {
  findById(id: string): Promise<Template | null>;
  findAll(options: { category?: TemplateCategory; publishedOnly?: boolean; page: number; limit: number }): Promise<{ items: Template[]; total: number }>;
  create(template: Template): Promise<Template>;
  update(id: string, data: Partial<Omit<Template, "id" | "createdBy" | "createdAt">>): Promise<Template>;
  delete(id: string): Promise<void>;
}
