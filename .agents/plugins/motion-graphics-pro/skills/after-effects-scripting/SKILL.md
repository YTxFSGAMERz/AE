---
name: after-effects-scripting
description: Guide and reference for Adobe After Effects ExtendScript (JSX) automation and scripting. Covers AE Object Model (app, project, items, compositions, layers, properties, render queue), match names, keyframe interpolation (KeyframeEase), expression rigging, text styling (TextDocument), and batch render automation. Use when the user asks to write, debug, or optimize After Effects JSX scripts, automate comp creation, procedural animations, or batch render tasks.
---

# After Effects Scripting (ExtendScript / JSX)

This skill provides an authoritative reference and practical procedures for writing, debugging, and executing Adobe After Effects automation scripts using ExtendScript (JavaScript 1.5 with Adobe DOM extensions).

---

## 1. Core Architecture & Object Model Hierarchy

The After Effects Document Object Model (DOM) is structured hierarchically:

```
app
 └── project
      ├── items (ItemCollection)
      │    ├── CompItem
      │    │    └── layers (LayerCollection)
      │    │         ├── AVLayer / ShapeLayer / TextLayer / CameraLayer / LightLayer
      │    │         └── propertyGroup / property (ADBE Transform Group, ADBE Effect Parade)
      │    ├── FootageItem
      │    └── FolderItem
      └── renderQueue (RenderQueue)
           └── items (RQItemCollection)
                └── OutputModuleCollection
```

### Safety Wrapper & Active Composition Access
Always wrap operations in an undo group and check for active composition:

```javascript
(function() {
    if (!app.project) {
        alert("No active project found!");
        return;
    }

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select or open a composition first.");
        return;
    }

    app.beginUndoGroup("Procedural Motion Build");
    try {
        // Execute automation logic here
    } catch (err) {
        alert("Error at line " + err.line + ": " + err.message);
    } finally {
        app.endUndoGroup();
    }
})();
```

---

## 2. Match Names Reference

Never use localized UI names (e.g. `"Position"` or `"Ramp"`). Localized strings break in non-English After Effects installations. Always query or add properties using official Adobe Match Names.

### Essential Match Names Table

| Property / Component | Match Name | Notes |
| :--- | :--- | :--- |
| **Transform Group** | `ADBE Transform Group` | Holds anchor, position, scale, rotation, opacity |
| **Position (2D/3D)** | `ADBE Position` | 2D: `[x, y]`, 3D: `[x, y, z]` |
| **Scale** | `ADBE Scale` | Array: `[sx, sy, sz]` in percent (100 = 100%) |
| **Rotation (Z)** | `ADBE Rotate Z` or `ADBE Rotation` | Degrees |
| **Opacity** | `ADBE Opacity` | 0.0 to 100.0 |
| **Root Vectors Group** | `ADBE Root Vectors Group` | Top level of ShapeLayer |
| **Vector Group** | `ADBE Vector Group` | Nested shape group |
| **Vector Shape - Rect** | `ADBE Vector Shape - Rect` | Rectangle shape |
| **Vector Shape - Ellipse** | `ADBE Vector Shape - Ellipse` | Ellipse shape |
| **Vector Shape - Star** | `ADBE Vector Shape - Star` | Polystar / Polygon |
| **Vector Graphic - Fill** | `ADBE Vector Graphic - Fill` | Solid color fill |
| **Vector Graphic - Stroke** | `ADBE Vector Graphic - Stroke` | Vector stroke |
| **Effect Parade** | `ADBE Effect Parade` | Container for layer effects |
| **Gradient Ramp Effect** | `ADBE Ramp` | Linear/radial 2-point gradient |
| **Warp Stabilizer Effect** | `ADBE SubspaceStabilizer` | Subspace Warp Stabilizer |
| **Drop Shadow Effect** | `ADBE Drop Shadow` | Drop shadow filter |
| **Fast Box Blur** | `ADBE Box Blur2` | Modern fast box blur |

---

## 3. Keyframing & Easing Mathematics

Default linear keyframes look stiff. To apply organic, polished acceleration curves, configure temporal and spatial ease using `KeyframeEase`.

### Standard Cinematic Ease Function

```javascript
function applyCinematicEase(prop, speed, influence) {
    if (!prop || prop.numKeys < 1) return;
    speed = (typeof speed !== "undefined") ? speed : 0.0;
    influence = (typeof influence !== "undefined") ? influence : 75.0; // 75% influence

    var easeIn = new KeyframeEase(speed, influence);
    var easeOut = new KeyframeEase(speed, influence);

    for (var k = 1; k <= prop.numKeys; k++) {
        try {
            if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
                prop.setTemporalEaseAtKey(k, [easeIn, easeIn], [easeOut, easeOut]);
            } else if (prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                prop.setTemporalEaseAtKey(k, [easeIn, easeIn, easeIn], [easeOut, easeOut, easeOut]);
            } else {
                prop.setTemporalEaseAtKey(k, [easeIn], [easeOut]);
            }
        } catch(e) {
            // Handle properties that do not accept temporal easing
        }
    }
}
```

