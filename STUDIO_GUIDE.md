# 🎬 Video Editing Studio Guide (AE Workspace)

Welcome to the automated Video Editing Studio for the **AE** parent repository (`c:\Users\Admin\Documents\GitHub\AE`).

This studio directly interconnects with **all After Effects projects** across the repository, enabling seamless bi-directional workflows between downloaded assets, Whisper AI transcription, HyperFrames, Remotion motion graphics, and After Effects compositions.

---

## 🏗️ Repository Architecture & Interconnected Projects

```
AE/                                                           <-- Main Parent Folder
├── studio.py                                                 <-- Central Studio CLI Command Center
├── package.json                                              <-- Root configuration & npm scripts
├── STUDIO_GUIDE.md                                           <-- This guide
│
├── remotion/                                                 <-- ⚛️ React/TypeScript Motion Graphics
│   ├── remotion.config.ts
│   └── src/
│       ├── Root.tsx                                          <-- Composition Registry
│       ├── index.ts                                          <-- registerRoot
│       └── compositions/                                     <-- TitlePromo, LowerThird, VerticalPromo
│
├── Animated Mobile Weather App Promo Project/                <-- Connected AE Project
│   ├── Final_WeatherApp_Promo.aep
│   ├── assets/ [audio, footage, images]
│   └── transcripts/                                          <-- Whisper transcripts & AE JSX scripts
│
├── Journey Through Space From Earth to Imagination Project/  <-- Connected AE Project
│   ├── Final_Space_Journey.aep
│   └── assets/ [audio, footage, images]
│
├── Motion & Timing Animation Project/                        <-- Connected AE Project
├── Motion Graphics/                                          <-- 49 AEP comps & templates
├── Project City Life An Animated Motion Scene/
├── Project Future Voyage A Motion Design Story.../
├── Project The Journey of a Memory A Motion Story.../
│
├── scripts/
│   ├── ae_bridge.py                                          <-- Native OS IPC bridge to After Effects
│   ├── audio_marker_sync.py                                  <-- Beat transient marker generator
│   └── studio/
│       ├── ae_integration.py                                 <-- Cross-folder AE discovery & communication
│       ├── download.py                                       <-- yt-dlp media downloader
│       ├── transcribe.py                                     <-- Whisper transcription engine
│       ├── scene_split.py                                    <-- PySceneDetect shot cutter
│       ├── video_toolkit.py                                  <-- FFmpeg video editor (trim, reframe, burn)
│       └── whisper_to_hyperframes.py                         <-- Kinetic subtitle generator
│
└── studio/                                                   <-- Central Studio Hub & Storage
    ├── raw/                                                  <-- Downloaded raw footage
    ├── audio/                                                <-- BGM & sound effects
    ├── transcripts/                                          <-- Central Whisper transcripts
    ├── clips/                                                <-- Split scenes & clips
    ├── renders/                                              <-- Master exports & vertical Reels
    ├── assets/                                               <-- Overlays & branding
    └── hyperframes_projects/                                 <-- Programmatic HTML/GSAP motion graphics
        ├── intro_demo/
        └── lower_third/
```

---

## ⚡ Connected Capabilities

| Feature | Engine | Description |
| :--- | :--- | :--- |
| **Project Auto-Discovery** | Python | Instantly scans and catalogs all AE project folders, `.aep` files, assets, and renders. |
| **React Motion Graphics** | **Remotion 4.0** | Programmatic React/TypeScript video compositions, spring animations, ProRes 4444 / alpha exports. |
| **HTML/GSAP Motion Graphics** | **HyperFrames** | HTML5, CSS3, and GSAP timeline animations with 448 catalog primitives. |
| **Download $\to$ AE Project** | `yt-dlp` | Fetches videos/audio directly into any AE project's `assets/footage` or `assets/audio` and can auto-import it into the active After Effects comp. |
| **Whisper $\to$ AE Transcripts** | `Whisper` | Transcribes audio or video from any AE project, creating `.srt`, `.vtt`, and `.json` in the project's folder. |
| **Whisper $\to$ AE Timeline Markers** | `Whisper` + `ae_bridge` | Pushes spoken word and sentence cue markers directly onto the active After Effects timeline. |
| **Whisper $\to$ Native AE Text Layers** | `Whisper` + ExtendScript | Generates ExtendScript JSX scripts that build animated caption Text Layers directly inside After Effects. |
| **Remotion / HyperFrames $\to$ AE** | Remotion / HyperFrames | Renders motion graphics and delivers them straight to an AE project's `assets/` bin. |
| **AE Render $\to$ Social Media** | FFmpeg | Takes AE project master renders (16:9), reframes them to 9:16 vertical Reels with blurred backdrops, and burns captions. |

