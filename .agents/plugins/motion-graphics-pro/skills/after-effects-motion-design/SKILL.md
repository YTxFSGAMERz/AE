---
name: after-effects-motion-design
description: Master knowledge base for professional After Effects motion design, VFX compositing, and animation craftsmanship. Covers 12 principles of animation in AE, speed/value graph editor mastery, 2.5D multiplane parallax environments, green screen chroma keying (Keylight), particle simulation, audio-reactive motion, and production expression libraries. Use when designing animations, tuning easing curves, rigging expressions, or compositing VFX in After Effects.
---

# Professional After Effects Motion Design & VFX Compositing

This skill provides senior-level animation principles, compositing runbooks, and production formulas for Adobe After Effects.

---

## 1. Animation Principles & Graph Editor Mastery

Smooth, organic motion in After Effects is governed by the relationship between the **Value Graph** and the **Speed Graph**.

```
Standard "Easy Ease" (F9) vs Professional Cinematic Ease
--------------------------------------------------------
Default F9:          Speed: 0 px/s, Influence: 33% -> Symmetrical, often sluggish
Cinematic Ease:      Speed: 0 px/s, Influence: 75%–85% -> Snappy burst, long smooth deceleration
```

### Speed Graph Shaping Rules
1. **Asymmetrical Curves**: For entrance transitions, pull the right handle toward the center. The object enters at high velocity and smoothly eases into resting position over the remaining $60\%$ of the duration.
2. **Anticipation**: Before a major forward action, insert a 3–5 frame recoil in the opposite direction (e.g. scaling down to $95\%$ before bursting to $110\%$).
3. **Follow-Through & Secondary Action**: Never stop all properties on the same frame. Stagger Position, Scale, and Rotation terminations by 2–4 frames to eliminate robotic rigidity.

---

## 2. Multiplane 2.5D Parallax Camera Rigs

Parallax creates spatial depth by translating layers at speeds inversely proportional to their distance from the camera (exemplified in `city.aep` and `bridge bg.aep`).

### Setup Runbook
1. **Enable 3D Layer Switch** on all asset layers.
2. **Create a Camera Layer**:
   - Preset: **50mm** (natural focal length without wide-angle fish-eye distortion).
3. **Create a 3D Null Object**:
   - Name: `Camera_Controller`.
   - Parent the Camera to the Null. Animate the Null's Position and Rotation rather than the camera directly.
4. **Distribute Z-Depth**:
   - **Foreground Elements** (Railings, foliage): $Z = -400$ to $-800$ (moves rapidly).
   - **Main Subject / Midground**: $Z = 0$ (focal plane).
   - **Background Buildings**: $Z = 1200$ to $2000$.
   - **Distant Mountains / Sky**: $Z = 4000$ to $8000$ (moves imperceptibly).
5. **Scale Compensation**: After pushing a layer back in $Z$, scale it up to fill the frame:
   $$\text{Scale Factor} = \frac{\text{Distance to Layer}}{\text{Camera Zoom}}$$

---

## 3. Professional Chroma Keying Pipeline (Keylight 1.2)

Complete runbook for clean green screen extraction without fringe halos (`chroma.aep`):

```
Step 1: Garbage Matte
 └── Mask out lights, microphone booms, and unused studio areas

Step 2: Eyedropper Selection (Screen Colour)
 └── Pick green near the actor's face/hair, NEVER from the brightest edge

Step 3: Screen Matte Tuning (Switch View to "Screen Matte")
 ├── Clip Black: Raise slowly (e.g. 5–15) until background noise is pure black (0)
 ├── Clip White: Lower slowly (e.g. 85–95) until actor core is pure white (255)
 ├── Screen Softness: Set to 1.0–2.0 for natural edge feathering
 └── Screen Despot: Adjust Black/White Despot to remove isolated pinhole noise

Step 4: Spill Suppression & Light Wrap
 ├── Switch View back to "Final Output"
 ├── Apply "Advanced Spill Suppressor" (Ultra or Standard method)
 └── Create Light Wrap: Blend subtle background color onto the actor's outer rim
```

---

## 4. Audio-Driven Reactive Motion Graphics

Automating visuals based on musical frequency and beats (`Audio driven animation.aep`):

1. **Extract Audio Amplitude**:
   - Right-click audio layer $\to$ `Keyframe Assistant` $\to$ `Convert Audio to Keyframes`.
   - This creates an `Audio Amplitude` null with sliders: `Left Channel`, `Right Channel`, `Both Channels`.
2. **Expression Remapping**:
   Apply this expression to a layer's Scale property:
   ```javascript
   var amp = thisComp.layer("Audio Amplitude").effect("Both Channels")("Slider");
   // Map audio range (min 5, max 45) to visual scale (min 100%, max 130%)
   var s = linear(amp, 5, 45, 100, 130);
   [s, s];
   ```

---

## 5. Battle-Tested Production Expressions

### Natural Inertial Bounce (Elastic Overshoot)
Apply to Position, Scale, or Rotation. Automatically calculates realistic bounce physics after keyframe motion stops:

```javascript
n = 0;
if (numKeys > 0){
  n = nearestKey(time).index;
  if (key(n).time > time){
    n--;
  }
}
if (n == 0){
  t = 0;
} else {
  t = time - key(n).time;
}

if (n > 0 && t < 1){
  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);
  amp = 0.05;      // Bounce amplitude
  freq = 4.0;      // Oscillation frequency
  decay = 8.0;     // Damping decay speed
  value + v * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
} else {
  value;
}
```

### Smooth Damped Camera Wiggle
Smooth organic drift without abrupt velocity jerks:

```javascript
freq = 0.8; // Occurrences per second
amp = 25;   // Pixel displacement
octaves = 2;
mult = 0.5;
wiggle(freq, amp, octaves, mult, time);
```

### Auto-Orientation along Path with Banking
Apply to 2D layer Rotation to face direction of movement and bank into turns:

```javascript
v = velocity;
Math.atan2(v[1], v[0]) * 180 / Math.PI;
```