### Animating Scale with Spring Pop
```javascript
var scaleProp = layer.property("ADBE Transform Group").property("ADBE Scale");
scaleProp.setValueAtTime(0.0, [0, 0, 100]);
scaleProp.setValueAtTime(0.4, [108, 108, 100]); // slight overshoot
scaleProp.setValueAtTime(0.6, [100, 100, 100]); // settles
applyCinematicEase(scaleProp, 0, 80);
```

---

## 4. Typography & Text Styling via `TextDocument`

After Effects allows granular manipulation of text properties using `TextDocument`:

```javascript
var textLayer = comp.layers.addText("DYNAMIC HEADLINE");
var sourceTextProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
var textDoc = sourceTextProp.value;

// Typography formatting
textDoc.fontSize = 72;
textDoc.font = "HelveticaNeue-Bold";
textDoc.fillColor = [1.0, 1.0, 1.0]; // RGB 0.0 - 1.0
textDoc.applyFill = true;
textDoc.strokeColor = [0.08, 0.08, 0.08];
textDoc.strokeWidth = 2;
textDoc.applyStroke = false;
textDoc.tracking = 40; // Tracking in 1/1000 em
textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;

// Write updated document back to the property
sourceTextProp.setValue(textDoc);
```

---

## 5. Procedural Shape Building Pattern

To create vector shapes programmatically without user interaction:

```javascript
function createRoundedCard(comp, name, width, height, cornerRadius, fillColor, pos) {
    var shapeLayer = comp.layers.addShape();
    shapeLayer.name = name;
    shapeLayer.motionBlur = true;

    var contents = shapeLayer.property("ADBE Root Vectors Group");
    var group = contents.addProperty("ADBE Vector Group");
    var groupContents = group.property("ADBE Vectors Group");

    // Rectangle shape
    var rect = groupContents.addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([width, height]);
    rect.property("ADBE Vector Rect Roundness").setValue(cornerRadius);

    // Solid fill
    var fill = groupContents.addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(fillColor);

    // Transform
    shapeLayer.property("ADBE Transform Group").property("ADBE Position").setValue(pos);
    return shapeLayer;
}
```

---

## 6. Expression Rigging via Scripting

Injecting expressions into properties programmatically:

```javascript
// Ensure modern JavaScript expression engine
comp.expressionEngine = "javascript-1.0"; // or "extendscript"

var rotProp = layer.property("ADBE Transform Group").property("ADBE Rotate Z");
rotProp.expression = "time * 30 + Math.sin(time * 4) * 10;";

// Setting up a Slider Control Rig
var effects = layer.property("ADBE Effect Parade");
var slider = effects.addProperty("ADBE Slider Control");
slider.name = "Animation Damping";
slider.property("ADBE Slider Control-0001").setValue(15.0);
```

---

## 7. Render Queue Automation

Procedurally queue and render compositions:

```javascript
function queueAndRender(comp, outputPath, outputModuleTemplate) {
    var rq = app.project.renderQueue;
    var rqItem = rq.items.add(comp);

    // Configure Output Module
    if (rqItem.numOutputModules > 0) {
        var om = rqItem.outputModule(1);
        if (outputModuleTemplate) {
            try { om.applyTemplate(outputModuleTemplate); } catch(e) {}
        }
        om.file = new File(outputPath);
    }

    // Set render settings
    rqItem.applyTemplate("Best Settings");
    
    // Start rendering if desired
    // rq.render();
}
```

---

## 8. Best Practices & Scripting Gotchas

1. **1-Based Indexing**: All After Effects collections (`layers`, `items`, keyframe indices) are **1-indexed**, not 0-indexed. Accessing index 0 throws an out-of-range exception.
2. **Colors Range from 0.0 to 1.0**: ExtendScript colors are floats from `0.0` to `1.0`. Divide 8-bit RGB values (0–255) by `255.0`.
3. **Motion Blur Hierarchy**: Enabling motion blur on an individual layer (`layer.motionBlur = true`) has no visible effect unless the parent composition also has it enabled (`comp.motionBlur = true`).
4. **Time Values in Seconds**: All timeline properties take floating-point time values in **seconds**, not frames. To convert frame numbers to seconds: `var timeSec = frameNumber / comp.frameRate;`.
