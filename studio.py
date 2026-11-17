#!/usr/bin/env python3
"""
=============================================================================
🎬 VIDEO EDITING STUDIO - COMMAND CENTER
=============================================================================
Unified CLI for the Video Editing Studio Workspace.
Orchestrates:
  - yt-dlp for downloading footage/audio
  - Whisper for transcription & subtitle generation (OpenAI Whisper & Whisper.cpp)
  - HyperFrames for programmatic HTML/CSS/GSAP motion graphics
  - FFmpeg for editing, trimming, aspect ratio conversion & burning captions
  - PySceneDetect for automated shot & scene cutting
  - Deep Cross-Folder integration with all Adobe After Effects project folders in AE
"""

import sys
import os
import shutil
import subprocess
import argparse
from pathlib import Path

STUDIO_ROOT = Path(__file__).resolve().parent

def ensure_path():
    """Ensure user Winget and Python script binaries are in PATH."""
    links_dir = r"C:\Users\Admin\AppData\Local\Microsoft\WinGet\Links"
    whisper_dir = r"C:\Users\Admin\AppData\Local\Programs\whisper-cpp\Release"
    py_scripts = r"C:\Python315\Scripts"
    
    current_path = os.environ.get("PATH", "")
    for p in [links_dir, whisper_dir, py_scripts]:
        if p not in current_path:
            os.environ["PATH"] = f"{p};{os.environ.get('PATH', '')}"

ensure_path()

# Import AE integration module
sys.path.insert(0, str(STUDIO_ROOT / "scripts"))
sys.path.insert(0, str(STUDIO_ROOT / "scripts" / "studio"))
from scripts.studio import ae_integration

def cmd_status(args):
    """Check and display status of all studio tools, libraries, and AE projects."""
    print("\n" + "="*65)
    print("🎬 VIDEO EDITING STUDIO - ENVIRONMENT & AE INTEGRATION STATUS")
    print("="*65)

    tools = [
        ("FFmpeg", ["ffmpeg", "-version"]),
        ("FFprobe", ["ffprobe", "-version"]),
        ("yt-dlp", ["yt-dlp", "--version"]),
        ("Whisper (CLI)", ["whisper", "--help"]),
        ("Whisper.cpp", ["whisper-cli.exe", "--help"]),
        ("HyperFrames", ["hyperframes", "--version"]),
        ("Remotion", ["remotion", "--version"]),
        ("Node.js", ["node", "--version"]),
        ("Python", ["python", "--version"]),
    ]

    for name, cmd in tools:
        executable = shutil.which(cmd[0])
        if not executable and os.name == "nt":
            executable = shutil.which(f"{cmd[0]}.cmd") or shutil.which(f"{cmd[0]}.exe")
        
        if executable:
            try:
                run_cmd = [executable] + cmd[1:]
                res = subprocess.run(run_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5, shell=(os.name == 'nt'))
                out = (res.stdout or res.stderr).strip().splitlines()
                first_line = out[0] if out else "Available"
                print(f"  [✓] {name:<16} : {first_line[:48]}")
            except Exception as e:
                print(f"  [!] {name:<16} : Error executing ({e})")
        else:
            print(f"  [✗] {name:<16} : NOT FOUND in PATH")

    print("\n📦 Installed Studio Python Libraries:")
    py_libs = ["torch", "whisper", "yt_dlp", "scenedetect", "cv2", "pydub", "PIL"]
    for lib in py_libs:
        try:
            mod = __import__(lib)
            ver = getattr(mod, "__version__", "Available")
            print(f"  [✓] {lib:<16} : v{ver}")
        except Exception:
            print(f"  [✗] {lib:<16} : Not installed")

    print("\n📁 Connected AE Project Folders (Main Parent: AE):")
    projects = ae_integration.discover_ae_projects()
    for name, p_data in projects.items():
        aeps = len(p_data["aep_files"])
        renders = len(p_data["renders"])
        assets_tag = "Has Assets" if p_data["has_assets"] else "No Assets"
        print(f"  🎬 {name:<45} : {aeps} AEPs | {renders} Renders | {assets_tag}")

    print("\n📁 Central Studio Storage:")
    dirs = [
        "studio/raw",
        "studio/audio",
        "studio/transcripts",
        "studio/clips",
        "studio/renders",
        "studio/assets",
        "studio/hyperframes_projects"
    ]
    for d in dirs:
        p = STUDIO_ROOT / d
        count = len(list(p.glob("*"))) - 1 if p.exists() else 0
        status = f"Ready ({max(0, count)} files)" if p.exists() else "Missing"
        print(f"  📂 {d:<30} : {status}")

    print("="*65)
    print("Studio is integrated with all AE folders! Run `python studio.py --help`.\n")

