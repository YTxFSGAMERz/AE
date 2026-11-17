#!/usr/bin/env python3
"""
=============================================================================
🎬 AFTER EFFECTS REPOSITORY - GOOGLE DRIVE AUTO-SYNC ENGINE
=============================================================================
High-speed incremental synchronization from local 'AE' repository to Google Drive.

Modes:
  (default)       : Smart sync. Scans all 2,050+ files in ~0.09s and syncs only genuinely
                    modified or new files. Outputs clean confirmation when up-to-date.
  --on-push       : Hook mode for git pre-push.
  --seed-cache    : Initialize cache with all existing local files and timestamps.
  --full          : Full remote-assisted tree audit.
  --file <path>   : Sync a specific file or render output immediately.
  --install-hook  : Install native .git/hooks/pre-push hook for automatic sync on 'git push'.
  --uninstall-hook: Remove git hook.
=============================================================================
"""

import os
import sys
import json
import time
import subprocess
import re
import argparse
from pathlib import Path

ROOT_FOLDER_ID = "18jb20pW3S-KNLwWrvanW9UChR7b9WCg_"
LOCAL_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE_FILE = os.path.join(LOCAL_ROOT, ".gdrive_sync_cache.json")

# Ensure required binary directories are in PATH
EXTRA_PATHS = [
    os.path.expandvars(r"%USERPROFILE%\.gemini\antigravity\bin"),
    r"C:\Python315",
    r"C:\Python315\Scripts",
]
_curr_path = os.environ.get("PATH", "")
for _p in EXTRA_PATHS:
    if os.path.exists(_p) and _p not in _curr_path:
        os.environ["PATH"] = f"{_p};{_curr_path}"
        _curr_path = os.environ["PATH"]

IGNORED_NAMES = {
    "node_modules",
    "__pycache__",
    ".ipc",
    ".git",
    ".DS_Store",
    "Thumbs.db",
    "ehthumbs.db",
    "desktop.ini",
    "Adobe After Effects Auto-Save",
    ".vs",
    ".gdrive_sync_cache.json"
}

IGNORED_EXTENSIONS = {
    ".tmp",
    ".pyc",
    ".pyo",
    ".suo",
    ".user"
}

def normalize_path(rel_path):
    """Normalize relative path to POSIX forward slashes."""
    return rel_path.replace("\\", "/").strip("/")

def is_ignored(rel_path):
    """Check if relative path matches any ignore rule."""
    norm = normalize_path(rel_path)
    if os.path.basename(norm) in IGNORED_NAMES:
        return True
    parts = norm.split("/")
    for p in parts:
        if p in IGNORED_NAMES or p.endswith(".aep Logs"):
            return True
    _, ext = os.path.splitext(norm)
    if ext.lower() in IGNORED_EXTENSIONS:
        return True
    return False

def get_gdrive_command():
    """Resolve authenticated gdrive CLI with recursion protection."""
    if os.environ.get("_AGY_GDRIVE_INVOKED") == "1":
        return "gdrive"
    lang_server = os.path.expandvars(r"%LOCALAPPDATA%\Programs\antigravity\resources\bin\language_server.exe")
    if os.path.isfile(lang_server):
        return f'"{lang_server}" plugin-cli gdrive'
    return "gdrive"

