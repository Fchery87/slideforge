"use client";

import { EnhancedMediaBrowser } from "./enhanced-media-browser";

interface MediaBrowserProps {
  type: "image" | "audio";
}

export function MediaBrowser({ type }: MediaBrowserProps) {
  return <EnhancedMediaBrowser type={type} />;
}