def cmd_projects(args):
    """List all detected After Effects project folders with details."""
    projects = ae_integration.discover_ae_projects()
    print("\n" + "="*70)
    print("🎬 AFTER EFFECTS PROJECTS IN REPOSITORY")
    print("="*70)
    for name, p in projects.items():
        print(f"\n📁 Project: {name}")
        print(f"   Path:    {p['path']}")
        if p["aep_files"]:
            print(f"   AEPs:    {', '.join([Path(x).name for x in p['aep_files']])}")
        if p["renders"]:
            print(f"   Renders: {', '.join([Path(x).name for x in p['renders']])}")
        if p["assets_path"]:
            print(f"   Assets:  {p['assets_path']}")
    print("\n" + "="*70)

def cmd_download(args):
    """Download video or audio using yt-dlp, with optional direct delivery to an AE project."""
    from scripts.studio.download import download_media
    result = download_media(
        url=args.url,
        output_dir=args.output,
        audio_only=args.audio,
        resolution=args.res,
        audio_format=args.format
    )
    downloaded_file = result.get("file")

    # If --to-project specified, send directly into that AE project's assets
    if args.to_project and downloaded_file and os.path.exists(downloaded_file):
        ae_integration.send_media_to_ae_project(
            media_path=downloaded_file,
            project_query=args.to_project,
            import_to_ae=args.import_ae
        )

def cmd_transcribe(args):
    """Transcribe media using Whisper (supports standalone file or project audio)."""
    from scripts.studio.transcribe import transcribe_media

    target_file = args.input
    output_dir = args.output

    if args.project:
        proj = ae_integration.resolve_project(args.project)
        p_path = Path(proj["path"])
        # Find media in project
        candidates = list((p_path / "assets" / "audio").glob("*.*")) + list((p_path / "assets" / "footage").glob("*.*")) + [Path(x) for x in proj["renders"]]
        candidates = [c for c in candidates if c.suffix.lower() in [".mp3", ".wav", ".m4a", ".mp4", ".mov", ".flac"]]
        if not candidates:
            raise FileNotFoundError(f"No audio or video found in project '{proj['name']}' to transcribe.")
        target_file = str(candidates[0])
        if output_dir is None:
            output_dir = str(p_path / "transcripts")
        print(f"[Studio Whisper] Auto-selected project media: {target_file}")

    if not target_file:
        print("Error: Please provide a media file or specify --project <name>.")
        return

    transcribe_media(
        media_path=target_file,
        output_dir=output_dir,
        model_name=args.model,
        language=args.lang,
        device=args.device
    )

def cmd_sync_markers(args):
    """Transcribe speech and apply sync markers directly to After Effects comp timeline."""
    from scripts.studio.transcribe import transcribe_media
    import json

    input_path = Path(args.input)
    if input_path.suffix.lower() == ".json":
        json_file = str(input_path)
    else:
        # Transcribe first
        print(f"[AE Markers] Transcribing {input_path.name} to generate word/sentence cues...")
        res = transcribe_media(str(input_path), model_name=args.model)
        json_file = str(Path(res["output_dir"]) / f"{res['stem']}.json")

    ae_integration.sync_speech_markers_to_ae(json_file, marker_prefix=args.prefix)