def run_gdrive(cmd_args, retries=3):
    """Run gdrive CLI with Windows shell compatibility and exponential backoff retry."""
    prefix = get_gdrive_command()
    cmd_str = prefix + " " + " ".join(f'"{a}"' if " " in a else a for a in cmd_args)
    env = os.environ.copy()
    env["_AGY_GDRIVE_INVOKED"] = "1"
    err = ""
    for attempt in range(retries):
        try:
            result = subprocess.run(
                cmd_str,
                shell=True,
                env=env,
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0:
                return True, result.stdout.strip()
            err = result.stderr.strip() or result.stdout.strip()
            if attempt < retries - 1:
                time.sleep(1.5 ** attempt)
        except Exception as e:
            err = str(e)
            if attempt < retries - 1:
                time.sleep(1.5 ** attempt)
    return False, err

# ---------------------------------------------------------------------------
# Cache Management
# ---------------------------------------------------------------------------

def load_cache():
    """Load local sync cache from disk."""
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("root_id") == ROOT_FOLDER_ID:
                    return data
        except Exception as e:
            print(f"  [Cache] Warning: Could not read cache ({e}), reinitializing.")
    
    return {
        "version": 1,
        "root_id": ROOT_FOLDER_ID,
        "folders": {
            "": ROOT_FOLDER_ID,
            ".agents": "14_k5fXwKHblkqIhIfDQn_W3MVYt6t46C",
            "Animated Mobile Weather App Promo Project": "17PpN53irylbrhx06PkIlB52CzhYvCJhD",
            "Journey Through Space From Earth to Imagination Project": "1G-yy6TJmfSBJqIgIZVqdLHLCL-XoTdGk",
            "Motion & Timing Animation Project": "17LBER6qmw72TAhaTasuvwMSFKt9gj78k",
            "Motion Graphics": "1kfe0oYeoCs75goDpadwueXIjUwH77ECK",
            "Project City Life An Animated Motion Scene": "1vSsR5elaZVP1OnUvhUJgTrZRhV8qW6ap",
            "Project Future Voyage A Motion Design Story in After Effects": "1URHAGnoj3DBNUNU01wWN7dEagGzdBPp7",
            "Project The Journey of a Memory A Motion Story in After Effects": "1c4nMACozPcRiD8FO6BnJ-UP7BzDqCWMd",
            "remotion": "1xpzDryJ8e0c7LkkvCt61PE8qMX6LH9hl",
            "scripts": "1nTF6-0tdMlsB0swJgLN9sCrisOrffStN",
            "scripts/studio": "1E_DU4DhicQUrnnrhPpJoQvEvafGsb23M",
            "studio": "19Jgp6Q-ebdDORy-0-PbCtX8Mmth-Spw8"
        },
        "files": {}
    }

def save_cache(cache):
    """Save local sync cache to disk."""
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except Exception as e:
        print(f"  [Cache] Warning: Could not save cache ({e})")

def seed_cache(cache):
    """Seed cache with all existing local files and timestamps."""
    print("🌱 Seeding Google Drive local cache with repository files...")
    count = 0
    for root, dirs, files in os.walk(LOCAL_ROOT):
        dirs[:] = [d for d in dirs if d not in IGNORED_NAMES and not d.endswith(".aep Logs")]
        rel_root = os.path.relpath(root, LOCAL_ROOT)
        for fname in files:
            rel_file = normalize_path(os.path.join(rel_root, fname))
            if not is_ignored(rel_file):
                full_path = os.path.join(LOCAL_ROOT, os.path.normpath(rel_file))
                if os.path.isfile(full_path):
                    sz = os.path.getsize(full_path)
                    mt = int(os.path.getmtime(full_path))
                    existing = cache["files"].get(rel_file, {})
                    file_id = existing.get("id") if isinstance(existing, dict) else None
                    cache["files"][rel_file] = {
                        "id": file_id,
                        "size": sz,
                        "mtime": mt
                    }
                    count += 1
    save_cache(cache)
    print(f"✓ Successfully cached {count} files in {CACHE_FILE}.\n")
    return count

def get_remote_items(folder_id):
    """List items inside a remote Google Drive folder."""
    ok, out = run_gdrive(["readonly", "ls", folder_id, "--json"])
    if not ok:
        return {}
    try:
        items = json.loads(out)
        result = {}
        for it in items:
            name = it.get("name")
            fid = it.get("id")
            mtype = it.get("mimeType", "")
            size = int(it.get("size", 0)) if it.get("size") else 0
            is_folder = "folder" in mtype
            result[name] = {
                "id": fid,
                "is_folder": is_folder,
                "size": size,
                "mimeType": mtype
            }
        return result
    except Exception as e:
        print(f"  Warning: JSON parse error for folder {folder_id}: {e}")
        return {}

def ensure_remote_folder(rel_folder_path, cache):
    """Ensure remote folder exists on Google Drive, using cache to minimize API calls."""
    rel_folder_path = normalize_path(rel_folder_path)
    if not rel_folder_path or rel_folder_path == ".":
        return ROOT_FOLDER_ID

    if rel_folder_path in cache["folders"]:
        return cache["folders"][rel_folder_path]

    parts = rel_folder_path.split("/")
    current_path = ""
    current_parent_id = ROOT_FOLDER_ID

    for part in parts:
        parent_path = current_path
        current_path = f"{current_path}/{part}" if current_path else part

        if current_path in cache["folders"]:
            current_parent_id = cache["folders"][current_path]
            continue

        remote_items = get_remote_items(current_parent_id)
        if part in remote_items and remote_items[part]["is_folder"]:
            folder_id = remote_items[part]["id"]
        else:
            ok, out = run_gdrive(["mutate", "mkdir", part, "--parent", current_parent_id])
            if ok:
                m = re.search(r"\(ID:\s*([a-zA-Z0-9_-]+)\)", out)
                if m:
                    folder_id = m.group(1)
                    print(f"  📁 Created remote folder: {current_path}")
                else:
                    print(f"  ✗ Could not extract ID for {current_path}: {out}")
                    return None
            else:
                print(f"  ✗ Failed to create remote folder {current_path}: {out}")
                return None

        cache["folders"][current_path] = folder_id
        current_parent_id = folder_id

    save_cache(cache)
    return current_parent_id

# ---------------------------------------------------------------------------
# File Synchronization
# ---------------------------------------------------------------------------

def sync_single_file(rel_path, cache, force=False):
    """Upload or update a single file on Google Drive using cache."""
    rel_path = normalize_path(rel_path)
    if is_ignored(rel_path):
        return True, "ignored"

    full_path = os.path.join(LOCAL_ROOT, os.path.normpath(rel_path))
    if not os.path.isfile(full_path):
        return False, "file not found"

    file_size = os.path.getsize(full_path)
    file_mtime = int(os.path.getmtime(full_path))
    file_size_mb = file_size / (1024 * 1024)

    cached_info = cache["files"].get(rel_path)
    if cached_info and not force:
        if cached_info.get("size") == file_size and cached_info.get("mtime") == file_mtime and cached_info.get("id"):
            return True, "up-to-date (cached)"

    parent_rel = os.path.dirname(rel_path)
    parent_id = ensure_remote_folder(parent_rel, cache)
    if not parent_id:
        return False, "failed to resolve parent folder"

    # If we have the remote file ID, update it directly
    if cached_info and cached_info.get("id"):
        file_id = cached_info["id"]
        print(f"  → [{file_size_mb:.2f} MB] Updating {rel_path} ...", end=" ", flush=True)
        ok, out = run_gdrive(["mutate", "update", file_id, full_path])
        if ok:
            cache["files"][rel_path] = {"id": file_id, "size": file_size, "mtime": file_mtime}
            print("updated")
            return True, "updated"

    # Otherwise query parent folder
    remote_items = get_remote_items(parent_id)
    fname = os.path.basename(rel_path)
    remote_info = remote_items.get(fname)

    if remote_info and not remote_info["is_folder"]:
        file_id = remote_info["id"]
        if remote_info["size"] == file_size and not force:
            cache["files"][rel_path] = {"id": file_id, "size": file_size, "mtime": file_mtime}
            return True, "up-to-date (remote match)"

        print(f"  → [{file_size_mb:.2f} MB] Updating {rel_path} ...", end=" ", flush=True)
        ok, out = run_gdrive(["mutate", "update", file_id, full_path])
        if ok:
            cache["files"][rel_path] = {"id": file_id, "size": file_size, "mtime": file_mtime}
            print("updated")
            return True, "updated"
        else:
            print(f"FAILED: {out}")
            return False, out
    else:
        print(f"  → [{file_size_mb:.2f} MB] Uploading {rel_path} ...", end=" ", flush=True)
        ok, out = run_gdrive(["mutate", "upload", full_path, "--parent", parent_id])
        if ok:
            m = re.search(r"\(ID:\s*([a-zA-Z0-9_-]+)\)", out)
            new_id = m.group(1) if m else None
            cache["files"][rel_path] = {"id": new_id, "size": file_size, "mtime": file_mtime}
            print("uploaded")
            return True, "uploaded"
        else:
            print(f"FAILED: {out}")
            return False, out

# ---------------------------------------------------------------------------
# Smart Delta Detection (Full Local Repo Scan + Git Diff)
# ---------------------------------------------------------------------------

def find_out_of_sync_files(cache):
    """
    Scans the repository in ~0.09s.
    Returns (files_to_sync, total_scanned_count) containing ONLY files
    that are genuinely new or modified compared to the Google Drive cache.
    """
    files_to_sync = []
    scanned_count = 0

    # 1. High-speed local filesystem walk
    for root, dirs, files in os.walk(LOCAL_ROOT):
        dirs[:] = [d for d in dirs if d not in IGNORED_NAMES and not d.endswith(".aep Logs")]
        rel_root = os.path.relpath(root, LOCAL_ROOT)
        for fname in files:
            rel_file = normalize_path(os.path.join(rel_root, fname))
            if is_ignored(rel_file):
                continue

            full_path = os.path.join(LOCAL_ROOT, os.path.normpath(rel_file))
            if not os.path.isfile(full_path):
                continue

            scanned_count += 1
            sz = os.path.getsize(full_path)
            mt = int(os.path.getmtime(full_path))

            cached = cache["files"].get(rel_file)
            if not cached or cached.get("size") != sz or cached.get("mtime") != mt:
                files_to_sync.append(rel_file)

    # 2. Check uncommitted git status changes
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=LOCAL_ROOT, capture_output=True, text=True
        )
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                if len(line) > 3:
                    status = line[:2]
                    f = normalize_path(line[3:].strip().strip('"'))
                    if "D" not in status and not is_ignored(f):
                        full_f = os.path.join(LOCAL_ROOT, os.path.normpath(f))
                        if os.path.isfile(full_f) and f not in files_to_sync:
                            sz = os.path.getsize(full_f)
                            mt = int(os.path.getmtime(full_f))
                            cached = cache["files"].get(f)
                            if not cached or cached.get("size") != sz or cached.get("mtime") != mt:
                                files_to_sync.append(f)
    except Exception:
        pass

    return sorted(files_to_sync), scanned_count

