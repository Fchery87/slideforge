"use client";

import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";

export function useUnsavedChanges() {
  const isDirty = useEditorStore((s) => s.isDirty);

  // Browser beforeunload guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Route change guard for Next.js
  const confirmNavigation = useCallback(
    (message?: string) => {
      if (!isDirty) return true;
      return window.confirm(
        message ?? "You have unsaved changes. Are you sure you want to leave?"
      );
    },
    [isDirty]
  );

  return { isDirty, confirmNavigation };
}
