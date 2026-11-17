import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const TitlePromo: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({
  title = "ANTIGRAVITY MOTION STUDIO",
  subtitle = "Next-Gen Programmatic Video & After Effects Pipelines",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Snappy spring entrance
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });

  const subtitleSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });

  // Cinematic 2.5% camera push-in drift across full duration
  const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.025], {
    extrapolateRight: "clamp",
  });

  // Fade in and out
  const opacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#090d16",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#ffffff",
        overflow: "hidden",
        position: "relative",
        transform: `scale(${cameraZoom})`,
        opacity,
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Main Title with spring pop */}
      <h1
        style={{
          fontSize: 76,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          margin: 0,
          transform: `scale(${titleSpring}) translateY(${interpolate(
            titleSpring,
            [0, 1],
            [40, 0]
          )}px)`,
          opacity: titleSpring,
          background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #38bdf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          maxWidth: "85%",
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: "#94a3b8",
          marginTop: 20,
          letterSpacing: "0.02em",
          transform: `translateY(${interpolate(subtitleSpring, [0, 1], [25, 0])}px)`,
          opacity: subtitleSpring,
          textAlign: "center",
        }}
      >
        {subtitle}
      </p>

      {/* Modern Accent Bar */}
      <div
        style={{
          width: interpolate(titleSpring, [0, 1], [0, 140]),
          height: 4,
          background: "linear-gradient(90deg, #38bdf8, #818cf8)",
          borderRadius: 2,
          marginTop: 30,
          boxShadow: "0 0 16px rgba(56, 189, 248, 0.8)",
        }}
      />
    </div>
  );
};
