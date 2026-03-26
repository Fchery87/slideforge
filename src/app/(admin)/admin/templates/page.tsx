"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Palette,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { Template } from "@/domain/admin/entities/template";
import type { TemplateCategory } from "@/domain/admin/value-objects/template-category";

const categoryOptions: TemplateCategory[] = [
  "party",
  "wedding",
  "birthday",
  "funeral",
  "corporate",
  "other",
];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState<TemplateCategory>("other");
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/templates");
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const openCreate = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormDesc("");
    setFormCategory("other");
    setSheetOpen(true);
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDesc(template.description || "");
    setFormCategory(template.category);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingTemplate) {
        const res = await fetch(`/api/admin/templates/${editingTemplate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            description: formDesc,
            category: formCategory,
          }),
        });
        if (!res.ok) throw new Error("Failed to update template");
      } else {
        const res = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            description: formDesc,
            category: formCategory,
          }),
        });
        if (!res.ok) throw new Error("Failed to create template");
      }
      setSheetOpen(false);
      await fetchTemplates();
    } catch {
      setError("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete template");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete template");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
            Template Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create and manage slideshow templates
          </p>
        </div>
        <Button
          className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-16">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <p className="mt-2 text-sm text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
            onClick={fetchTemplates}
          >
            Retry
          </Button>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <div className="text-center">
            <Palette className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">No templates yet</p>
            <Button
              variant="outline"
              className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
              onClick={openCreate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#16163a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#12122e]">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Category</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Published</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{template.name}</p>
                    {template.description && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                        {template.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="capitalize">
                      {template.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={template.isPublished ? "outline" : "secondary"}>
                      {template.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer text-slate-400 hover:text-slate-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openEdit(template)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              {editingTemplate ? "Edit Template" : "New Template"}
            </SheetTitle>
            <SheetDescription>
              {editingTemplate
                ? "Update the template details"
                : "Create a new slideshow template"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Template name"
                className="border-white/[0.08] bg-[#0F0F23]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-desc">Description</Label>
              <Input
                id="template-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Template description"
                className="border-white/[0.08] bg-[#0F0F23]"
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={formCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={`cursor-pointer capitalize ${
                      formCategory === cat
                        ? ""
                        : "border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                    }`}
                    onClick={() => setFormCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleSave}
                disabled={saving || !formName.trim()}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                onClick={() => setSheetOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
