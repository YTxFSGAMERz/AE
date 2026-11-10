import React from "react";
import { theme } from "./theme";

// Text-only brand mark — never a logo image.
export const BrandKicker: React.FC<{ text?: string; color?: string; size?: number; style?: React.CSSProperties }> = ({
  text = "Your Brand",
  color = theme.inkSoft,
  size = 22,
  style,
}) => (
  <span
    style={{
      fontFamily: theme.fontText,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: size * 0.28,
      color,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {text}
  </span>
);
