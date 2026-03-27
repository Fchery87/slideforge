"use client";

import { useEffect, useRef } from "react";
import { EDITOR_FONTS, buildGoogleFontsUrl } from "./font-config";

/**
 * Loads all editor fonts from Google Fonts via a <link> tag.
 * Place this once in the editor layout. It injects the stylesheet on mount
 * and removes it on unmount.
 */
export function EditorFontLoader() {
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    // Avoid duplicates
    const existing = document.querySelector('link[data-editor-fonts]');
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = buildGoogleFontsUrl(EDITOR_FONTS);
    link.setAttribute("data-editor-fonts", "true");
    document.head.appendChild(link);
    linkRef.current = link;

    return () => {
      if (linkRef.current && linkRef.current.parentNode) {
        linkRef.current.parentNode.removeChild(linkRef.current);
      }
    };
  }, []);

  return null;
}
