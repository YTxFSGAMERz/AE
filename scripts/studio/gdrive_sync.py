#!/usr/bin/env python3
"""
=============================================================================
🎬 AFTER EFFECTS REPOSITORY - GOOGLE DRIVE AUTO-SYNC ENGINE
=============================================================================
High-speed incremental synchronization from local 'AE' repository to Google Drive.

Modes:
  --on-push       : Git hook mode. Syncs only commits being pushed (sub-5s).
  --git           : Manual delta mode. Syncs unpushed commits + staged/untracked files.
  --full          : Full cache-assisted tree audit. Checks all files via local mtime/size.
  --file <path>   : Sync a single file or render output immediately.
  --install-hook  : Install native .git/hooks/pre-push hook for automatic sync on 'git push'.
  --uninstall-hook: Remove git hook.
  --init-cache    : Scan remote drive to warm the folder ID cache.
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

IGNORED_NAMES = {
    "node_modules",
    "__pycache__",
    ".ipc",
    ".DS_Store",
    "Thumbs.db",
    "ehthumbs.db",
    "desktop.ini",
    "Adobe After Effects Auto-Save",
    ".vs"
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

def run_gdrive(cmd_args, retries=3):
    """Run gdrive CLI with Windows shell compatibility and exponential backoff retry."""
    cmd_str = "gdrive " + " ".join(f'"{a}"' if " " in a else a for a in cmd_args)
    err = ""
    for attempt in range(retries):
        try:
            result = subprocess.run(
                cmd_str,
                shell=True,
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
            ".git": "1UZRtcIqHJt0K_vBW_V4-DkBRw7TaqnoN",
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

    # Resolve parent path first
    parts = rel_folder_path.split("/")
    current_path = ""
    current_parent_id = ROOT_FOLDER_ID

    for part in parts:
        parent_path = current_path
        current_path = f"{current_path}/{part}" if current_path else part

        if current_path in cache["folders"]:
            current_parent_id = cache["folders"][current_path]
            continue

        # Look up remotely inside current_parent_id
        remote_items = get_remote_items(current_parent_id)
        if part in remote_items and remote_items[part]["is_folder"]:
            folder_id = remote_items[part]["id"]
        else:
            # Create remote folder
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

def is_ignored(rel_path):
    """Check if relative path matches any ignore rule."""
    parts = normalize_path(rel_path).split("/")
    for p in parts:
        if p in IGNORED_NAMES or p.endswith(".aep Logs"):
            return True
    _, ext = os.path.splitext(rel_path)
    if ext.lower() in IGNORED_EXTENSIONS:
        return True
    return False

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

    # Check local cache first
    cached_info = cache["files"].get(rel_path)
    if cached_info and not force:
        if cached_info.get("size") == file_size and cached_info.get("mtime") == file_mtime:
            return True, "up-to-date (cached)"

    # Resolve remote parent folder
    parent_rel = os.path.dirname(rel_path)
    parent_id = ensure_remote_folder(parent_rel, cache)
    if not parent_id:
        return False, "failed to resolve parent folder"

    # If we already have the remote file ID in cache, update it directly
    if cached_info and cached_info.get("id"):
        file_id = cached_info["id"]
        print(f"  → [{file_size_mb:.2f} MB] Updating {rel_path} ...", end=" ", flush=True)
        ok, out = run_gdrive(["mutate", "update", file_id, full_path])
        if ok:
            cache["files"][rel_path] = {"id": file_id, "size": file_size, "mtime": file_mtime}
            print("updated")
            return True, "updated"
        # If update failed because ID was invalid/trashed, fall back to upload below

    # Otherwise query parent to see if file exists by name
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
# Git Delta Detection
# ---------------------------------------------------------------------------

def get_git_changed_files(base_ref=None):
    """
    Find files modified, added, or untracked since base_ref (or unpushed commits).
    """
    files_to_sync = set()

    # 1. Unpushed commits (origin/master..HEAD or @{upstream}..HEAD)
    try:
        if not base_ref:
            # Try upstream tracking branch first
            res = subprocess.run(
                ["git", "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
                cwd=LOCAL_ROOT, capture_output=True, text=True
            )
            base_ref = res.stdout.strip() if res.returncode == 0 else "origin/master"

        res = subprocess.run(
            ["git", "diff", "--name-only", f"{base_ref}..HEAD"],
            cwd=LOCAL_ROOT, capture_output=True, text=True
        )
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                f = line.strip()
                if f and not is_ignored(f) and os.path.isfile(os.path.join(LOCAL_ROOT, f)):
                    files_to_sync.add(normalize_path(f))
    except Exception:
        pass

    # 2. Local uncommitted changes (git status)
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=LOCAL_ROOT, capture_output=True, text=True
        )
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                if len(line) > 3:
                    status = line[:2]
                    f = line[3:].strip().strip('"')
                    # Skip deleted files
                    if "D" in status:
                        continue
                    if f and not is_ignored(f) and os.path.isfile(os.path.join(LOCAL_ROOT, f)):
                        files_to_sync.add(normalize_path(f))
    except Exception:
        pass

    return sorted(list(files_to_sync))

# ---------------------------------------------------------------------------
# Command Handlers
# ---------------------------------------------------------------------------

def sync_git_delta(on_push=False):
    """Sync only git-changed files."""
    start_time = time.time()
    header = "🚀 AE Google Drive Auto-Sync (on git push)" if on_push else "🚀 AE Google Drive Git Delta Sync"
    print("\n" + "=" * 65)
    print(header)
    print(f"Target: My Drive > AE ({ROOT_FOLDER_ID})")
    print("=" * 65)

    changed_files = get_git_changed_files()

    if not changed_files:
        print("  ✓ No local or unpushed changes detected.")
        print("  ✓ Google Drive is already up to date with this repository.")
        print("=" * 65 + "\n")
        return True

    print(f"  Found {len(changed_files)} changed file(s) to synchronize:\n")
    for f in changed_files:
        print(f"    • {f}")
    print()

    cache = load_cache()
    stats = {"uploaded": 0, "updated": 0, "skipped": 0, "failed": 0}

    for f in changed_files:
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

    print("\n" + "-" * 65)
    print(f"Sync complete in {elapsed:.1f}s | {stats['uploaded']} new, {stats['updated']} updated, {stats['skipped']} skipped, {stats['failed']} failed")
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

    # Walk all files in LOCAL_ROOT
    all_files = []
    for root, dirs, files in os.walk(LOCAL_ROOT):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in IGNORED_NAMES and not d.endswith(".aep Logs")]
        rel_root = os.path.relpath(root, LOCAL_ROOT)
        for fname in files:
            rel_file = os.path.normpath(os.path.join(rel_root, fname))
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
echo ""
echo "================================================================="
echo "🚀 [AE Auto-Sync] Triggered by git push..."
echo "================================================================="

# Execute fast delta sync
python scripts/studio/gdrive_sync.py --on-push

if [ $? -eq 0 ]; then
    echo "✅ [AE Auto-Sync] Google Drive is fully synchronized."
else
    echo "⚠️ [AE Auto-Sync] Google Drive sync encountered warnings (git push continuing)."
fi
echo ""
exit 0
"""

    with open(hook_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(hook_content)

    # In git bash / POSIX, make executable
    try:
        os.chmod(hook_path, 0o755)
    except Exception:
        pass

    print("\n" + "=" * 65)
    print("✅ Git Pre-Push Hook Installed Successfully!")
    print(f"File: {hook_path}")
    print("Whenever you run 'git push', your changes will automatically sync to Google Drive.")
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
    parser.add_argument("--git", action="store_true", help="Sync unpushed and modified git changes")
    parser.add_argument("--full", action="store_true", help="Perform full cache-assisted tree sync")
    parser.add_argument("--file", type=str, help="Sync a specific file relative to AE root")
    parser.add_argument("--install-hook", action="store_true", help="Install git pre-push hook")
    parser.add_argument("--uninstall-hook", action="store_true", help="Uninstall git pre-push hook")

    args = parser.parse_args()

    if args.install_hook:
        install_hook()
        return

    if args.uninstall_hook:
        uninstall_hook()
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

    # Default to git delta sync
    sync_git_delta(on_push=args.on_push)

if __name__ == "__main__":
    main()