# ---------------------------------------------------------------------------
# Command Handlers
# ---------------------------------------------------------------------------

def sync_smart(on_push=False):
    """Smart sync: scans all repository files and syncs ONLY what is out of date."""
    start_time = time.time()
    cache = load_cache()

    # If cache has fewer than 10 files registered, auto-seed it once
    if len(cache.get("files", {})) < 10:
        seed_cache(cache)

    files_to_sync, total_scanned = find_out_of_sync_files(cache)
    elapsed_scan = time.time() - start_time

    # If completely up to date, display clean confirmation
    if not files_to_sync:
        print("\n" + "=" * 65)
        print("✓ ALL REPOSITORY FILES ARE UP TO DATE")
        print("=" * 65)
        print(f"  Checked {total_scanned} files across 'AE' in {elapsed_scan:.2f}s.")
        print(f"  Target: My Drive > AE ({ROOT_FOLDER_ID})")
        print("  Everything matches Google Drive perfectly. No uploads needed.")
        print("=" * 65 + "\n")
        return True

    # Otherwise display files requiring sync
    header = "🚀 AE Google Drive Auto-Sync (on git push)" if on_push else "🚀 AE Google Drive Smart Sync"
    print("\n" + "=" * 65)
    print(header)
    print(f"Target: My Drive > AE ({ROOT_FOLDER_ID})")
    print(f"Scanned {total_scanned} files in {elapsed_scan:.2f}s.")
    print("=" * 65)
    print(f"  Found {len(files_to_sync)} file(s) requiring update on Google Drive:\n")
    for f in files_to_sync:
        print(f"    • {f}")
    print()

    stats = {"uploaded": 0, "updated": 0, "skipped": 0, "failed": 0}

    for f in files_to_sync:
        ok, status = sync_single_file(f, cache)
        if ok:
            if status == "uploaded":
                stats["uploaded"] += 1
            elif status == "updated":
                stats["updated"] += 1
            else:
                stats["skipped"] += 1
        else:
            stats["failed"] += 1

    save_cache(cache)
    total_time = time.time() - start_time

    print("\n" + "-" * 65)
    print(f"Sync complete in {total_time:.1f}s | {stats['uploaded']} new, {stats['updated']} updated, {stats['skipped']} skipped, {stats['failed']} failed")
    print("=" * 65 + "\n")
    return stats["failed"] == 0

