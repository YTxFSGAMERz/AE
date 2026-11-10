import { staticFile } from "remotion";

const face = (family: string, file: string, weight: number) => `
@font-face {
  font-family: "${family}";
  src: url("${staticFile("fonts/" + file)}") format("opentype");
  font-weight: ${weight};
  font-style: normal;
  font-display: block;
}`;

export const fontFaceCss = [
  face("SF Pro Display", "SF-Pro-Display-Regular.otf", 400),
  face("SF Pro Display", "SF-Pro-Display-Medium.otf", 500),
  face("SF Pro Display", "SF-Pro-Display-Semibold.otf", 600),
  face("SF Pro Display", "SF-Pro-Display-Bold.otf", 700),
  face("SF Pro Text", "SF-Pro-Text-Regular.otf", 400),
  face("SF Pro Text", "SF-Pro-Text-Medium.otf", 500),
  face("SF Pro Text", "SF-Pro-Text-Semibold.otf", 600),
  face("SF Pro Text", "SF-Pro-Text-Bold.otf", 700),
].join("\n");