def cmd_ae_captions(args):
    """Generate ExtendScript JSX to create animated native After Effects text layers from Whisper."""
    from scripts.studio.transcribe import transcribe_media

    input_path = Path(args.input)
    if input_path.suffix.lower() == ".json":
        json_file = str(input_path)
    else:
        res = transcribe_media(str(input_path), model_name=args.model)
        json_file = str(Path(res["output_dir"]) / f"{res['stem']}.json")

    out_jsx = ae_integration.create_ae_caption_layers_script(json_file, args.output)
    if args.apply:
        try:
            import ae_bridge
            if ae_bridge and ae_bridge.is_ae_running():
                print("[AE Integration] Applying caption layers into active AE comp...")
                res = ae_bridge.dispatch_command("run_file", {"file": out_jsx, "undo_name": "Whisper Captions"})
                print(f"[AE Integration] Result: {res.get('result', res.get('error'))}")
            else:
                print("[AE Integration] AfterFX is not running. Run the generated script via File > Scripts > Run Script File.")
        except Exception as e:
            print(f"[AE Integration] Notice: {e}")

def cmd_process_ae_render(args):
    """Grab an AE project render and process it (vertical reframe, burning captions, scene split)."""
    from scripts.studio import video_toolkit, transcribe

    proj = ae_integration.resolve_project(args.project)
    if not proj["renders"]:
        raise FileNotFoundError(f"No render MP4 found in project '{proj['name']}'.")

    source_render = Path(proj["renders"][0])
    print(f"\n[AE Process] Selected project render: {source_render.name}")

    current_video = str(source_render)

    # 1. Vertical conversion
    if args.vertical:
        out_vert = STUDIO_ROOT / "studio" / "renders" / f"{source_render.stem}_vertical_9x16.mp4"
        current_video = video_toolkit.to_vertical_reels(current_video, str(out_vert))

    # 2. Transcribe & Burn Subtitles
    if args.burn_subs:
        t_res = transcribe.transcribe_media(current_video, model_name="base")
        srt_file = str(Path(t_res["output_dir"]) / f"{t_res['stem']}.srt")
        out_subbed = STUDIO_ROOT / "studio" / "renders" / f"{Path(current_video).stem}_subbed.mp4"
        current_video = video_toolkit.burn_subtitles(current_video, srt_file, str(out_subbed))

    # 3. Scene Split
    if args.split:
        from scripts.studio.scene_split import split_scenes
        split_scenes(current_video)

    print(f"\n[AE Process] Complete! Processed video: {current_video}")

def cmd_send_media(args):
    """Copy media into an AE project assets directory and optionally import into AE."""
    ae_integration.send_media_to_ae_project(
        media_path=args.input,
        project_query=args.project,
        media_type=args.type,
        import_to_ae=args.import_ae
    )

def cmd_split(args):
    """Detect scenes and cut into clips."""
    from scripts.studio.scene_split import split_scenes
    split_scenes(
        video_path=args.input,
        output_dir=args.output,
        threshold=args.threshold,
        min_scene_len=args.min_len,
        generate_thumbnails=not args.no_thumbs
    )

def cmd_vertical(args):
    """Convert 16:9 to 9:16 vertical Reel."""
    from scripts.studio.video_toolkit import to_vertical_reels
    to_vertical_reels(args.input, args.output)

def cmd_burn_subs(args):
    """Burn subtitles onto video."""
    from scripts.studio.video_toolkit import burn_subtitles
    burn_subtitles(args.input, args.srt, args.output, args.font_size)

def cmd_trim(args):
    """Trim video clip."""
    from scripts.studio.video_toolkit import trim_video
    trim_video(args.input, args.start, args.end, args.output, args.reencode)

