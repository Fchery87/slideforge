import { eq, and, sql, count } from "drizzle-orm";
import { db } from "../database/client";
import { templates } from "../database/schema";
import type { ITemplateRepository } from "@/domain/admin/repositories/template-repository.interface";
import type { Template } from "@/domain/admin/entities/template";
import type { TemplateCategory } from "@/domain/admin/value-objects/template-category";

export class DrizzleTemplateRepository implements ITemplateRepository {
  async findById(id: string): Promise<Template | null> {
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    return result[0] as Template | null;
  }

  async findAll(options: { category?: TemplateCategory; publishedOnly?: boolean; page: number; limit: number }): Promise<{ items: Template[]; total: number }> {
    const offset = (options.page - 1) * options.limit;
    const conditions = [];
    if (options.category) conditions.push(eq(templates.category, options.category));
    if (options.publishedOnly) conditions.push(eq(templates.isPublished, true));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      db.select().from(templates).where(whereClause).limit(options.limit).offset(offset).orderBy(sql`${templates.createdAt} DESC`),
      db.select({ count: count() }).from(templates).where(whereClause),
    ]);

    return { items: items as Template[], total: totalResult[0].count };
  }

  async create(template: Template): Promise<Template> {
    await db.insert(templates).values({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      thumbnailUrl: template.thumbnailUrl,
      slideshowData: template.slideshowData,
      isPublished: template.isPublished,
      createdBy: template.createdBy,
    });
    return template;
  }

  async update(id: string, data: Partial<Omit<Template, "id" | "createdBy" | "createdAt">>): Promise<Template> {
    const result = await db.update(templates).set({ ...data, updatedAt: new Date() }).where(eq(templates.id, id)).returning();
    return result[0] as Template;
  }

  async delete(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }
}
