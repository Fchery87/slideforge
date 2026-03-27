"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { Button } from "@/components/ui/button";
import { StickyNote, Trash2 } from "lucide-react";

export function NotesPanel() {
  const { slideshow, currentSlideIndex, updateSlide } = useEditorStore();

  const currentSlide = slideshow?.slides[currentSlideIndex];
  const notes = currentSlide?.notes ?? "";

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!currentSlide) return;
      updateSlide(currentSlideIndex, { notes: e.target.value });
    },
    [currentSlide, currentSlideIndex, updateSlide]
  );

  const handleClearNotes = useCallback(() => {
    if (!currentSlide) return;
    updateSlide(currentSlideIndex, { notes: undefined });
  }, [currentSlide, currentSlideIndex, updateSlide]);

  if (!currentSlide) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <StickyNote className="mb-2 h-8 w-8 text-slate-600" />
        <p className="text-center text-sm text-slate-500">No slide selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">Presenter Notes</h3>
        </div>
        {notes && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleClearNotes}
            className="text-slate-500 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <p className="text-[11px] text-slate-500">
        These notes are visible in presenter view during presentation.
      </p>

      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Add presenter notes for this slide..."
        className="min-h-[160px] w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-ring"
      />

      <div className="text-right text-[10px] text-slate-600">
        {notes.length} characters
      </div>
    </div>
  );
}