def cmd_concat(args):
    """Concat video clips."""
    from scripts.studio.video_toolkit import concat_videos
    concat_videos(args.inputs, args.output)

def cmd_extract_audio(args):
    """Extract audio from video."""
    from scripts.studio.video_toolkit import extract_audio
    extract_audio(args.input, args.format, args.output)

def cmd_motion_init(args):
    """Initialize a HyperFrames project."""
    target_dir = STUDIO_ROOT / "studio" / "hyperframes_projects" / args.name
    cmd = ["hyperframes", "init", str(target_dir), f"--example={args.example}", "--non-interactive"]
    subprocess.run(cmd)

def cmd_motion_preview(args):
    """Start HyperFrames preview server."""
    project_dir = STUDIO_ROOT / "studio" / "hyperframes_projects" / args.name
    if not project_dir.exists():
        project_dir = Path(args.name).resolve()
    print(f"Starting HyperFrames preview for: {project_dir}")
    subprocess.run(["hyperframes", "preview"], cwd=str(project_dir))

def cmd_motion_render(args):
    """Render HyperFrames project to MP4 or WebM overlay, with optional AE delivery."""
    project_dir = STUDIO_ROOT / "studio" / "hyperframes_projects" / args.name
    if not project_dir.exists():
        project_dir = Path(args.name).resolve()

    out_file = args.output
    if not out_file:
        ext = "webm" if args.alpha else "mp4"
        out_file = str(STUDIO_ROOT / "studio" / "renders" / f"{project_dir.name}.{ext}")

    print(f"Rendering HyperFrames project '{project_dir.name}' to: {out_file}")
    cmd = ["hyperframes", "render", "-o", str(out_file)]
    if args.alpha:
        cmd.extend(["--format", "webm"])
    subprocess.run(cmd, cwd=str(project_dir))

    # Deliver to AE project if requested
    if args.to_project and os.path.exists(out_file):
        ae_integration.send_media_to_ae_project(
            media_path=out_file,
            project_query=args.to_project,
            media_type="footage",
            import_to_ae=args.import_ae
        )

def cmd_remotion_list(args):
    """List available Remotion compositions."""
    entry = args.entry or str(STUDIO_ROOT / "remotion" / "src" / "index.ts")
    subprocess.run(["npx", "remotion", "compositions", entry], shell=(os.name == 'nt'))

def cmd_remotion_studio(args):
    """Open Remotion visual preview studio in browser."""
    entry = args.entry or str(STUDIO_ROOT / "remotion" / "src" / "index.ts")
    print(f"Starting Remotion Studio for: {entry}...")
    subprocess.run(["npx", "remotion", "studio", entry], shell=(os.name == 'nt'))

def cmd_remotion_render(args):
    """Render a Remotion composition to MP4 or ProRes MOV, with optional delivery to AE."""
    entry = args.entry or str(STUDIO_ROOT / "remotion" / "src" / "index.ts")
    comp_id = args.composition
    out_file = args.output
    if not out_file:
        ext = "mov" if args.prores else "mp4"
        out_file = str(STUDIO_ROOT / "studio" / "renders" / f"remotion_{comp_id.lower()}.{ext}")

    cmd = ["npx", "remotion", "render", entry, comp_id, out_file]
    if args.prores:
        cmd.extend(["--codec=prores", "--prores-profile=4444"])
    elif args.alpha:
        cmd.extend(["--codec=vp9", "--pixel-format=yuva420p"])

    print(f"Rendering Remotion composition '{comp_id}' to: {out_file}")
    subprocess.run(cmd, shell=(os.name == 'nt'))

    if args.to_project and os.path.exists(out_file):
        ae_integration.send_media_to_ae_project(
            media_path=out_file,
            project_query=args.to_project,
            media_type="footage",
            import_to_ae=args.import_ae
        )

