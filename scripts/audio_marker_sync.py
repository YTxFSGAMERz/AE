#!/usr/bin/env python3
"""
audio_marker_sync.py
Analyzes an audio file for rhythmic beats and transient energy peaks,
and generates/applies After Effects timeline markers.
"""

import os
import sys
import json
import argparse
import subprocess
import numpy as np
import imageio_ffmpeg

def extract_pcm_mono(audio_path, sample_rate=44100):
    """Decodes any audio file into 16-bit signed mono PCM numpy array using ffmpeg."""
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg,
        "-i", os.path.abspath(audio_path),
        "-vn",
        "-ac", "1",
        "-ar", str(sample_rate),
        "-f", "s16le",
        "-"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    raw_data, _ = proc.communicate()
    samples = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32)
    return samples, sample_rate

def detect_transient_peaks(samples, sample_rate=44100, hop_ms=30, threshold_factor=1.4, min_distance_s=0.2):
    """
    Computes energy envelope and detects rhythmic transient peaks.
    """
    hop_length = int(sample_rate * (hop_ms / 1000.0))
    num_frames = len(samples) // hop_length
    
    # Calculate frame RMS energy
    energy = np.zeros(num_frames)
    for i in range(num_frames):
        chunk = samples[i * hop_length:(i + 1) * hop_length]
        energy[i] = np.sqrt(np.mean(chunk ** 2) + 1e-8)
        
    # Moving average baseline
    window_frames = int(0.5 / (hop_ms / 1000.0)) # 500ms moving window
    cumsum = np.cumsum(np.insert(energy, 0, 0))
    baseline = np.zeros_like(energy)
    
    for i in range(num_frames):
        start = max(0, i - window_frames // 2)
        end = min(num_frames, i + window_frames // 2)
        baseline[i] = (cumsum[end] - cumsum[start]) / (end - start)
        
    # Peak threshold
    threshold = baseline * threshold_factor
    min_dist_frames = int(min_distance_s / (hop_ms / 1000.0))
    
    peaks = []
    last_peak_frame = -min_dist_frames
    
    for i in range(1, num_frames - 1):
        if energy[i] > threshold[i] and energy[i] > energy[i - 1] and energy[i] >= energy[i + 1]:
            if (i - last_peak_frame) >= min_dist_frames:
                peak_time = (i * hop_length) / sample_rate
                peaks.append(round(peak_time, 3))
                last_peak_frame = i
                
    return peaks

def generate_extendscript(peaks, marker_comment="Beat"):
    """Generates JSX to apply markers to the active comp."""
    jsx = [
        '(function() {',
        '    if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {',
        '        return "Error: No active composition found.";',
        '    }',
        '    var comp = app.project.activeItem;',
        '    app.beginUndoGroup("Sync Audio Markers");',
        '    var times = ' + json.dumps(peaks) + ';',
        '    for (var i = 0; i < times.length; i++) {',
        '        var mv = new MarkerValue("' + marker_comment + ' " + (i + 1));',
        '        comp.markerProperty.setValueAtTime(times[i], mv);',
        '    }',
        '    app.endUndoGroup();',
        '    return "Created " + times.length + " timeline markers.";',
        '})();'
    ]
    return "\n".join(jsx)

def main():
    parser = argparse.ArgumentParser(description="After Effects Audio Transient Marker Generator")
    parser.add_argument("audio", help="Path to audio file (mp3, wav, etc.)")
    parser.add_argument("--threshold", type=float, default=1.35, help="Sensitivity multiplier (default: 1.35)")
    parser.add_argument("--min-distance", type=float, default=0.25, help="Minimum seconds between beats (default: 0.25s)")
    parser.add_argument("--comment", default="Beat", help="Marker label prefix")
    parser.add_argument("--apply", action="store_true", help="Directly apply markers to AE active comp via ae_bridge")
    parser.add_argument("--json", action="store_true", help="Output peaks as JSON array")

    args = parser.parse_args()

    if not os.path.isfile(args.audio):
        print(f"Error: Audio file not found: {args.audio}", file=sys.stderr)
        sys.exit(1)

    samples, sr = extract_pcm_mono(args.audio)
    peaks = detect_transient_peaks(
        samples,
        sample_rate=sr,
        threshold_factor=args.threshold,
        min_distance_s=args.min_distance
    )

    if args.json:
        print(json.dumps({"audio_file": args.audio, "peaks_count": len(peaks), "peaks": peaks}, indent=2))
        return

    print(f"Detected {len(peaks)} audio transients in {os.path.basename(args.audio)}.")

    jsx_code = generate_extendscript(peaks, marker_comment=args.comment)

    if args.apply:
        from ae_bridge import dispatch_command
        res = dispatch_command("eval", {"code": jsx_code, "undo_name": "Sync Audio Markers"})
        if res.get("status") == "success":
            print(f"Successfully applied to AE: {res.get('result')}")
        else:
            print(f"Error applying markers: {res.get('error')}", file=sys.stderr)
            sys.exit(1)
    else:
        print("\nGenerated ExtendScript snippet:")
        print(jsx_code)

if __name__ == "__main__":
    main()
