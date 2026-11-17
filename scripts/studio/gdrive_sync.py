#!/usr/bin/env python3
"""
gdrive_sync.py
Synchronizes local After Effects repository contents to Google Drive using the gdrive CLI.
"""

import os
import sys
import json
import time
import subprocess
import re

ROOT_FOLDER_ID = "18jb20pW3S-KNLwWrvanW9UChR7b9WCg_"
LOCAL_ROOT = r"C:\Users\Admin\Documents\GitHub\AE"

IGNORED_NAMES = {
    "node_modules",
    "__pycache__",
    ".ipc",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    "Adobe After Effects Auto-Save"
}

IGNORED_EXTENSIONS = {
    ".tmp",
    ".pyc",
    ".pyo"
}

def run_gdrive(cmd_args, retries=3):
    """Run gdrive CLI with retry logic."""
    cmd_str = "gdrive " + " ".join(f'"{a}"' if " " in a else a for a in cmd_args)
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
                time.sleep(2 ** attempt)
        except Exception as e:
            err = str(e)
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return False, err

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

def ensure_remote_folder(name, parent_id, remote_items_cache):
    """Ensure a subfolder exists in the remote parent."""
    if name in remote_items_cache and remote_items_cache[name]["is_folder"]:
        return remote_items_cache[name]["id"]

    ok, out = run_gdrive(["mutate", "mkdir", name, "--parent", parent_id])
    if ok:
        # Regex to extract ID: (ID: ...)
        m = re.search(r"\(ID:\s*([a-zA-Z0-9_-]+)\)", out)
        if m:
            new_id = m.group(1)
            remote_items_cache[name] = {"id": new_id, "is_folder": True, "size": 0}
            print(f"  📁 Created remote folder: {name}")
            return new_id
    print(f"  ✗ Failed to create folder {name}: {out}")
    return None

def upload_file(local_path, parent_id, remote_info=None):
    """Upload or update a local file into remote Google Drive folder."""
    fname = os.path.basename(local_path)
    file_size = os.path.getsize(local_path)

    if remote_info and not remote_info["is_folder"]:
        # Check if already up to date
        if remote_info["size"] == file_size:
            return True, "skipped (size matches)"
        # Update existing
        ok, out = run_gdrive(["mutate", "update", remote_info["id"], local_path])
        if ok:
            return True, "updated"
        return False, out
    else:
        # Upload new
        ok, out = run_gdrive(["mutate", "upload", local_path, "--parent", parent_id])
        if ok:
            return True, "uploaded"
        return False, out

def sync_directory(local_dir, remote_parent_id, stats):
    """Recursively sync local_dir into remote_parent_id."""
    remote_items = get_remote_items(remote_parent_id)

    try:
        entries = sorted(os.listdir(local_dir))
    except Exception as e:
        print(f"  Cannot list {local_dir}: {e}")
        return

    # Files first, then directories
    files = []
    subdirs = []

    for entry in entries:
        if entry in IGNORED_NAMES:
            continue
        full_path = os.path.join(local_dir, entry)
        if os.path.isfile(full_path):
            _, ext = os.path.splitext(entry)
            if ext.lower() not in IGNORED_EXTENSIONS:
                files.append((entry, full_path))
        elif os.path.isdir(full_path):
            subdirs.append((entry, full_path))

    # Sync files
    for fname, fpath in files:
        remote_info = remote_items.get(fname)
        fsize_mb = os.path.getsize(fpath) / (1024 * 1024)
        print(f"  → [{fsize_mb:.2f} MB] {fname} ...", end=" ", flush=True)
        ok, msg = upload_file(fpath, remote_parent_id, remote_info)
        if ok:
            print(f"{msg}")
            if msg == "uploaded":
                stats["uploaded"] += 1
            elif msg == "updated":
                stats["updated"] += 1
            else:
                stats["skipped"] += 1
        else:
            print(f"FAILED: {msg}")
            stats["failed"] += 1

    # Non-hidden folders first, dot-folders last
    subdirs.sort(key=lambda x: (x[0].startswith("."), x[0].lower()))

    # Recurse into subdirectories
    for dname, dpath in subdirs:
        print(f"\n📂 Syncing folder: {os.path.relpath(dpath, LOCAL_ROOT)}")
        subfolder_id = ensure_remote_folder(dname, remote_parent_id, remote_items)
        if subfolder_id:
            sync_directory(dpath, subfolder_id, stats)
        else:
            print(f"  ✗ Skipping {dname} due to folder creation failure")

def main():
    print("=" * 70)
    print("Google Drive Repository Sync")
    print(f"Target: My Drive > AE (ID: {ROOT_FOLDER_ID})")
    print(f"Source: {LOCAL_ROOT}")
    print("=" * 70)

    stats = {"uploaded": 0, "updated": 0, "skipped": 0, "failed": 0}
    start_time = time.time()

    sync_directory(LOCAL_ROOT, ROOT_FOLDER_ID, stats)

    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print("SYNC SUMMARY")
    print(f"  Uploaded: {stats['uploaded']} new files")
    print(f"  Updated:  {stats['updated']} modified files")
    print(f"  Skipped:  {stats['skipped']} unchanged files")
    print(f"  Failed:   {stats['failed']} errors")
    print(f"  Time:     {elapsed:.1f} seconds")
    print("=" * 70)

if __name__ == "__main__":
    main()
