import { describe, expect, test } from "bun:test";
import {
  getMediaFileUrl,
  resolveCanvasImageUrl,
} from "./media-url";

describe("resolveCanvasImageUrl", () => {
  test("returns presigned url when the media url endpoint succeeds", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ presignedUrl: "https://cdn.example.com/image.png" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    try {
      await expect(resolveCanvasImageUrl("asset-123")).resolves.toBe(
        "https://cdn.example.com/image.png"
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("falls back to the authenticated file route when the media url endpoint fails", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => new Response("nope", { status: 500 });

    try {
      await expect(resolveCanvasImageUrl("asset-456")).resolves.toBe(
        getMediaFileUrl("asset-456")
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
