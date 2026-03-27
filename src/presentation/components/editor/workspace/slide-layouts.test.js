import { describe, expect, test } from "bun:test";
import { createSlideLayoutObjects } from "@/presentation/components/editor/workspace/slide-layouts";

describe("createSlideLayoutObjects", () => {
  test("creates a title layout with title and subtitle text blocks", () => {
    const objects = createSlideLayoutObjects("title", "slide-1");

    expect(objects).toHaveLength(2);
    expect(objects.every((obj) => obj.type === "text")).toBe(true);
    expect(objects[0].properties.content).toContain("Presentation Title");
    expect(objects[1].properties.content).toContain("subtitle");
  });

  test("creates a two-column layout with separator and content blocks", () => {
    const objects = createSlideLayoutObjects("two-column", "slide-1");

    expect(objects).toHaveLength(4);
    expect(objects.filter((obj) => obj.type === "text")).toHaveLength(3);
    expect(objects.some((obj) => obj.type === "shape")).toBe(true);
  });

  test("returns an empty object list for a blank layout", () => {
    expect(createSlideLayoutObjects("blank", "slide-1")).toEqual([]);
  });
});
