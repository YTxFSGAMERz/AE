import React from "react";
import { fontFaceCss } from "./fonts";

// @font-face declarations rendered into JSX so faces exist at commit time.
// SF Pro is also installed system-wide on macOS, so glyphs render synchronously
// (no delayRender gate — Remotion freezes timers during renders).
export const SFProFaces: React.FC = () => (
  <style id="sf-pro-faces">{fontFaceCss}</style>
);