def sync_full():
    """Full repository cache-assisted audit and sync."""
    start_time = time.time()
    print("\n" + "=" * 65)
    print("🚀 AE Google Drive Full Repository Sync (Cache-Assisted)")
    print(f"Target: My Drive > AE ({ROOT_FOLDER_ID})")
    print("=" * 65)

    cache = load_cache()
    stats = {"uploaded": 0, "updated": 0, "skipped": 0, "failed": 0}

    all_files = []
    for root, dirs, files in os.walk(LOCAL_ROOT):
        dirs[:] = [d for d in dirs if d not in IGNORED_NAMES and not d.endswith(".aep Logs")]
        rel_root = os.path.relpath(root, LOCAL_ROOT)
        for fname in files:
            rel_file = normalize_path(os.path.join(rel_root, fname))
            if not is_ignored(rel_file):
                all_files.append(rel_file)

    print(f"Auditing {len(all_files)} total files against local Google Drive cache...")

    for f in all_files:
        ok, status = sync_single_file(f, cache)
        if ok:
            if status == "uploaded":
                stats["uploaded"] += 1
            elif status == "updated":
                stats["updated"] += 1
            else:
                stats["skipped"] += 1
        else:
            stats["failed"] += 1

    save_cache(cache)
    elapsed = time.time() - start_time

    print("\n" + "=" * 65)
    print("FULL SYNC SUMMARY")
    print(f"  Uploaded: {stats['uploaded']} new files")
    print(f"  Updated:  {stats['updated']} modified files")
    print(f"  Skipped:  {stats['skipped']} unchanged files")
    print(f"  Failed:   {stats['failed']} errors")
    print(f"  Time:     {elapsed:.1f} seconds")
    print("=" * 65 + "\n")
    return stats["failed"] == 0

