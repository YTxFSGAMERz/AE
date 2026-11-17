#!/usr/bin/env python3
"""
ae_integration.py
After Effects & Video Studio Cross-Folder Communication Engine.
Connects Whisper, yt-dlp, HyperFrames, and FFmpeg directly with AE project folders across the repository.
"""

import sys
import os
import json
import shutil
import subprocess
from pathlib import Path

# Add root and scripts to sys.path
STUDIO_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = STUDIO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

try:
    import ae_bridge
except ImportError:
    ae_bridge = None

def get_ae_root() -> Path:
    """Return the main parent AE repository folder."""
    return STUDIO_ROOT

def discover_ae_projects() -> dict:
    """
    Scans the main AE folder for all After Effects projects,
    cataloging their .aep files, renders, assets, and scripts.
    """
    root = get_ae_root()
    projects = {}

    ignored_dirs = {".git", ".agents", ".gemini", "node_modules", "studio", "remotion", "__pycache__", ".ipc"}

    for item in root.iterdir():
        if not item.is_dir() or item.name in ignored_dirs:
            continue

        aep_files = list(item.glob("*.aep")) + list(item.glob("**/*.aep"))
        mp4_files = list(item.glob("*.mp4")) + list(item.glob("**/*.mp4"))
        assets_dir = item / "assets"
        scripts_dir = item / "scripts"

        is_ae_project = (
            len(aep_files) > 0 or
            assets_dir.is_dir() or
            scripts_dir.is_dir() or
            "project" in item.name.lower() or
            "motion" in item.name.lower()
        )

        if is_ae_project:
            # Clean list of unique relative paths
            renders = [f for f in mp4_files if "test" not in f.name.lower() and ".temp" not in f.name.lower()]
            projects[item.name] = {
                "name": item.name,
                "path": str(item),
                "aep_files": [str(p) for p in aep_files],
                "renders": [str(p) for p in renders],
                "has_assets": assets_dir.is_dir(),
                "assets_path": str(assets_dir) if assets_dir.is_dir() else None,
                "scripts_path": str(scripts_dir) if scripts_dir.is_dir() else None
            }

    return projects

def resolve_project(query: str) -> dict:
    """Fuzzy match project by full name or shorthand keyword (e.g. 'weather', 'space')."""
    projects = discover_ae_projects()
    if query in projects:
        return projects[query]

    query_lower = query.lower()
    matches = []
    for name, data in projects.items():
        if query_lower in name.lower():
            matches.append(data)

    if len(matches) == 1:
        return matches[0]
    elif len(matches) > 1:
        # Exact word match preference
        for m in matches:
            if query_lower in m["name"].lower().split():
                return m
        return matches[0]

    raise ValueError(f"Could not find AE project matching '{query}'. Available: {list(projects.keys())}")

def send_media_to_ae_project(media_path: str, project_query: str, media_type: str = "auto", import_to_ae: bool = False) -> str:
    """
    Copies or moves media file (video/audio) directly into target AE project assets,
    and optionally imports it into active AE composition.
    """
    proj = resolve_project(project_query)
    proj_path = Path(proj["path"])
    media_file = Path(media_path).resolve()

    if not media_file.exists():
        raise FileNotFoundError(f"Source media not found: {media_file}")

    # Determine subfolder
    ext = media_file.suffix.lower()
    if media_type == "auto":
        is_audio = ext in [".mp3", ".wav", ".m4a", ".flac", ".aac"]
        folder_name = "audio" if is_audio else "footage"
    else:
        folder_name = media_type

    target_dir = proj_path / "assets" / folder_name
    target_dir.mkdir(parents=True, exist_ok=True)
    destination = target_dir / media_file.name

    shutil.copy2(str(media_file), str(destination))
    print(f"\n[AE Integration] Delivered media to: {destination}")

    if import_to_ae and ae_bridge and ae_bridge.is_ae_running():
        print(f"[AE Integration] Importing {destination.name} into active After Effects project...")
        escaped = str(destination).replace("\\", "\\\\")
        jsx = f"""(function() {{
            if (!app.project) return "No project open";
            var io = new ImportOptions(File("{escaped}"));
            if (io.canImportAs(ImportAsType.FOOTAGE)) {{
                var item = app.project.importFile(io);
                return "Imported: " + item.name;
            }}
            return "Could not import format";
        }})();"""
        res = ae_bridge.dispatch_command("eval", {"code": jsx, "undo_name": "Import Studio Media"})
        print(f"[AE Integration] AE Import Result: {res.get('result', res.get('error'))}")

    return str(destination)

