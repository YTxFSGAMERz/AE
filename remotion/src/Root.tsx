import React from "react";
import { Composition } from "remotion";
import { TitlePromo } from "./compositions/TitlePromo";
import { LowerThirdRemotion } from "./compositions/LowerThirdRemotion";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TitlePromo"
        component={TitlePromo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "ANTIGRAVITY MOTION STUDIO",
          subtitle: "Programmatic React Video with Remotion & After Effects",
        }}
      />
      <Composition
        id="LowerThird"
        component={LowerThirdRemotion}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          name: "ALEX RIVERS",
          role: "Lead Motion Designer & VFX Artist",
        }}
      />
      <Composition
        id="VerticalPromo"
        component={TitlePromo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "REEL MOTION",
          subtitle: "9:16 Vertical Video with Remotion",
        }}
      />
    </>
  );
};
