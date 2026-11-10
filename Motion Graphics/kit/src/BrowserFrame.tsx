import React from "react";
import { theme } from "./theme";
// Minimal Apple-style browser chrome around a fetched screenshot.
export const BrowserFrame: React.FC<{ width: number; height: number; url?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ width, height, url, children, style }) => (
  <div style={{ width, height, borderRadius: 26, background: "#FFFFFF", border: `1px solid ${theme.hairline}`, boxShadow: "0 40px 110px rgba(3,7,18,0.16), 0 10px 30px rgba(3,7,18,0.08)", overflow: "hidden", display: "flex", flexDirection: "column", ...style }}>
    <div style={{ height: 54, flex: "0 0 54px", background: "#F5F5F7", borderBottom: `1px solid ${theme.hairline}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 9 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
      {url ? <div style={{ marginLeft: 18, flex: 1, maxWidth: 560, height: 30, borderRadius: 9, background: "#FFFFFF", border: `1px solid ${theme.hairline}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fontText, fontSize: 16, color: theme.inkSoft, letterSpacing: 0.2 }}>{url}</div> : null}
    </div>
    <div style={{ position: "relative", flex: 1, overflow: "hidden", background: "#FFFFFF" }}>{children}</div>
  </div>
);
