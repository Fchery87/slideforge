export const TemplateCategories = {
  PARTY: "party",
  FUNERAL: "funeral",
  WEDDING: "wedding",
  BIRTHDAY: "birthday",
  CORPORATE: "corporate",
  OTHER: "other",
} as const;

export type TemplateCategory = (typeof TemplateCategories)[keyof typeof TemplateCategories];
