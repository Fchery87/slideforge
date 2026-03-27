"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, Loader2 } from "lucide-react";

export function MediaUploadZone() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setProgress("Uploading 0/" + fileArray.length);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setProgress(`Uploading ${i + 1}/${fileArray.length}: ${file.name}`);

      try {
        const presignRes = await fetch(
          `/api/media/presign?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
          { credentials: "include" }
        );
        if (!presignRes.ok) throw new Error("Failed to get presigned URL");
        const { presignedUrl, storageKey } = await presignRes.json();

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("storageKey", storageKey);
        
        const uploadRes = await fetch("/api/media/upload", {
          method: "POST",
          credentials: "include",
          body: uploadFormData,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");

        const mediaType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("audio/")
            ? "audio"
            : "image";

        const confirmRes = await fetch("/api/media", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            type: mediaType,
            storageKey,
          }),
        });
        if (!confirmRes.ok) throw new Error("Failed to register media");
        window.dispatchEvent(new CustomEvent("slideforge:media-library-changed"));
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setProgress(null);
    setUploading(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-white/[0.1] px-3 py-3 text-center transition-colors",
        uploading
          ? "border-rose-500/30 bg-rose-500/5"
          : "hover:border-white/[0.2] hover:bg-white/[0.02]"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,audio/*"
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      {uploading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
          <p className="text-[10px] text-slate-400">{progress}</p>
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 text-slate-500" />
          <p className="text-[10px] text-slate-500">
            Drop files or click to upload
          </p>
        </>
      )}
    </div>
  );
}
