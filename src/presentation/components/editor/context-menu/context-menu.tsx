"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import {
  Copy,
  Scissors,
  ClipboardPaste,
  Layers,
  Ungroup,
  Trash2,
  ArrowUp,
  ArrowDown,
  Grid3X3,
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const {
    slideshow,
    currentSlideIndex,
    selectedObjectId,
    selectedObjectIds,
    copy,
    cut,
    paste,
    removeObject,
    duplicateObject,
    groupObjects,
    ungroupObject,
    reorderObjects,
    canPaste,
  } = useEditorStore();

  const currentSlide = slideshow?.slides[currentSlideIndex];
  const selectedObjects = currentSlide?.canvasObjects.filter((o) =>
    selectedObjectIds.includes(o.id)
  ) ?? [];
  const selectedObject = currentSlide?.canvasObjects.find((o) => o.id === selectedObjectId);
  const hasMultipleSelected = selectedObjectIds.length > 1;
  const activeGroupId =
    selectedObject?.type === "group"
      ? selectedObject.id
      : selectedObject?.groupId ??
        (selectedObjects.length > 0 &&
        selectedObjects.every((item) => item.groupId && item.groupId === selectedObjects[0]?.groupId)
          ? selectedObjects[0]?.groupId ?? null
          : null);
  const isGroup = !!activeGroupId;

  const handleAction = useCallback(
    (action: () => void) => {
      action();
      onClose();
    },
    [onClose]
  );

  if (!currentSlide) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Menu */}
      <div
        className="fixed z-50 min-w-[200px] rounded-lg border border-white/10 bg-[#1a1a2e] py-1 shadow-xl"
        style={{
          left: Math.min(x, window.innerWidth - 220),
          top: Math.min(y, window.innerHeight - 300),
        }}
      >
        {/* Copy/Paste Section */}
        <div className="px-1 py-1">
          <MenuItem
            icon={Copy}
            label="Copy"
            shortcut="Ctrl+C"
            onClick={() => handleAction(copy)}
            disabled={!selectedObjectId}
          />
          <MenuItem
            icon={Scissors}
            label="Cut"
            shortcut="Ctrl+X"
            onClick={() => handleAction(cut)}
            disabled={!selectedObjectId}
          />
          <MenuItem
            icon={ClipboardPaste}
            label="Paste"
            shortcut="Ctrl+V"
            onClick={() => handleAction(paste)}
            disabled={!canPaste}
          />
        </div>

        <div className="mx-2 my-1 h-px bg-white/10" />

        {/* Duplicate & Delete */}
        <div className="px-1 py-1">
          <MenuItem
            icon={Grid3X3}
            label="Duplicate"
            shortcut="Ctrl+D"
            onClick={() =>
              selectedObjectId &&
              handleAction(() => duplicateObject(currentSlide.id, selectedObjectId))
            }
            disabled={!selectedObjectId}
          />
          <MenuItem
            icon={Trash2}
            label="Delete"
            shortcut="Del"
            onClick={() =>
              selectedObjectId &&
              handleAction(() => removeObject(currentSlide.id, selectedObjectId))
            }
            disabled={!selectedObjectId}
            destructive
          />
        </div>

        {selectedObjectId && (
          <>
            <div className="mx-2 my-1 h-px bg-white/10" />

            {/* Group/Ungroup */}
            <div className="px-1 py-1">
              {isGroup ? (
                <MenuItem
                  icon={Ungroup}
                  label="Ungroup"
                  onClick={() =>
                    activeGroupId &&
                    handleAction(() => ungroupObject(currentSlide.id, activeGroupId))
                  }
                />
              ) : hasMultipleSelected ? (
                <MenuItem
                  icon={Layers}
                  label="Group"
                  shortcut="Ctrl+G"
                  onClick={() =>
                    handleAction(() => groupObjects(currentSlide.id, selectedObjectIds))
                  }
                />
              ) : null}
            </div>

            <div className="mx-2 my-1 h-px bg-white/10" />

            {/* Layer Order */}
            <div className="px-1 py-1">
              <MenuItem
                icon={ArrowUp}
                label="Bring to Front"
                onClick={() =>
                  handleAction(() => reorderObjects(currentSlide.id, selectedObjectId, "up"))
                }
              />
              <MenuItem
                icon={ArrowDown}
                label="Send to Back"
                onClick={() =>
                  handleAction(() => reorderObjects(currentSlide.id, selectedObjectId, "down"))
                }
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

function MenuItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled,
  destructive,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed text-slate-600"
          : destructive
          ? "text-red-400 hover:bg-red-500/10"
          : "text-slate-300 hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-slate-500">{shortcut}</span>
      )}
    </button>
  );
}

// Hook to use context menu
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
}
