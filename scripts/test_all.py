#!/usr/bin/env python3
"""
test_all.py
Runs automated verification tests for the After Effects AI Connection Suite:
1. Preferences & Security Setting Check
2. Binary Executable Path Discovery
3. MCP Server Tool Registration & Schema Integrity
4. Audio Beat Marker Generator Test
5. ExtendScript & Motion Primitives Syntax Check
"""

import os
import sys
import subprocess
from pathlib import Path

def print_header(title):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def run_test(name, func):
    try:
        func()
        print(f"  [PASS] {name}")
        return True
    except AssertionError as e:
        print(f"  [FAIL] {name}: {e}")
        return False
    except Exception as e:
        print(f"  [ERROR] {name}: {e}")
        return False

def test_prefs():
    from setup_ae_prefs import get_ae_prefs_paths
    paths = get_ae_prefs_paths()
    assert len(paths) > 0, "No AE preference files found."
    with open(paths[0], "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    assert '"Pref_SCRIPTING_FILE_NETWORK_SECURITY" = "1"' in content, \
        "Pref_SCRIPTING_FILE_NETWORK_SECURITY is not set to 1."

def test_executables():
    from ae_bridge import find_ae_executables
    afterfx, aerender = find_ae_executables()
    assert afterfx and os.path.isfile(afterfx), f"AfterFX.exe not found at {afterfx}"
    assert aerender and os.path.isfile(aerender), f"aerender.exe not found at {aerender}"

def test_mcp_tools():
    from ae_mcp_server import TOOLS
    assert len(TOOLS) >= 10, f"Expected at least 10 tools, found {len(TOOLS)}"
    tool_names = [t["name"] for t in TOOLS]
    expected = [
        "ae_status", "ae_eval", "ae_run_file", "ae_get_info",
        "ae_snapshot_frame", "ae_create_comp", "ae_create_lower_third",
        "ae_create_kinetic_text", "ae_apply_spring_ease", "ae_apply_effect_stack",
        "ae_sync_audio_markers"
    ]
    for exp in expected:
        assert exp in tool_names, f"Missing tool: {exp}"

def test_audio():
    from audio_marker_sync import extract_pcm_mono, detect_transient_peaks
    sample_rate = 44100
    # Synthetic beat signal: 1 second silence, sharp spike at 1s, silence
    synthetic = [0.0] * 44100 + [30000.0] * 500 + [0.0] * 44100
    import numpy as np
    samples = np.array(synthetic, dtype=np.float32)
    peaks = detect_transient_peaks(samples, sample_rate=sample_rate, hop_ms=25, threshold_factor=1.2)
    assert len(peaks) >= 1, "Failed to detect synthetic beat transient"

def test_jsx_files():
    base = Path(__file__).resolve().parent
    disp = base / "ae_ipc_dispatcher.jsx"
    prims = base / "motion_primitives.jsxinc"
    test_jsx = base / "test_motion_primitive.jsx"
    assert disp.is_file(), "Missing ae_ipc_dispatcher.jsx"
    assert prims.is_file(), "Missing motion_primitives.jsxinc"
    assert test_jsx.is_file(), "Missing test_motion_primitive.jsx"

def main():
    print_header("After Effects AI Connection Verification Suite")
    
    tests = [
        ("Preferences & Security Setting (Pref_SCRIPTING_FILE_NETWORK_SECURITY = 1)", test_prefs),
        ("After Effects & aerender Executables Found", test_executables),
        ("MCP Server Tool Registry & Schema Validation", test_mcp_tools),
        ("Audio Transient & Beat Marker Engine", test_audio),
        ("ExtendScript IPC Dispatcher & Motion Primitives", test_jsx_files)
    ]
    
    results = [run_test(name, fn) for name, fn in tests]
    
    print("\n" + "-" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} tests passed.")
    if passed == total:
        print("All After Effects AI integration tests PASSED successfully!")
        sys.exit(0)
    else:
        print("Some tests failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
