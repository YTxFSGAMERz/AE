import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const LowerThirdRemotion: React.FC<{
  name?: string;
  role?: string;
}> = ({ name = "ALEX RIVERS", role = "Lead Motion Designer & VFX Artist" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 140 },
  });

  // Exit slide
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const slideX = interpolate(entrance, [0, 1], [-120, 0]) - exitProgress * 150;
  const opacity = interpolate(entrance, [0, 1], [0, 1]) * (1 - exitProgress);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "transparent",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 120,
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "18px 36px 18px 24px",
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          transform: `translateX(${slideX}px)`,
          opacity,
        }}
      >
        {/* Accent Bar */}
        <div
          style={{
            width: 6,
            height: 54,
            background: "linear-gradient(180deg, #38bdf8 0%, #818cf8 100%)",
            borderRadius: 4,
            boxShadow: "0 0 16px rgba(56, 189, 248, 0.7)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </div>
  );
};