---

## 🔑 Authorizations & Licensing Breakdown

| Tool | Status | Authorization / License Details | Action Required? |
| :--- | :--- | :--- | :--- |
| **Whisper** | Configured & Tested | Runs 100% locally on-device with PyTorch / Whisper.cpp weights. Completely free and private. | **No action needed.** |
| **FFmpeg & FFprobe** | Configured & Tested | Open-source (GPL v3 Gyan build). Runs locally. | **No action needed.** |
| **PySceneDetect & OpenCV** | Configured & Tested | Open-source (BSD / Apache). Runs locally. | **No action needed.** |
| **HyperFrames** | Configured & Tested | Open-source (Apache-2.0) for local rendering. Headless Chrome is installed and verified. | **No action needed for local work.** *(Optional: HeyGen cloud render requires `hyperframes auth`)* |
| **Remotion** | Configured & Tested | Remotion License. Free for individuals, non-commercial, and teams with $\le 3$ people. Headless browser is installed and verified. | **No action needed for solo/small teams.** *(Large commercial companies >3 people require a commercial key from `remotion.dev`)* |
| **yt-dlp** | Configured & Tested | Open-source CLI. Free and unrestricted for public videos. | **No action needed for standard videos.** *(Optional: Pass `--cookies-from-browser chrome` for age-restricted/member videos)* |
| **Adobe After Effects** | Configured & Tested | Installed at `C:\Program Files\Adobe\Adobe After Effects 2026\`. Scripting network/file security enabled (`1`). | Requires active Adobe Creative Cloud subscription to launch After Effects. |

---

## 🚀 Command Reference (`python studio.py`)

Run commands directly from the `AE` root:

### 1. Remotion React Video Creation & Rendering
```bash
# List all Remotion React compositions
python studio.py remotion-list

# Start live interactive Remotion visual preview studio in browser
python studio.py remotion-studio
# or via npm:
npm run remotion:studio

# Render a composition to 1080p MP4
python studio.py remotion-render TitlePromo -o studio/renders/my_title.mp4

# Render with Apple ProRes 4444 (straight alpha channel) for After Effects overlay
python studio.py remotion-render LowerThird --prores -o studio/renders/lower_third.mov

# Render and deliver directly into an AE project
python studio.py remotion-render LowerThird --to-project weather --import-ae
```

### 2. Project Discovery & Health
```bash
# List all AE projects, AEP files, renders, and assets in the repository
python studio.py projects

# Check studio toolchain status & connected folders
python studio.py status
```

### 3. Download Media Directly into an AE Project
```bash
# Download 1080p video straight into "Animated Mobile Weather App Promo Project/assets/footage/"
python studio.py download "https://www.youtube.com/watch?v=..." --to-project weather --import-ae

# Download audio only (MP3 320k) into "Journey Through Space.../assets/audio/"
python studio.py download "https://www.youtube.com/watch?v=..." --audio --to-project space
```

### 4. Transcribe AE Project Media with Whisper
```bash
# Automatically finds audio/video in the project and transcribes it
python studio.py transcribe --project weather --model base

# Transcribe any specific file
python studio.py transcribe "Animated Mobile Weather App Promo Project/assets/audio/promo_soundtrack.mp3"
```

### 5. Create Speech Markers & Caption Layers in After Effects
```bash
# Transcribe speech and create markers on the active comp timeline in After Effects
python studio.py sync-markers "Animated Mobile Weather App Promo Project/assets/audio/promo_soundtrack.mp3"

# Generate animated native After Effects text layers from Whisper JSON
python studio.py ae-captions "Animated Mobile Weather App Promo Project/transcripts/promo_soundtrack.json" --apply
```

### 6. Process AE Renders for Social Media (Reels/Shorts/TikTok)
```bash
# Convert an AE project's render to 9:16 vertical with blurred backdrop
python studio.py process-render weather --vertical

# Convert to 9:16 vertical, transcribe with Whisper, and burn subtitles
python studio.py process-render weather --vertical --burn-subs

# Split an AE project render into highlight clips using PySceneDetect
python studio.py process-render weather --split
```

### 7. Google Drive Auto-Sync (Automatic with Git Push)
Whenever you push commits to GitHub, the repository automatically syncs your modified files to Google Drive ([`My Drive > AE`](https://drive.google.com/drive/u/1/folders/18jb20pW3S-KNLwWrvanW9UChR7b9WCg_)).

```bash
# Automatic on push (pre-push hook)
git push

# Manual high-speed delta sync (detects unpushed/modified files in ~3s)
python studio.py sync
# or using npm
npm run sync

# Full cache-assisted repository audit
python studio.py sync --full

# Re-install or check the git pre-push hook
python studio.py sync --install-hook
```

