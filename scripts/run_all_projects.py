#!/usr/bin/env python3
"""
run_all_projects.py
Launches After Effects and runs all three project build scripts sequentially.
Usage: python run_all_projects.py
"""
import subprocess, os, sys, time

AE_PATH = r"C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\AfterFX.exe"
AERENDER = r"C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\aerender.exe"
BASE = r"c:\Users\Admin\Documents\GitHub\AE"

SCRIPTS = [
    r"Project City Life An Animated Motion Scene\scripts\build_project.jsx",
    r"Project Future Voyage A Motion Design Story in After Effects\scripts\build_project.jsx",
    r"Project The Journey of a Memory A Motion Story in After Effects\scripts\build_project.jsx",
]

def run_via_afterfx(jsx_path):
    """Run a JSX script headlessly via AfterFX -noui -s."""
    escaped_path = os.path.abspath(jsx_path).replace("\\", "/")
    code = f"try {{ $.evalFile('{escaped_path}'); }} catch(e) {{ alert(e); }} app.quit();"
    cmd = [AE_PATH, "-noui", "-s", code]
    print(f"\n▶ Running: {os.path.basename(jsx_path)}")
    print(f"  Command: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        print(f"  stderr: {result.stderr[:500]}")
    return result.returncode == 0

def run_via_bridge(jsx_path):
    """Run via ae_bridge.py IPC if AE is running."""
    bridge = os.path.join(BASE, "scripts", "ae_bridge.py")
    cmd = [sys.executable, bridge, "run_file", "--file", jsx_path]
    print(f"\n▶ Bridge: {os.path.basename(jsx_path)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    print(f"  stdout: {result.stdout[:500]}")
    return result.returncode == 0

if __name__ == "__main__":
    print("=" * 60)
    print("AE Project Builder – All 3 Projects")
    print("=" * 60)
    
    mode = sys.argv[1] if len(sys.argv) > 1 else "aerender"
    
    for script in SCRIPTS:
        full_path = os.path.join(BASE, script)
        if not os.path.exists(full_path):
            print(f"  ✗ Script not found: {full_path}")
            continue
        
        ok = False
        if mode == "bridge":
            ok = run_via_bridge(full_path)
        else:
            ok = run_via_afterfx(full_path)
        
        status = "✓ Done" if ok else "✗ Failed (check AE for errors)"
        print(f"  {status}: {os.path.basename(os.path.dirname(script))}")
        time.sleep(2)
    
    print("\n" + "=" * 60)
    print("All scripts dispatched. Open After Effects to review.")
    print("Run render queue in AE, or use:")
    print("  aerender.exe -project <aep> -comp MASTER_* -output <mp4>")
    print("=" * 60)