def sync_speech_markers_to_ae(transcript_json_path: str, marker_prefix: str = "🗣️ ") -> int:
    """
    Reads Whisper transcript JSON and dispatches timeline markers into active After Effects composition.
    """
    t_file = Path(transcript_json_path).resolve()
    if not t_file.exists():
        raise FileNotFoundError(f"Transcript JSON not found: {t_file}")

    with open(t_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    segments = data.get("segments", [])
    if not segments:
        print("[AE Integration] No speech segments found in transcript.")
        return 0

    markers = []
    for s in segments:
        text = s.get("text", "").strip()
        start = s.get("start", 0.0)
        # Truncate text if long for marker label
        label = text if len(text) <= 35 else (text[:32] + "...")
        markers.append({"time": start, "comment": f"{marker_prefix}{label}"})

    print(f"[AE Integration] Prepared {len(markers)} speech cue markers from Whisper.")

    if not ae_bridge or not ae_bridge.is_ae_running():
        print("[AE Integration] Note: AfterFX.exe is not currently running. Generating JSX script instead.")
        out_jsx = t_file.parent / f"{t_file.stem}_apply_markers.jsx"
        jsx_code = f"""(function() {{
            if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {{
                alert("Please select an active composition.");
                return;
            }}
            var comp = app.project.activeItem;
            app.beginUndoGroup("Whisper Speech Markers");
            var markers = {json.dumps(markers)};
            for (var i = 0; i < markers.length; i++) {{
                var mv = new MarkerValue(markers[i].comment);
                comp.markerProperty.setValueAtTime(markers[i].time, mv);
            }}
            app.endUndoGroup();
            alert("Applied " + markers.length + " speech markers.");
        }})();"""
        out_jsx.write_text(jsx_code, encoding="utf-8")
        print(f"[AE Integration] Saved JSX marker script: {out_jsx}")
        return len(markers)

    # Apply directly via AE Bridge
    jsx_code = f"""(function() {{
        if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {{
            return "Error: No active composition found.";
        }}
        var comp = app.project.activeItem;
        app.beginUndoGroup("Whisper Speech Markers");
        var markers = {json.dumps(markers)};
        for (var i = 0; i < markers.length; i++) {{
            var mv = new MarkerValue(markers[i].comment);
            comp.markerProperty.setValueAtTime(markers[i].time, mv);
        }}
        app.endUndoGroup();
        return "Applied " + markers.length + " speech markers to " + comp.name;
    }})();"""

    res = ae_bridge.dispatch_command("eval", {"code": jsx_code, "undo_name": "Whisper Speech Markers"})
    print(f"[AE Integration] Result: {res.get('result', res.get('error'))}")
    return len(markers)

def create_ae_caption_layers_script(transcript_json_path: str, output_jsx_path: str = None) -> str:
    """
    Generates an ExtendScript JSX file that creates animated, timed After Effects Text Layers
    for each Whisper speech segment.
    """
    t_file = Path(transcript_json_path).resolve()
    with open(t_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    segments = data.get("segments", [])
    if output_jsx_path is None:
        out_jsx = t_file.parent / f"{t_file.stem}_create_ae_captions.jsx"
    else:
        out_jsx = Path(output_jsx_path).resolve()

    items = []
    for s in segments:
        items.append({
            "start": s.get("start", 0.0),
            "end": s.get("end", 0.0),
            "text": s.get("text", "").strip()
        })

    jsx_content = f"""// Generated by Antigravity Video Studio - Whisper to After Effects
(function() {{
    if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {{
        alert("Please open and select a composition first.");
        return;
    }}

    var comp = app.project.activeItem;
    app.beginUndoGroup("Create Whisper Captions");

    var segs = {json.dumps(items)};

    // Create a dedicated Null parent for all caption layers
    var captionGroup = comp.layers.addNull();
    captionGroup.name = "--- CAPTIONS GROUP ---";
    captionGroup.startTime = 0;
    captionGroup.outPoint = comp.duration;

    for (var i = 0; i < segs.length; i++) {{
        var seg = segs[i];
        if (!seg.text) continue;

        var textLayer = comp.layers.addText(seg.text);
        textLayer.name = "Sub: " + (seg.text.length > 25 ? seg.text.substring(0, 22) + "..." : seg.text);
        textLayer.startTime = seg.start;
        textLayer.inPoint = seg.start;
        textLayer.outPoint = seg.end;

        // Position text centered near bottom
        var pos = textLayer.property("ADBE Transform Group").property("ADBE Position");
        pos.setValue([comp.width / 2, comp.height * 0.88]);

        // Style text
        var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
        var textDoc = textProp.value;
        textDoc.fontSize = Math.round(comp.height * 0.045);
        textDoc.fillColor = [1, 1, 1];
        textDoc.strokeColor = [0, 0, 0];
        textDoc.applyStroke = true;
        textDoc.strokeWidth = 3;
        textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
        textProp.setValue(textDoc);

        // Subtle scale pop entrance
        var scale = textLayer.property("ADBE Transform Group").property("ADBE Scale");
        scale.setValueAtTime(seg.start, [90, 90]);
        scale.setValueAtTime(seg.start + 0.15, [100, 100]);

        // Opacity fade in/out
        var opacity = textLayer.property("ADBE Transform Group").property("ADBE Opacity");
        opacity.setValueAtTime(seg.start, 0);
        opacity.setValueAtTime(seg.start + 0.1, 100);
        opacity.setValueAtTime(Math.max(seg.start + 0.1, seg.end - 0.1), 100);
        opacity.setValueAtTime(seg.end, 0);

        textLayer.parent = captionGroup;
    }}

    app.endUndoGroup();
    alert("Created " + segs.length + " caption layers in '" + comp.name + "'!");
}})();
"""
    out_jsx.write_text(jsx_content, encoding="utf-8")
    print(f"[AE Integration] Created After Effects captions script: {out_jsx}")
    return str(out_jsx)
