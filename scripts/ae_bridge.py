#!/usr/bin/env python3
"""
ae_bridge.py
Command-Line Bridge & Automation Orchestrator for Adobe After Effects.

Features:
- Discovers After Effects 2026 / 2025 / 2024 installations automatically.
- Dispatches ExtendScript commands into the running AE instance via native OS IPC (AfterFX.exe -r).
- Employs a file mailbox IPC protocol in %TEMP%/antigravity-ae-ipc for zero-install, panel-free operation.
- Supports eval, run-file, status, project inspection, frame snapshots, and aerender batch execution.
"""

import os
import sys
import json
import time
import uuid
import tempfile
import subprocess
import argparse
from pathlib import Path

DEFAULT_AE_PATHS = [
    r"C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\AfterFX.exe",
    r"C:\Program Files\Adobe\Adobe After Effects 2025\Support Files\AfterFX.exe",
    r"C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\AfterFX.exe",
]

def find_ae_executables():
    """Locate AfterFX.exe and aerender.exe on the system."""
    afterfx = None
    for p in DEFAULT_AE_PATHS:
        if os.path.isfile(p):
            afterfx = p
            break
            
    if not afterfx:
        # Dynamic search under Program Files\Adobe
        adobe_root = r"C:\Program Files\Adobe"
        if os.path.isdir(adobe_root):
            for entry in sorted(os.listdir(adobe_root), reverse=True):
                if "After Effects" in entry:
                    candidate = os.path.join(adobe_root, entry, "Support Files", "AfterFX.exe")
                    if os.path.isfile(candidate):
                        afterfx = candidate
                        break
                        
    aerender = None
    if afterfx:
        candidate_aerender = os.path.join(os.path.dirname(afterfx), "aerender.exe")
        if os.path.isfile(candidate_aerender):
            aerender = candidate_aerender
            
    return afterfx, aerender

def is_ae_running():
    """Check whether AfterFX.exe is currently running in Windows process table."""
    try:
        output = subprocess.check_output(
            ["tasklist", "/FI", "IMAGENAME eq AfterFX.exe", "/FO", "CSV", "/NH"],
            stderr=subprocess.DEVNULL,
            text=True
        )
        return "AfterFX" in output
    except Exception:
        return False

def get_dispatcher_path():
    """Locate the ae_ipc_dispatcher.jsx file."""
    base_dir = Path(__file__).resolve().parent
    dispatcher = base_dir / "ae_ipc_dispatcher.jsx"
    if not dispatcher.is_file():
        raise FileNotFoundError(f"Dispatcher script not found at {dispatcher}")
    return str(dispatcher)

def get_mailbox_dir():
    """Returns the IPC mailbox directory inside scripts/.ipc."""
    base_dir = Path(__file__).resolve().parent
    mailbox = base_dir / ".ipc"
    mailbox.mkdir(parents=True, exist_ok=True)
    return mailbox

