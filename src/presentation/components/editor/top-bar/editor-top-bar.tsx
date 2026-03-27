"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { persistSlideshow } from "@/presentation/hooks/use-autosave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  Pencil,
  Settings,
  Download,
  Save,
  Check,
  Maximize2,
  Monitor,
} from "lucide-react";

export function EditorTopBar() {
  const {
    slideshow,
    isEditMode,
    isDirty,
    markClean,
    toggleEditMode,
    undo,
    redo,
    canUndo,
    canRedo,
    setPreviewMode,
    setPresenterMode,
    updateSlideshowMeta,
  } = useEditorStore();

  const [title, setTitle] = useState(slideshow?.title ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (slideshow?.title) setTitle(slideshow.title);
  }, [slideshow?.title]);

  const saveSlideshow = useCallback(async () => {
    if (!slideshow || !isDirty) return;
    setSaving(true);
    try {
      const slideshowToSave = { ...slideshow, title };
      await persistSlideshow(slideshowToSave);
      markClean();
      setSaved(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [slideshow, isDirty, markClean, title]);

  const handleTitleBlur = useCallback(async () => {
    if (!slideshow || title === slideshow.title) return;
    updateSlideshowMeta({ title });
    try {
      await fetch(`/api/slideshows/${slideshow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch (err) {
      console.error("Title update failed:", err);
    }
  }, [slideshow, title, updateSlideshowMeta]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveSlideshow();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveSlideshow, undo, redo]);

  return (
    <TooltipProvider>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#0a0a1a]/90 px-3 backdrop-blur-sm">
        {/* Back */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/slideshows">
              <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-slate-200">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Back to slideshows</TooltipContent>
        </Tooltip>

        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="h-7 w-60 border-none bg-transparent text-sm font-medium text-slate-200 placeholder:text-slate-600 focus-visible:ring-0"
          placeholder="Untitled Slideshow"
        />

        {/* Save indicator */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {saving && (
            <span className="text-slate-500">Saving...</span>
          )}
          {saved && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}
          {isDirty && !saving && !saved && (
            <span className="text-amber-400/70">Unsaved changes</span>
          )}
        </div>

        <div className="flex-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={undo}
                disabled={!canUndo}
                className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={redo}
                disabled={!canRedo}
                className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-1 h-5 bg-white/[0.08]" />

        {/* Edit / Preview toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={toggleEditMode}
              className={
                isEditMode
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "border-white/[0.1] text-slate-300 hover:bg-white/[0.06]"
              }
            >
              {isEditMode ? (
                <>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  Preview
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isEditMode ? "Switch to preview" : "Switch to edit"}
          </TooltipContent>
        </Tooltip>

        {/* Fullscreen Preview */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPreviewMode(true);
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              <Maximize2 className="mr-1 h-3.5 w-3.5" />
              Fullscreen
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fullscreen Preview (F11)</TooltipContent>
        </Tooltip>

        {/* Present */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPresenterMode(true);
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              <Monitor className="mr-1 h-3.5 w-3.5" />
              Present
            </Button>
          </TooltipTrigger>
          <TooltipContent>Presenter View</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-5 bg-white/[0.08]" />

        {/* Save */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={saveSlideshow}
              disabled={!isDirty || saving}
              className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
            >
              <Save className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save (Ctrl+S)</TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-slate-200">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>

        {/* Export */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.2)] hover:bg-rose-700 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)]"
              onClick={() => {
                const event = new CustomEvent("open-export-dialog");
                window.dispatchEvent(event);
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export video</TooltipContent>
        </Tooltip>
      </header>
    </TooltipProvider>
  );
}
