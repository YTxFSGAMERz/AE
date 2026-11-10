#!/usr/bin/env python3
"""Which side of the frame is the presenter on -> which side overlays should take.
   python3 scripts/face-side.py <video-or-image> [--t 3]
   Prints {"faces": n, "cx": 0.31, "cy": 0.42, "w": 0.18, "side": "left", "overlay": "right"}
   YuNet (OpenCV DNN) — accurate enough for side-of-frame; samples 3 frames of a video and votes."""
import sys, json, subprocess, tempfile, os
import cv2, warnings
cv2.setLogLevel(0) if hasattr(cv2, 'setLogLevel') else None
args = sys.argv[1:]
src = args[0]; t = float(args[args.index("--t") + 1]) if "--t" in args else 3.0
MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "yunet.onnx")  # OpenCV zoo YuNet (Apache-2.0)
def detect(img):
    h, w = img.shape[:2]
    det = cv2.FaceDetectorYN.create(MODEL, "", (w, h), 0.6, 0.3, 5000)
    _, faces = det.detect(img)
    if faces is None or len(faces) == 0: return None
    x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])[:4]
    return (float((x + fw / 2) / w), float((y + fh / 2) / h), float(fw / w), int(len(faces)))
res = []
if src.lower().endswith((".mp4", ".mov", ".webm", ".mkv")):
    tmp = tempfile.mkdtemp()
    for i, tt in enumerate([t, t + 2, t + 4]):
        f = os.path.join(tmp, f"{i}.png")
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(tt), "-i", src, "-frames:v", "1", f])
        if os.path.exists(f):
            r = detect(cv2.imread(f)); res.append(r) if r else None
else:
    r = detect(cv2.imread(src)); res.append(r) if r else None
if not res: print(json.dumps({"faces": 0})); sys.exit(0)
cx = sum(r[0] for r in res) / len(res); cy = sum(r[1] for r in res) / len(res); w = sum(r[2] for r in res) / len(res)
side = "left" if cx < 0.42 else "right" if cx > 0.58 else "center"
print(json.dumps({"faces": max(r[3] for r in res), "cx": round(cx, 2), "cy": round(cy, 2), "w": round(w, 2), "side": side, "overlay": {"left": "right", "right": "left", "center": "bottom"}[side]}))
