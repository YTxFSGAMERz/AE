#!/usr/bin/env python3
"""
ae_mcp_server.py
Model Context Protocol (MCP) Server for Adobe After Effects.
Communicates via JSON-RPC 2.0 over standard I/O (stdio).
"""

import os
import sys
import json
from pathlib import Path

# Add script dir to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from ae_bridge import dispatch_command, find_ae_executables, is_ae_running, cmd_render
from audio_marker_sync import extract_pcm_mono, detect_transient_peaks, generate_extendscript

# -----------------------------------------------------------------------------
# Tool Definitions
# -----------------------------------------------------------------------------
TOOLS = [
    {
        "name": "ae_status",
        "description": "Check Adobe After Effects installation, running status, and scripting security configuration.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "ae_eval",
        "description": "Evaluate arbitrary ExtendScript (JSX) code in the active After Effects session.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "ExtendScript JavaScript code to execute."
                },
                "undo_name": {
                    "type": "string",
                    "description": "Optional name for single-click Ctrl+Z undo group."
                },
                "auto_launch": {
                    "type": "boolean",
                    "description": "Whether to launch After Effects if it is closed (default: false)."
                }
            },
            "required": ["code"]
        }
    },
    {
        "name": "ae_run_file",
        "description": "Execute an existing ExtendScript (.jsx) file in After Effects.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Absolute or workspace-relative path to .jsx file."
                },
                "undo_name": {
                    "type": "string",
                    "description": "Optional name for undo group."
                }
            },
            "required": ["path"]
        }
    },
    {
        "name": "ae_get_info",
        "description": "Inspect the open After Effects project and active composition details, including layer names and IDs.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "ae_snapshot_frame",
        "description": "The Vision Loop tool: captures a PNG snapshot of the active composition at the current or specified timecode for AI visual inspection.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "output_path": {
                    "type": "string",
                    "description": "File path where the PNG snapshot should be saved."
                },
                "time": {
                    "type": "number",
                    "description": "Timecode in seconds (optional, defaults to current playhead)."
                }
            },
            "required": ["output_path"]
        }
    },
    {
        "name": "ae_create_comp",
        "description": "Create a new composition in After Effects.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Composition name"},
                "width": {"type": "integer", "description": "Width in pixels (default: 1920)"},
                "height": {"type": "integer", "description": "Height in pixels (default: 1080)"},
                "duration": {"type": "number", "description": "Duration in seconds (default: 10.0)"},
                "fps": {"type": "number", "description": "Frame rate in fps (default: 30.0)"}
            },
            "required": ["name"]
        }
    },
    {
        "name": "ae_create_lower_third",
        "description": "Generate an animated, auto-responsive lower-third graphic with auto-sizing background boxes via sourceRectAtTime().",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Primary name or headline text"},
                "title": {"type": "string", "description": "Secondary title or subtext"},
                "start_time": {"type": "number", "description": "Start time in seconds (default: 0.0)"},
                "duration": {"type": "number", "description": "Duration in seconds (default: 5.0)"},
                "x": {"type": "number", "description": "X position (default: 160)"},
                "y": {"type": "number", "description": "Y position (default: 900)"}
            },
            "required": ["name", "title"]
        }
    },
    {
        "name": "ae_create_kinetic_text",
        "description": "Generate kinetic typography with built-in text animators (Typewriter or Cascade Slide).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Text content"},
                "style": {"type": "string", "enum": ["typewriter", "cascade"], "description": "Animation style (default: typewriter)"},
                "font_size": {"type": "number", "description": "Font size (default: 64)"},
                "start_time": {"type": "number", "description": "Start time in seconds (default: 0.0)"}
            },
            "required": ["text"]
        }
    },
    {
        "name": "ae_apply_spring_ease",
        "description": "Apply snappy, bouncy, gentle, or overshoot temporal ease curves to layer keyframes.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "layer_index": {"type": "integer", "description": "Layer index (1-based)"},
                "property_match_name": {"type": "string", "description": "Property match name, e.g. ADBE Position or ADBE Scale"},
                "curve": {"type": "string", "enum": ["SNAPPY", "CINEMATIC", "GENTLE", "OVERSHOOT"], "description": "Easing preset curve"}
            },
            "required": ["layer_index", "property_match_name", "curve"]
        }
    },
    {
        "name": "ae_apply_effect_stack",
        "description": "Apply stylized effect presets (neon_glow, film_grain) to a target layer.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "layer_index": {"type": "integer", "description": "Layer index in active comp"},
                "stack": {"type": "string", "enum": ["neon_glow", "film_grain"], "description": "Effect stack preset name"}
            },
            "required": ["layer_index", "stack"]
        }
    },
    {
        "name": "ae_sync_audio_markers",
        "description": "Detect rhythmic transient beats in an audio file and automatically create timeline markers in the active AE comp.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "audio_path": {"type": "string", "description": "Path to audio file (mp3, wav)"},
                "threshold": {"type": "number", "description": "Sensitivity multiplier (default: 1.35)"},
                "min_distance": {"type": "number", "description": "Minimum distance between beats in seconds (default: 0.25)"}
            },
            "required": ["audio_path"]
        }
    }
]