def dispatch_command(action, payload, timeout=30.0, auto_launch=False):
    """
    Dispatches a command payload to After Effects via mailbox IPC and AfterFX.exe -r.
    """
    afterfx, _ = find_ae_executables()
    if not afterfx:
        return {
            "status": "error",
            "error": "Adobe After Effects executable (AfterFX.exe) not found on system."
        }

    running = is_ae_running()
    if not running:
        if not auto_launch:
            return {
                "status": "error",
                "error": "After Effects is not currently running. Pass --launch to start it automatically."
            }
        else:
            print("[ae_bridge] Spawning After Effects process...")
            subprocess.Popen([afterfx], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            # Wait for startup
            print("[ae_bridge] Waiting for After Effects to initialize...")
            for _ in range(40):
                time.sleep(1.0)
                if is_ae_running():
                    break
            time.sleep(4.0)

    mailbox = get_mailbox_dir()
    req_id = f"req_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    request_data = {
        "id": req_id,
        "action": action,
        **payload
    }

    req_file = mailbox / f"request_{req_id}.json"
    resp_file = mailbox / f"response_{req_id}.json"
    pointer_file = mailbox / "current_request.txt"

    # Write request
    with open(req_file, "w", encoding="utf-8") as f:
        json.dump(request_data, f)

    # Point current_request.txt to this request
    with open(pointer_file, "w", encoding="utf-8") as f:
        f.write(req_file.name)

    # Trigger dispatcher via AfterFX.exe -r
    dispatcher_path = get_dispatcher_path()
    try:
        subprocess.run(
            [afterfx, "-r", dispatcher_path],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        return {"status": "error", "error": f"Failed to execute AfterFX.exe: {e}"}

    # Poll for response
    start_time = time.time()
    while time.time() - start_time < timeout:
        if resp_file.is_file():
            # Wait briefly to ensure file write is finished
            time.sleep(0.05)
            try:
                with open(resp_file, "r", encoding="utf-8") as f:
                    resp_data = json.load(f)
                # Cleanup
                try:
                    req_file.unlink(missing_ok=True)
                    resp_file.unlink(missing_ok=True)
                except Exception:
                    pass
                return resp_data
            except Exception:
                time.sleep(0.1)
                continue
        time.sleep(0.15)

    return {
        "status": "error",
        "error": f"Command timed out after {timeout} seconds waiting for AE response."
    }

# -----------------------------------------------------------------------------
# CLI Commands
# -----------------------------------------------------------------------------
def cmd_status(args):
    afterfx, aerender = find_ae_executables()
    running = is_ae_running()
    
    # Check prefs security
    from setup_ae_prefs import get_ae_prefs_paths
    prefs = get_ae_prefs_paths()
    security_enabled = False
    if prefs:
        try:
            with open(prefs[0], "r", encoding="utf-8", errors="replace") as f:
                if '"Pref_SCRIPTING_FILE_NETWORK_SECURITY" = "1"' in f.read():
                    security_enabled = True
        except Exception:
            pass

    status_data = {
        "installed": afterfx is not None,
        "afterfx_path": afterfx,
        "aerender_path": aerender,
        "is_running": running,
        "scripting_security_enabled": security_enabled,
        "mailbox_dir": str(get_mailbox_dir())
    }

    if args.json:
        print(json.dumps(status_data, indent=2))
    else:
        print("=== Adobe After Effects Bridge Status ===")
        print(f"Installed:            {status_data['installed']}")
        print(f"AfterFX Executable:   {afterfx or 'Not found'}")
        print(f"aerender Executable:  {aerender or 'Not found'}")
        print(f"Process Running:      {'YES (Active)' if running else 'NO (Stopped)'}")
        print(f"Script File/Network:  {'ENABLED (Ready)' if security_enabled else 'DISABLED (Run setup_ae_prefs.py)'}")
        print(f"IPC Mailbox:          {status_data['mailbox_dir']}")

def cmd_launch(args):
    afterfx, _ = find_ae_executables()
    if not afterfx:
        print("Error: AfterFX.exe not found on system.", file=sys.stderr)
        sys.exit(1)
    if is_ae_running():
        print("After Effects is already running.")
        return
    print(f"Launching After Effects from {afterfx}...")
    subprocess.Popen([afterfx])
    print("Process started.")

def cmd_eval(args):
    code = args.code
    res = dispatch_command(
        "eval",
        {"code": code, "undo_name": args.undo or "Antigravity Eval"},
        timeout=args.timeout,
        auto_launch=args.launch
    )
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        if res.get("status") == "success":
            print(res.get("result"))
        else:
            print(f"Error: {res.get('error')}", file=sys.stderr)
            sys.exit(1)

def cmd_run(args):
    script_path = os.path.abspath(args.script)
    if not os.path.isfile(script_path):
        print(f"Error: Script file not found: {script_path}", file=sys.stderr)
        sys.exit(1)
    res = dispatch_command(
        "run_file",
        {"file": script_path, "undo_name": args.undo or f"Run {os.path.basename(script_path)}"},
        timeout=args.timeout,
        auto_launch=args.launch
    )
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        if res.get("status") == "success":
            print(f"Script executed successfully ({res.get('execution_time_ms', 0)}ms).")
            if res.get("result") is not None:
                print(res.get("result"))
        else:
            print(f"Script execution error: {res.get('error')}", file=sys.stderr)
            sys.exit(1)

def cmd_info(args):
    res = dispatch_command(
        "project_info",
        {},
        timeout=args.timeout,
        auto_launch=args.launch
    )
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        if res.get("status") == "success":
            p = res.get("result", {})
            print("=== Active Project Info ===")
            print(f"File:         {p.get('projectFile', 'None')}")
            print(f"Total Items:  {p.get('numItems', 0)}")
            comp = p.get("activeComp")
            if comp:
                print("\n=== Active Composition ===")
                print(f"Name:       {comp.get('name')}")
                print(f"Dimensions: {comp.get('width')}x{comp.get('height')}")
                print(f"Duration:   {comp.get('duration')}s ({comp.get('frameRate')} fps)")
                print(f"Layers:     {comp.get('numLayers')}")
                for layer in comp.get("layers", []):
                    flags = []
                    if layer.get("nullLayer"): flags.append("null")
                    if layer.get("locked"): flags.append("locked")
                    flag_str = f" [{', '.join(flags)}]" if flags else ""
                    print(f"  #{layer.get('index')} {layer.get('name')}{flag_str}")
            else:
                print("No composition currently open or active.")
        else:
            print(f"Error: {res.get('error')}", file=sys.stderr)
            sys.exit(1)

def cmd_snapshot(args):
    output_path = os.path.abspath(args.output)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    res = dispatch_command(
        "snapshot",
        {"output_path": output_path, "time": args.time},
        timeout=args.timeout,
        auto_launch=args.launch
    )
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        if res.get("status") == "success":
            print(f"Snapshot saved: {output_path}")
        else:
            print(f"Snapshot error: {res.get('error')}", file=sys.stderr)
            sys.exit(1)

def cmd_render(args):
    _, aerender = find_ae_executables()
    if not aerender:
        print("Error: aerender.exe not found.", file=sys.stderr)
        sys.exit(1)

    cmd = [aerender, "-project", os.path.abspath(args.project)]
    if args.comp:
        cmd.extend(["-comp", args.comp])
    if args.output:
        cmd.extend(["-output", os.path.abspath(args.output)])
    if args.rqindex:
        cmd.extend(["-rqindex", str(args.rqindex)])

    print(f"Running aerender: {' '.join(cmd)}")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in iter(proc.stdout.readline, ''):
        print(line, end='')
    proc.wait()
    sys.exit(proc.returncode)

def main():
    parser = argparse.ArgumentParser(description="Antigravity Adobe After Effects Bridge")
    subparsers = parser.add_subparsers(dest="subcommand", required=True)

    # status
    p_status = subparsers.add_parser("status", help="Check AE connection and status")
    p_status.add_argument("--json", action="store_true", help="Output as JSON")
    p_status.set_defaults(func=cmd_status)

    # launch
    p_launch = subparsers.add_parser("launch", help="Start After Effects process")
    p_launch.set_defaults(func=cmd_launch)

    # eval
    p_eval = subparsers.add_parser("eval", help="Evaluate ExtendScript snippet")
    p_eval.add_argument("code", help="ExtendScript code to evaluate")
    p_eval.add_argument("--undo", help="Undo group name")
    p_eval.add_argument("--launch", action="store_true", help="Auto-launch AE if closed")
    p_eval.add_argument("--timeout", type=float, default=25.0, help="Timeout in seconds")
    p_eval.add_argument("--json", action="store_true", help="Output as JSON")
    p_eval.set_defaults(func=cmd_eval)

    # run
    p_run = subparsers.add_parser("run", help="Run a JSX script file in AE")
    p_run.add_argument("script", help="Path to .jsx script file")
    p_run.add_argument("--undo", help="Undo group name")
    p_run.add_argument("--launch", action="store_true", help="Auto-launch AE if closed")
    p_run.add_argument("--timeout", type=float, default=30.0, help="Timeout in seconds")
    p_run.add_argument("--json", action="store_true", help="Output as JSON")
    p_run.set_defaults(func=cmd_run)

    # info
    p_info = subparsers.add_parser("info", help="Inspect current project & active comp")
    p_info.add_argument("--launch", action="store_true", help="Auto-launch AE if closed")
    p_info.add_argument("--timeout", type=float, default=25.0, help="Timeout in seconds")
    p_info.add_argument("--json", action="store_true", help="Output as JSON")
    p_info.set_defaults(func=cmd_info)

    # snapshot
    p_snap = subparsers.add_parser("snapshot", help="Capture a composition frame as PNG")
    p_snap.add_argument("output", help="Output PNG path")
    p_snap.add_argument("--time", type=float, help="Timecode in seconds (default: current playhead)")
    p_snap.add_argument("--launch", action="store_true", help="Auto-launch AE if closed")
    p_snap.add_argument("--timeout", type=float, default=25.0, help="Timeout in seconds")
    p_snap.add_argument("--json", action="store_true", help="Output as JSON")
    p_snap.set_defaults(func=cmd_snapshot)

    # render
    p_render = subparsers.add_parser("render", help="Batch render via aerender.exe")
    p_render.add_argument("project", help="Path to .aep project file")
    p_render.add_argument("--comp", help="Composition name")
    p_render.add_argument("--output", help="Output movie file path")
    p_render.add_argument("--rqindex", type=int, help="Render queue index")
    p_render.set_defaults(func=cmd_render)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
