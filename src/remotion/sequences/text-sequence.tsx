import type { TextProperties } from "@/domain/slideshow/entities/canvas-object";

type TextSequenceProps = {
  properties: TextProperties;
  width: number;
  height: number;
};

export function TextSequence({ properties, width, height }: TextSequenceProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent:
          properties.textAlign === "left"
            ? "flex-start"
            : properties.textAlign === "right"
              ? "flex-end"
              : "center",
        fontFamily: properties.fontFamily,
        fontSize: properties.fontSize,
        color: properties.fontColor,
        fontWeight: properties.fontWeight,
        textAlign: properties.textAlign,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {properties.content}
    </div>
  );
}