# -----------------------------------------------------------------------------
# Tool Dispatch Handlers
# -----------------------------------------------------------------------------
def handle_tool_call(name, args):
    if name == "ae_status":
        afterfx, aerender = find_ae_executables()
        running = is_ae_running()
        return {
            "installed": afterfx is not None,
            "afterfx_path": afterfx,
            "aerender_path": aerender,
            "is_running": running
        }

    elif name == "ae_eval":
        code = args.get("code", "")
        undo = args.get("undo_name", "Antigravity AI Eval")
        launch = args.get("auto_launch", False)
        return dispatch_command("eval", {"code": code, "undo_name": undo}, auto_launch=launch)

    elif name == "ae_run_file":
        path = os.path.abspath(args.get("path", ""))
        undo = args.get("undo_name", f"Run {os.path.basename(path)}")
        return dispatch_command("run_file", {"file": path, "undo_name": undo})

    elif name == "ae_get_info":
        return dispatch_command("project_info", {})

    elif name == "ae_snapshot_frame":
        out_path = os.path.abspath(args.get("output_path", ""))
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        return dispatch_command("snapshot", {"output_path": out_path, "time": args.get("time")})

    elif name == "ae_create_comp":
        c_name = args.get("name", "New Comp")
        w = args.get("width", 1920)
        h = args.get("height", 1080)
        dur = args.get("duration", 10.0)
        fps = args.get("fps", 30.0)
        code = f"""
        (function() {{
            var p = app.project || app.newProject();
            var comp = p.items.addComp("{c_name}", {w}, {h}, 1.0, {dur}, {fps});
            return {{ id: comp.id, name: comp.name, width: comp.width, height: comp.height }};
        }})();
        """
        return dispatch_command("eval", {"code": code, "undo_name": f"Create Comp {c_name}"})

    elif name == "ae_create_lower_third":
        opts_json = json.dumps(args)
        code = f"""
        (function() {{
            if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {{
                throw new Error("No active composition found");
            }}
            var comp = app.project.activeItem;
            return MotionPrimitives.createResponsiveLowerThird(comp, {opts_json});
        }})();
        """
        return dispatch_command("eval", {"code": code, "undo_name": "Create Lower Third"})

    elif name == "ae_create_kinetic_text":
        opts_json = json.dumps(args)
        code = f"""
        (function() {{
            if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {{
                throw new Error("No active composition found");
            }}
            var comp = app.project.activeItem;
            return MotionPrimitives.createKineticText(comp, {opts_json});
        }})();
        """
        return dispatch_command("eval", {"code": code, "undo_name": "Create Kinetic Text"})

    elif name == "ae_apply_spring_ease":
        idx = args.get("layer_index", 1)
        match_name = args.get("property_match_name", "ADBE Position")
        curve = args.get("curve", "SNAPPY")
        code = f"""
        (function() {{
            if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {{
                throw new Error("No active composition found");
            }}
            var comp = app.project.activeItem;
            var layer = comp.layer({idx});
            var prop = layer.property("ADBE Transform Group").property("{match_name}") || layer.property("{match_name}");
            return MotionPrimitives.applyEase(prop, "{curve}");
        }})();
        """
        return dispatch_command("eval", {"code": code, "undo_name": f"Apply Spring Ease {curve}"})

    elif name == "ae_apply_effect_stack":
        idx = args.get("layer_index", 1)
        stack = args.get("stack", "neon_glow")
        code = f"""
        (function() {{
            if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {{
                throw new Error("No active composition found");
            }}
            var comp = app.project.activeItem;
            var layer = comp.layer({idx});
            return MotionPrimitives.applyEffectStack(layer, "{stack}");
        }})();
        """
        return dispatch_command("eval", {"code": code, "undo_name": f"Apply Effect {stack}"})

    elif name == "ae_sync_audio_markers":
        audio_path = os.path.abspath(args.get("audio_path", ""))
        threshold = args.get("threshold", 1.35)
        min_dist = args.get("min_distance", 0.25)
        samples, sr = extract_pcm_mono(audio_path)
        peaks = detect_transient_peaks(samples, sample_rate=sr, threshold_factor=threshold, min_distance_s=min_dist)
        jsx_code = generate_extendscript(peaks)
        return dispatch_command("eval", {"code": jsx_code, "undo_name": "Sync Audio Markers"})

    else:
        return {"status": "error", "error": f"Unknown tool name: {name}"}

# -----------------------------------------------------------------------------
# JSON-RPC Server Loop
# -----------------------------------------------------------------------------
def run_stdio_server():
    """Runs standard input/output JSON-RPC 2.0 loop."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue

        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        if method == "initialize":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {
                        "name": "after-effects-mcp",
                        "version": "1.0.0"
                    }
                }
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "notifications/initialized":
            pass

        elif method == "tools/list":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": TOOLS
                }
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            try:
                result_obj = handle_tool_call(tool_name, tool_args)
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps(result_obj, indent=2)
                            }
                        ]
                    }
                }
            except Exception as ex:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps({"status": "error", "error": str(ex)})
                            }
                        ],
                        "isError": True
                    }
                }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "ping":
            resp = {"jsonrpc": "2.0", "id": req_id, "result": {}}
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

def main():
    if "--test-tools" in sys.argv:
        print(f"AE MCP Server loaded successfully with {len(TOOLS)} tools registered:")
        for t in TOOLS:
            print(f"  - {t['name']}: {t['description']}")
        return

    run_stdio_server()

if __name__ == "__main__":
    main()
