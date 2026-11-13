#!/usr/bin/env python3
"""
setup_ae_prefs.py
Configures Adobe After Effects preferences to allow ExtendScript scripts
to write files and access network sockets ("Allow Scripts to Write Files and Access Network").

This is required for IPC communication and returning results from AE to external tools.
"""

import os
import sys
import shutil
import re
from datetime import datetime

def get_ae_prefs_paths():
    appdata = os.environ.get("APPDATA")
    if not appdata:
        return []
    
    ae_root = os.path.join(appdata, "Adobe", "After Effects")
    if not os.path.isdir(ae_root):
        return []
    
    prefs_files = []
    for entry in os.listdir(ae_root):
        ver_dir = os.path.join(ae_root, entry)
        if os.path.isdir(ver_dir):
            for fname in os.listdir(ver_dir):
                if "Prefs.txt" in fname and not fname.endswith(".bak"):
                    prefs_files.append(os.path.join(ver_dir, fname))
    return prefs_files

def check_or_update_prefs(prefs_path, update=True):
    print(f"Examining: {prefs_path}")
    try:
        with open(prefs_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        print(f"  Error reading {prefs_path}: {e}")
        return False

    pattern = r'("Pref_SCRIPTING_FILE_NETWORK_SECURITY"\s*=\s*)"([01])"'
    match = re.search(pattern, content)
    
    if not match:
        print("  Pref_SCRIPTING_FILE_NETWORK_SECURITY not found in file.")
        return False
    
    current_val = match.group(2)
    print(f"  Current Pref_SCRIPTING_FILE_NETWORK_SECURITY = {current_val}")
    
    if current_val == "1":
        print("  Security is already enabled (1). Scripts have file/network access.")
        return True
    
    if not update:
        print("  Security is currently disabled (0). Run without --check to enable.")
        return False

    # Create backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{prefs_path}.{timestamp}.bak"
    try:
        shutil.copy2(prefs_path, backup_path)
        print(f"  Created backup at: {backup_path}")
    except Exception as e:
        print(f"  Failed to create backup: {e}")
        return False

    new_content = re.sub(pattern, r'\g<1>"1"', content)
    try:
        with open(prefs_path, "w", encoding="utf-8", errors="replace") as f:
            f.write(new_content)
        print("  Successfully updated Pref_SCRIPTING_FILE_NETWORK_SECURITY to 1.")
        return True
    except Exception as e:
        print(f"  Failed to write updated preferences: {e}")
        return False

def main():
    check_only = "--check" in sys.argv
    prefs_files = get_ae_prefs_paths()
    if not prefs_files:
        print("No After Effects preference files found in %APPDATA%/Adobe/After Effects.")
        sys.exit(1)
        
    all_ok = True
    for p in prefs_files:
        success = check_or_update_prefs(p, update=not check_only)
        if not success:
            all_ok = False
            
    sys.exit(0 if all_ok else 1)

if __name__ == "__main__":
    main()