def cmd_kinetic_subs(args):
    """Generate HyperFrames kinetic subtitles from Whisper JSON."""
    from scripts.studio.whisper_to_hyperframes import generate_hyperframes_subtitles
    generate_hyperframes_subtitles(
        json_path=args.json,
        project_name=args.name,
        width=args.width,
        height=args.height,
        font_color=args.color,
        highlight_color=args.highlight,
        bg_transparent=not args.opaque
    )

def cmd_sync(args):
    """Synchronize AE repository to Google Drive."""
    sync_script = STUDIO_ROOT / "scripts" / "studio" / "gdrive_sync.py"
    cmd = [sys.executable, str(sync_script)]
    if args.install_hook:
        cmd.append("--install-hook")
    elif args.uninstall_hook:
        cmd.append("--uninstall-hook")
    elif args.file:
        cmd.extend(["--file", args.file])
    elif args.full:
        cmd.append("--full")
    else:
        cmd.append("--git")
    
    subprocess.run(cmd, check=False)

def main():
    parser = argparse.ArgumentParser(
        description="🎬 Video Editing Studio - Unified CLI with AE Cross-Folder Communication",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    subparsers = parser.add_subparsers(dest="command", help="Studio operation")

    # Status / Doctor / Projects
    subparsers.add_parser("status", help="Check studio tools, environment health, and AE projects")
    subparsers.add_parser("doctor", help="Check studio tools and environment health")
    subparsers.add_parser("projects", help="List all discovered AE project folders with renders and assets")

    # Sync to Google Drive
    sync_p = subparsers.add_parser("sync", help="Synchronize AE repository to Google Drive (git-aware delta or full)")
    sync_p.add_argument("--full", action="store_true", help="Perform full cache-assisted tree sync")
    sync_p.add_argument("--file", default=None, help="Sync a specific file relative to AE root")
    sync_p.add_argument("--install-hook", action="store_true", help="Install git pre-push hook for automatic sync on push")
    sync_p.add_argument("--uninstall-hook", action="store_true", help="Uninstall git pre-push hook")

    # Download (with AE delivery)
    dl_p = subparsers.add_parser("download", help="Download video/audio from URL using yt-dlp")
    dl_p.add_argument("url", help="Media URL")
    dl_p.add_argument("--audio", action="store_true", help="Audio only (MP3)")
    dl_p.add_argument("--format", default="mp3", choices=["mp3", "wav", "m4a"], help="Audio format")
    dl_p.add_argument("--res", default="1080", help="Max video resolution (e.g. 1080, 2160, best)")
    dl_p.add_argument("-o", "--output", default=None, help="Output directory")
    dl_p.add_argument("--to-project", default=None, help="Send downloaded media directly into this AE project (e.g. 'weather', 'space')")
    dl_p.add_argument("--import-ae", action="store_true", help="Import directly into active After Effects comp")

    # Transcribe (standalone or AE project)
    tr_p = subparsers.add_parser("transcribe", help="Transcribe video/audio using Whisper")
    tr_p.add_argument("input", nargs="?", default=None, help="Media file path")
    tr_p.add_argument("--project", default=None, help="Transcribe audio/video from this AE project")
    tr_p.add_argument("--model", default="base", choices=["tiny", "base", "small", "medium", "large", "turbo"], help="Whisper model")
    tr_p.add_argument("--lang", default=None, help="Language code")
    tr_p.add_argument("--device", default="cpu", choices=["cpu", "cuda"], help="Inference device")
    tr_p.add_argument("-o", "--output", default=None, help="Output directory")

    # Sync Markers to AE
    sm_p = subparsers.add_parser("sync-markers", help="Transcribe audio and apply speech cue markers to AE timeline")
    sm_p.add_argument("input", help="Audio/video file or transcript .json")
    sm_p.add_argument("--model", default="base", help="Whisper model")
    sm_p.add_argument("--prefix", default="🗣️ ", help="Marker text prefix")

    # AE Captions
    ac_p = subparsers.add_parser("ae-captions", help="Generate After Effects animated Text Layers from Whisper transcript")
    ac_p.add_argument("input", help="Audio/video file or transcript .json")
    ac_p.add_argument("--model", default="base", help="Whisper model")
    ac_p.add_argument("-o", "--output", default=None, help="Output JSX path")
    ac_p.add_argument("--apply", action="store_true", help="Apply directly to active AE comp via IPC bridge")

    # Process AE Render
    pr_p = subparsers.add_parser("process-render", help="Process an AE project's render (vertical reframe, burn subs, split)")
    pr_p.add_argument("project", help="AE project name or keyword (e.g. 'weather', 'space', 'motion')")
    pr_p.add_argument("--vertical", action="store_true", help="Convert to 9:16 vertical Reel/Short")
    pr_p.add_argument("--burn-subs", action="store_true", help="Transcribe and burn subtitles")
    pr_p.add_argument("--split", action="store_true", help="Detect scenes and split clips")

    # Send Media to AE
    sm_media = subparsers.add_parser("send-to-ae", help="Deliver media file into an AE project assets folder")
    sm_media.add_argument("input", help="Media file path")
    sm_media.add_argument("project", help="Target AE project name (e.g. 'weather', 'space')")
    sm_media.add_argument("--type", default="auto", choices=["auto", "footage", "audio", "images"], help="Target assets folder")
    sm_media.add_argument("--import-ae", action="store_true", help="Import into active AE comp")

    # Split
    sp_p = subparsers.add_parser("split", help="Detect scenes and cut raw video into clips")
    sp_p.add_argument("input", help="Raw video file path")
    sp_p.add_argument("--threshold", type=float, default=27.0, help="Cut threshold sensitivity")
    sp_p.add_argument("--min-len", type=float, default=1.0, help="Min scene duration in seconds")
    sp_p.add_argument("-o", "--output", default=None, help="Output directory")
    sp_p.add_argument("--no-thumbs", action="store_true", help="Skip thumbnail images")

    # Vertical
    vert_p = subparsers.add_parser("vertical", help="Convert 16:9 to vertical 9:16 Reel/Short")
    vert_p.add_argument("input", help="Input video")
    vert_p.add_argument("-o", "--output", default=None, help="Output path")

    # Burn subs
    bs_p = subparsers.add_parser("burn-subs", help="Burn subtitles (.srt) onto video")
    bs_p.add_argument("input", help="Video file")
    bs_p.add_argument("--srt", required=True, help="SRT subtitle file")
    bs_p.add_argument("--font-size", type=int, default=18, help="Subtitle font size")
    bs_p.add_argument("-o", "--output", default=None, help="Output path")

    # Trim
    trim_p = subparsers.add_parser("trim", help="Trim video segment")
    trim_p.add_argument("input", help="Input video")
    trim_p.add_argument("--start", required=True, help="Start time (HH:MM:SS or seconds)")
    trim_p.add_argument("--end", required=True, help="End time (HH:MM:SS or seconds)")
    trim_p.add_argument("-o", "--output", default=None, help="Output path")
    trim_p.add_argument("--reencode", action="store_true", help="Re-encode for frame-exact cut")

    # Concat
    cat_p = subparsers.add_parser("concat", help="Merge multiple video clips")
    cat_p.add_argument("inputs", nargs="+", help="Input video clips in sequence")
    cat_p.add_argument("-o", "--output", default=None, help="Output path")

    # Extract Audio
    ea_p = subparsers.add_parser("extract-audio", help="Extract audio track from video")
    ea_p.add_argument("input", help="Input video")
    ea_p.add_argument("--format", default="wav", choices=["wav", "mp3"], help="Audio format")
    ea_p.add_argument("-o", "--output", default=None, help="Output path")

    # Motion Init
    mi_p = subparsers.add_parser("motion-init", help="Initialize new HyperFrames motion graphics project")
    mi_p.add_argument("name", help="Project name (created in studio/hyperframes_projects/<name>)")
    mi_p.add_argument("--example", default="blank", help="Template example (e.g. blank, swiss-grid, warm-grain)")

    # Motion Preview
    mp_p = subparsers.add_parser("motion-preview", help="Preview HyperFrames motion graphics in browser")
    mp_p.add_argument("name", help="Project name in studio/hyperframes_projects/")

    # Motion Render
    mr_p = subparsers.add_parser("motion-render", help="Render HyperFrames motion graphics project to MP4")
    mr_p.add_argument("name", help="Project name in studio/hyperframes_projects/")
    mr_p.add_argument("-o", "--output", default=None, help="Output video path")
    mr_p.add_argument("--alpha", action="store_true", help="Render transparent WebM overlay")
    mr_p.add_argument("--to-project", default=None, help="Deliver render directly into this AE project (e.g. 'weather')")
    mr_p.add_argument("--import-ae", action="store_true", help="Import into active AE comp")

    # Remotion
    rem_list = subparsers.add_parser("remotion-list", help="List all registered Remotion React compositions")
    rem_list.add_argument("--entry", default=None, help="Path to Remotion entrypoint index.ts")

    rem_studio = subparsers.add_parser("remotion-studio", help="Open Remotion visual preview studio in browser")
    rem_studio.add_argument("--entry", default=None, help="Path to Remotion entrypoint index.ts")

    rem_render = subparsers.add_parser("remotion-render", help="Render a Remotion React composition to MP4 or ProRes MOV")
    rem_render.add_argument("composition", help="Composition ID (e.g. TitlePromo, LowerThird, VerticalPromo)")
    rem_render.add_argument("-o", "--output", default=None, help="Output file path")
    rem_render.add_argument("--prores", action="store_true", help="Render to Apple ProRes 4444 with alpha channel")
    rem_render.add_argument("--alpha", action="store_true", help="Render transparent WebM overlay")
    rem_render.add_argument("--entry", default=None, help="Path to Remotion entrypoint index.ts")
    rem_render.add_argument("--to-project", default=None, help="Send rendered video directly to this AE project (e.g. 'weather')")
    rem_render.add_argument("--import-ae", action="store_true", help="Import into active After Effects composition")

    # Kinetic Subs
    ks_p = subparsers.add_parser("kinetic-subs", help="Generate HyperFrames kinetic subtitle project from Whisper JSON")
    ks_p.add_argument("json", help="Path to Whisper transcript .json")
    ks_p.add_argument("-n", "--name", default=None, help="Project name")
    ks_p.add_argument("--width", type=int, default=1920, help="Width")
    ks_p.add_argument("--height", type=int, default=1080, help="Height")
    ks_p.add_argument("--color", default="#ffffff", help="Font color")
    ks_p.add_argument("--highlight", default="#fbbf24", help="Spoken word active highlight color")
    ks_p.add_argument("--opaque", action="store_true", help="Opaque background")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    dispatch = {
        "status": cmd_status,
        "doctor": cmd_status,
        "projects": cmd_projects,
        "sync": cmd_sync,
        "download": cmd_download,
        "transcribe": cmd_transcribe,
        "sync-markers": cmd_sync_markers,
        "ae-captions": cmd_ae_captions,
        "process-render": cmd_process_ae_render,
        "send-to-ae": cmd_send_media,
        "split": cmd_split,
        "vertical": cmd_vertical,
        "burn-subs": cmd_burn_subs,
        "trim": cmd_trim,
        "concat": cmd_concat,
        "extract-audio": cmd_extract_audio,
        "motion-init": cmd_motion_init,
        "motion-preview": cmd_motion_preview,
        "motion-render": cmd_motion_render,
        "kinetic-subs": cmd_kinetic_subs,
        "remotion-list": cmd_remotion_list,
        "remotion-studio": cmd_remotion_studio,
        "remotion-render": cmd_remotion_render,
    }

    dispatch[args.command](args)

if __name__ == "__main__":
    main()
