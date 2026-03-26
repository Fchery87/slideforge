import type { TemplateCategory } from "../value-objects/template-category";

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: TemplateCategory;
  thumbnailUrl: string | null;
  slideshowData: Record<string, unknown>;
  isPublished: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