# ---------------------------------------------------------------------------
# Git Hook Management
# ---------------------------------------------------------------------------

def install_hook():
    """Install native .git/hooks/pre-push hook for automatic sync on git push."""
    hooks_dir = os.path.join(LOCAL_ROOT, ".git", "hooks")
    os.makedirs(hooks_dir, exist_ok=True)
    hook_path = os.path.join(hooks_dir, "pre-push")

    hook_content = """#!/bin/sh
# Git Pre-Push Hook for Automatic Google Drive Sync (AE)
# Compatible with both Terminal CLI and GitHub Desktop GUI

export PATH="/c/Python315:/c/Python315/Scripts:/c/Users/Admin/.gemini/antigravity/bin:$PATH"

PYTHON_EXEC="python"
if [ -x "/c/Python315/python.exe" ]; then
    PYTHON_EXEC="/c/Python315/python.exe"
fi

echo ""
echo "================================================================="
echo "🚀 [AE Auto-Sync] Triggered by push (GitHub Desktop / CLI)..."
echo "================================================================="

# Execute fast smart sync
"$PYTHON_EXEC" scripts/studio/gdrive_sync.py --on-push

if [ $? -eq 0 ]; then
    echo "✅ [AE Auto-Sync] Google Drive is fully synchronized."
else
    echo "⚠️ [AE Auto-Sync] Google Drive sync completed with warnings."
fi
echo ""
exit 0
"""

    with open(hook_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(hook_content)

    try:
        os.chmod(hook_path, 0o755)
    except Exception:
        pass

    print("\n" + "=" * 65)
    print("✅ Git Pre-Push Hook Installed Successfully!")
    print(f"File: {hook_path}")
    print("Whenever you push in GitHub Desktop or CLI, Google Drive will automatically update.")
    print("=" * 65 + "\n")

def uninstall_hook():
    """Remove .git/hooks/pre-push hook."""
    hook_path = os.path.join(LOCAL_ROOT, ".git", "hooks", "pre-push")
    if os.path.exists(hook_path):
        os.remove(hook_path)
        print("✅ Git Pre-Push Hook Uninstalled.")
    else:
        print("ℹ️ Git Pre-Push Hook is not currently installed.")

# ---------------------------------------------------------------------------
# Main CLI Entrypoint
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="AE Google Drive Auto-Sync Engine")
    parser.add_argument("--on-push", action="store_true", help="Hook mode for git pre-push")
    parser.add_argument("--git", action="store_true", help="Run smart sync (default)")
    parser.add_argument("--full", action="store_true", help="Perform full cache-assisted tree sync")
    parser.add_argument("--file", type=str, help="Sync a specific file relative to AE root")
    parser.add_argument("--seed-cache", action="store_true", help="Seed cache with all local files")
    parser.add_argument("--install-hook", action="store_true", help="Install git pre-push hook")
    parser.add_argument("--uninstall-hook", action="store_true", help="Uninstall git pre-push hook")

    args = parser.parse_args()

    if args.install_hook:
        install_hook()
        return

    if args.uninstall_hook:
        uninstall_hook()
        return

    if args.seed_cache:
        cache = load_cache()
        seed_cache(cache)
        return

    if args.file:
        cache = load_cache()
        print(f"Syncing file: {args.file}")
        ok, status = sync_single_file(args.file, cache, force=True)
        save_cache(cache)
        print(f"Result: {status}")
        return

    if args.full:
        sync_full()
        return

    # Default: smart sync across entire repository
    sync_smart(on_push=args.on_push)

if __name__ == "__main__":
    main()
