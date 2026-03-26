export interface TextStyle {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  animation?: "none" | "typewriter" | "fade-in" | "slide-up";
}

export const defaultTextStyle: TextStyle = {
  content: "New Text",
  fontFamily: "Inter",
  fontSize: 24,
  fontColor: "#ffffff",
  fontWeight: "normal",
  textAlign: "center",
};
