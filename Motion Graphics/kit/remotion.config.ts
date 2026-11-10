import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png"); // required for alpha renders
// Pixel format is passed per-render (prores 4444 -> yuva444p10le)
