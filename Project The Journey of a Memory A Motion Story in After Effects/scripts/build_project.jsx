// =============================================================================
// Project The Journey of a Memory – A Motion Story in After Effects
// build_project.jsx  –  ExtendScript AE project builder
// PDF Spec: 1920x1080, 30fps, 90-120s, 7 scenes
// Scenes: Memory reveal (masking), flag animation, long shadow text,
//         Illustrator camera object, footsteps path, ghostly memory, final
// =============================================================================

(function buildJourneyOfMemory() {
    if (!app.project) {
        app.newProject();
    }
    app.beginUndoGroup("Build: Journey of a Memory Project");

    var proj = app.project;

    // ─── FOLDERS ───────────────────────────────────────────────────────────────
    var folderScenes   = proj.items.addFolder("Scenes");
    var folderPrecomps = proj.items.addFolder("Pre-Comps");
    var folderAssets   = proj.items.addFolder("Assets");

    // ─── SETTINGS ──────────────────────────────────────────────────────────────
    var W = 1920, H = 1080, FPS = 30, DUR = 100;

    var easeIn  = new KeyframeEase(0.0, 80.0);
    var easeOut = new KeyframeEase(0.0, 80.0);

    function easeAll(prop) {
        if (!prop || prop.numKeys < 1) return;
        for (var k = 1; k <= prop.numKeys; k++) {
            var testCounts = [1, 2, 3];
            for (var i = 0; i < testCounts.length; i++) {
                var inArr = [], outArr = [];
                for (var j = 0; j < testCounts[i]; j++) {
                    inArr.push(easeIn);
                    outArr.push(easeOut);
                }
                try {
                    prop.setTemporalEaseAtKey(k, inArr, outArr);
                    break;
                } catch(e) {}
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 1 – Memory Reveal (Masking Split Effect, 0-15s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc1 = proj.items.addComp("Scene_01_MemoryReveal", W, H, 1.0, 15, FPS);
    sc1.parentFolder = folderScenes;
    sc1.bgColor = [0.0, 0.0, 0.0];

    // Vignette background
    var vigBg = sc1.layers.addSolid([0.05, 0.03, 0.08], "MemoryBG", W, H, 1.0);
    vigBg.moveToEnd();
    var vig = vigBg.Effects.addProperty("ADBE Ramp");
    vig.property("ADBE Ramp-0001").setValue([960, 540]);
    vig.property("ADBE Ramp-0002").setValue([0.3, 0.2, 0.4]);
    vig.property("ADBE Ramp-0003").setValue([960, 1080]);
    vig.property("ADBE Ramp-0004").setValue([0.0, 0.0, 0.0]);

    // Memory image placeholder (solid representing a photo)
    var memImg = sc1.layers.addSolid([0.6, 0.5, 0.4], "MemoryImage_Placeholder", 800, 600, 1.0);
    memImg.name = "MemoryImage";
    memImg.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

    // Apply two masks for split reveal (left and right halves)
    // Left mask – slides left to reveal from center
    var maskLeft = memImg.mask.addProperty("Mask");
    maskLeft.name = "MaskLeft";
    maskLeft.maskMode = MaskMode.ADD;
    var mlShape = maskLeft.property("ADBE Mask Shape");

    // Start: zero-width masks at center, animate to full left half
    // Using simple rectangle mask paths
    var mlPath0 = new Shape();
    mlPath0.vertices = [[-400, -300], [0, -300], [0, 300], [-400, 300]];
    mlPath0.closed = true;

    var mlPath1 = new Shape();
    mlPath1.vertices = [[-400, -300], [400, -300], [400, 300], [-400, 300]];
    mlPath1.closed = true;

    mlShape.setValueAtTime(0,  mlPath0);
    mlShape.setValueAtTime(5,  mlPath1);

    // Right mask
    var maskRight = memImg.mask.addProperty("Mask");
    maskRight.name = "MaskRight";
    maskRight.maskMode = MaskMode.ADD;
    var mrShape = maskRight.property("ADBE Mask Shape");

    var mrPath0 = new Shape();
    mrPath0.vertices = [[0, -300], [400, -300], [400, 300], [0, 300]];
    mrPath0.closed = true;

    var mrPath1 = new Shape();
    mrPath1.vertices = [[-400, -300], [400, -300], [400, 300], [-400, 300]];
    mrPath1.closed = true;

    mrShape.setValueAtTime(0,  mrPath0);
    mrShape.setValueAtTime(5,  mrPath1);

    // "A MEMORY BEGINS" title
    var memTitle = sc1.layers.addText("A MEMORY BEGINS");
    memTitle.name = "MemoryTitle";
    var mtTD = memTitle.property("ADBE Text Properties").property("ADBE Text Document").value;
    mtTD.resetCharStyle();
    mtTD.font = "Georgia-BoldItalic";
    mtTD.fontSize = 90;
    mtTD.fillColor = [1.0, 0.95, 0.8];
    mtTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    memTitle.property("ADBE Text Properties").property("ADBE Text Document").setValue(mtTD);
    memTitle.property("ADBE Transform Group").property("ADBE Position").setValue([960, 150]);
    var mtOp = memTitle.property("ADBE Transform Group").property("ADBE Opacity");
    mtOp.setValueAtTime(0,  0);
    mtOp.setValueAtTime(3,  100);
    mtOp.setValueAtTime(12, 100);
    mtOp.setValueAtTime(15, 0);
    easeAll(mtOp);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 2 – The Flag (Shape Layer Animation, 15-30s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc2 = proj.items.addComp("Scene_02_FlagAnimation", W, H, 1.0, 15, FPS);
    sc2.parentFolder = folderScenes;
    sc2.bgColor = [0.1, 0.1, 0.2];

    // Flag: Red stripes background
    var flagRed = sc2.layers.addShape();
    flagRed.name = "Flag_RedBG";
    var frGroup = flagRed.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var frRect  = frGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    frRect.property("ADBE Vector Rect Size").setValue([600, 400]);
    var frFill  = frGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    frFill.property("ADBE Vector Fill Color").setValue([0.8, 0.0, 0.0]);
    flagRed.property("ADBE Transform Group").property("ADBE Position").setValue([960, 500]);

    // White stripe (middle)
    var flagWhite = sc2.layers.addShape();
    flagWhite.name = "Flag_WhiteStripe";
    var fwGroup = flagWhite.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var fwRect  = fwGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    fwRect.property("ADBE Vector Rect Size").setValue([600, 30]);
    var fwFill  = fwGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fwFill.property("ADBE Vector Fill Color").setValue([1.0, 1.0, 1.0]);
    flagWhite.property("ADBE Transform Group").property("ADBE Position").setValue([960, 500]);

    // Blue canton (top-left)
    var flagBlue = sc2.layers.addShape();
    flagBlue.name = "Flag_BlueCanton";
    var fbGroup = flagBlue.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var fbRect  = fbGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    fbRect.property("ADBE Vector Rect Size").setValue([240, 210]);
    var fbFill  = fbGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    fbFill.property("ADBE Vector Fill Color").setValue([0.0, 0.1, 0.5]);
    flagBlue.property("ADBE Transform Group").property("ADBE Position").setValue([720, 395]);

    // Stars (5 circles in blue canton)
    for (var s = 0; s < 5; s++) {
        var star = sc2.layers.addShape();
        star.name = "Star_" + s;
        var sGroup = star.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var sEll   = sGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
        sEll.property("ADBE Vector Ellipse Size").setValue([18, 18]);
        var sFill  = sGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        sFill.property("ADBE Vector Fill Color").setValue([1.0, 1.0, 1.0]);
        star.property("ADBE Transform Group").property("ADBE Position").setValue([690 + s * 30, 390]);

        // Mask reveal for stars
        var sOp = star.property("ADBE Transform Group").property("ADBE Opacity");
        sOp.setValueAtTime(3 + s * 0.3, 0);
        sOp.setValueAtTime(4 + s * 0.3, 100);
        easeAll(sOp);
    }

    // "United States of America" text
    var flagText = sc2.layers.addText("United States of America");
    flagText.name = "FlagText";
    var ftTD = flagText.property("ADBE Text Properties").property("ADBE Text Document").value;
    ftTD.resetCharStyle();
    ftTD.font = "Georgia-Bold";
    ftTD.fontSize = 56;
    ftTD.fillColor = [1.0, 1.0, 1.0];
    ftTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    flagText.property("ADBE Text Properties").property("ADBE Text Document").setValue(ftTD);
    flagText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 750]);

    // Slide in the flag group
    var flagPos = flagRed.property("ADBE Transform Group").property("ADBE Position");
    flagPos.setValueAtTime(0, [-400, 500]);
    flagPos.setValueAtTime(3, [960, 500]);
    easeAll(flagPos);
    flagWhite.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(0, [-400, 500]);
    flagWhite.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(3, [960, 500]);
    easeAll(flagWhite.property("ADBE Transform Group").property("ADBE Position"));
    flagBlue.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(0, [-400+(-240), 395]);
    flagBlue.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(3, [720, 395]);
    easeAll(flagBlue.property("ADBE Transform Group").property("ADBE Position"));

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 3 – Motion Text / Long Shadow (30-45s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc3 = proj.items.addComp("Scene_03_LongShadow", W, H, 1.0, 15, FPS);
    sc3.parentFolder = folderScenes;
    sc3.bgColor = [0.05, 0.03, 0.1];

    // Dark gradient
    var sc3Bg = sc3.layers.addSolid([0.05, 0.03, 0.1], "SC3_BG", W, H, 1.0);
    sc3Bg.moveToEnd();
    var sc3Grad = sc3Bg.Effects.addProperty("ADBE Ramp");
    sc3Grad.property("ADBE Ramp-0001").setValue([960, 0]);
    sc3Grad.property("ADBE Ramp-0002").setValue([0.1, 0.0, 0.2]);
    sc3Grad.property("ADBE Ramp-0003").setValue([960, 1080]);
    sc3Grad.property("ADBE Ramp-0004").setValue([0.0, 0.0, 0.0]);

    // Main text
    var shadowText = sc3.layers.addText("JOURNEY BEGINS");
    shadowText.name = "ShadowMainText";
    var stTD = shadowText.property("ADBE Text Properties").property("ADBE Text Document").value;
    stTD.resetCharStyle();
    stTD.font = "Arial-BoldMT";
    stTD.fontSize = 110;
    stTD.fillColor = [1.0, 0.9, 0.0];
    stTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    shadowText.property("ADBE Text Properties").property("ADBE Text Document").setValue(stTD);
    shadowText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 440]);
    shadowText.motionBlur = true;

    // Long shadow effect simulation
    var shadowLayer = sc3.layers.addSolid([0.0, 0.0, 0.0], "LongShadow_Layer", W, H, 1.0);
    shadowLayer.name = "LongShadow_Effect";
    shadowLayer.moveToEnd();
    try {
        var shadowEff = shadowLayer.Effects.addProperty("ADBE Tile");
        if (shadowEff) {
            shadowEff.property(3).setValue(50);
        }
    } catch(e) {}

    // Drop shadow on main text for depth
    try {
        var dropShadow = shadowText.Effects.addProperty("ADBE Drop Shadow");
        if (dropShadow) {
            dropShadow.property("ADBE Drop Shadow-0001").setValue([0.0, 0.0, 0.0, 0.8]);
            dropShadow.property("ADBE Drop Shadow-0002").setValue(45);
            dropShadow.property("ADBE Drop Shadow-0003").setValue(400);
            dropShadow.property("ADBE Drop Shadow-0004").setValue(0);
            var distProp = dropShadow.property("ADBE Drop Shadow-0003");
            distProp.setValueAtTime(0,   600);
            distProp.setValueAtTime(10,  200);
            easeAll(distProp);
        }
    } catch(e) {}

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 4 – Camera Design Object (Illustrator-style in AE, 45-60s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc4 = proj.items.addComp("Scene_04_CameraObject", W, H, 1.0, 15, FPS);
    sc4.parentFolder = folderScenes;
    sc4.bgColor = [0.02, 0.02, 0.05];

    // Camera BODY
    var camBody = sc4.layers.addShape();
    camBody.name = "Camera_Body";
    var cbGroup = camBody.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var cbRect  = cbGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    cbRect.property("ADBE Vector Rect Size").setValue([400, 260]);
    cbRect.property("ADBE Vector Rect Roundness").setValue(20);
    var cbFill  = cbGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    cbFill.property("ADBE Vector Fill Color").setValue([0.15, 0.15, 0.15]);
    var cbStroke = cbGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    cbStroke.property("ADBE Vector Stroke Color").setValue([0.4, 0.4, 0.4]);
    cbStroke.property("ADBE Vector Stroke Width").setValue(3);
    camBody.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

    // Camera LENS
    var camLens = sc4.layers.addShape();
    camLens.name = "Camera_Lens";
    var clGroup  = camLens.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var clEll    = clGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
    clEll.property("ADBE Vector Ellipse Size").setValue([180, 180]);
    var clFill   = clGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    clFill.property("ADBE Vector Fill Color").setValue([0.05, 0.1, 0.4]);
    var clStroke = clGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    clStroke.property("ADBE Vector Stroke Color").setValue([0.6, 0.6, 0.6]);
    clStroke.property("ADBE Vector Stroke Width").setValue(6);
    camLens.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

    // Lens inner reflection
    var camGlass = sc4.layers.addShape();
    camGlass.name = "Camera_Glass";
    var cgGroup = camGlass.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var cgEll   = cgGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
    cgEll.property("ADBE Vector Ellipse Size").setValue([80, 80]);
    var cgFill  = cgGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    cgFill.property("ADBE Vector Fill Color").setValue([0.2, 0.3, 0.9]);
    camGlass.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);
    camGlass.property("ADBE Transform Group").property("ADBE Opacity").setValue(60);

    // Lens Zoom animation (scale keyframes)
    var lensScale = camLens.property("ADBE Transform Group").property("ADBE Scale");
    lensScale.setValueAtTime(0,   [60, 60]);
    lensScale.setValueAtTime(5,   [100, 100]);
    lensScale.setValueAtTime(10,  [80, 80]);
    lensScale.setValueAtTime(15,  [100, 100]);
    easeAll(lensScale);

    // Camera shutter button
    var camButton = sc4.layers.addShape();
    camButton.name = "Camera_ShutterBtn";
    var cbtGroup = camButton.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var cbtEll   = cbtGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
    cbtEll.property("ADBE Vector Ellipse Size").setValue([50, 50]);
    var cbtFill  = cbtGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    cbtFill.property("ADBE Vector Fill Color").setValue([0.8, 0.0, 0.0]);
    camButton.property("ADBE Transform Group").property("ADBE Position").setValue([1080, 440]);

    // Button press rotation
    var cbtRot = camButton.property("ADBE Transform Group").property("ADBE Rotate Z");
    cbtRot.setValueAtTime(0,    0);
    cbtRot.setValueAtTime(2,    15);
    cbtRot.setValueAtTime(2.2, -5);
    cbtRot.setValueAtTime(2.5,  0);
    easeAll(cbtRot);

    // Camera body position animation
    var camBodyPos = camBody.property("ADBE Transform Group").property("ADBE Position");
    camBodyPos.setValueAtTime(0,  [960, 1300]);
    camBodyPos.setValueAtTime(2,  [960, 540]);
    easeAll(camBodyPos);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 5 – Footsteps Across a Map (60-75s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc5 = proj.items.addComp("Scene_05_Footsteps", W, H, 1.0, 15, FPS);
    sc5.parentFolder = folderScenes;
    sc5.bgColor = [0.1, 0.08, 0.06];

    // Map background (sandy/earthy tone)
    var mapBg = sc5.layers.addSolid([0.6, 0.5, 0.35], "MapBackground", W, H, 1.0);
    mapBg.moveToEnd();
    // Add subtle texture
    try {
        var mapTex = mapBg.Effects.addProperty("ADBE Fractal Noise");
        if (mapTex) {
            mapTex.property("ADBE Fractal Noise-0004").setValue(1.5); // Contrast
            mapTex.property("ADBE Fractal Noise-0003").setValue(0.3); // Brightness
        }
    } catch(e) {}

    // Map grid lines
    for (var mg = 0; mg < 6; mg++) {
        var mGrid = sc5.layers.addShape();
        mGrid.name = "MapGrid_H" + mg;
        var mgGroup = mGrid.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var mgRect  = mgGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
        mgRect.property("ADBE Vector Rect Size").setValue([W, 1]);
        var mgStroke = mgGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
        mgStroke.property("ADBE Vector Stroke Color").setValue([0.4, 0.3, 0.2]);
        mgStroke.property("ADBE Vector Stroke Width").setValue(1);
        mGrid.property("ADBE Transform Group").property("ADBE Position").setValue([960, 180 * mg]);
        mGrid.property("ADBE Transform Group").property("ADBE Opacity").setValue(30);
    }

    // Footprints (5 pairs, animated across map)
    var footprintPositions = [
        [300, 700], [500, 650], [700, 600], [950, 580], [1200, 560],
        [1450, 540], [1680, 520]
    ];

    for (var fp = 0; fp < footprintPositions.length; fp++) {
        var foot = sc5.layers.addShape();
        foot.name = "Footprint_" + (fp + 1);
        var fGroup  = foot.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var fEll    = fGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
        fEll.property("ADBE Vector Ellipse Size").setValue([30, 45]);
        var fFill   = fGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        fFill.property("ADBE Vector Fill Color").setValue([0.2, 0.15, 0.1]);
        var fRot = (fp % 2 === 0) ? 15 : -15;
        foot.property("ADBE Transform Group").property("ADBE Position").setValue(
            footprintPositions[fp]
        );
        foot.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(fRot);

        // Fade in one by one
        var fOp = foot.property("ADBE Transform Group").property("ADBE Opacity");
        fOp.setValueAtTime(fp * 1.5,       0);
        fOp.setValueAtTime(fp * 1.5 + 0.5, 100);
        fOp.setValueAtTime(14,              100);
        fOp.setValueAtTime(15,              0);
        easeAll(fOp);
    }

    // "FOOTSTEPS ACROSS TIME" label
    var footLabel = sc5.layers.addText("FOOTSTEPS ACROSS TIME");
    footLabel.name = "FootstepsLabel";
    var flTD = footLabel.property("ADBE Text Properties").property("ADBE Text Document").value;
    flTD.resetCharStyle();
    flTD.font = "Georgia-BoldItalic";
    flTD.fontSize = 72;
    flTD.fillColor = [0.1, 0.05, 0.0];
    flTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    footLabel.property("ADBE Text Properties").property("ADBE Text Document").setValue(flTD);
    footLabel.property("ADBE Transform Group").property("ADBE Position").setValue([960, 180]);
    var flOp = footLabel.property("ADBE Transform Group").property("ADBE Opacity");
    flOp.setValueAtTime(0, 0);
    flOp.setValueAtTime(2, 100);
    easeAll(flOp);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 6 – Ghostly Memory (Surreal Effect, 75-90s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc6 = proj.items.addComp("Scene_06_GhostlyMemory", W, H, 1.0, 15, FPS);
    sc6.parentFolder = folderScenes;
    sc6.bgColor = [0.0, 0.0, 0.0];

    // Dark atmospheric background
    var ghostBg = sc6.layers.addSolid([0.03, 0.02, 0.05], "GhostBG", W, H, 1.0);
    ghostBg.moveToEnd();
    var ghostGrad = ghostBg.Effects.addProperty("ADBE Ramp");
    ghostGrad.property("ADBE Ramp-0001").setValue([960, 400]);
    ghostGrad.property("ADBE Ramp-0002").setValue([0.1, 0.05, 0.2]);
    ghostGrad.property("ADBE Ramp-0003").setValue([960, 1080]);
    ghostGrad.property("ADBE Ramp-0004").setValue([0.0, 0.0, 0.0]);

    // Ghost silhouette (shape layer representing a figure)
    var ghost = sc6.layers.addShape();
    ghost.name = "GhostFigure";

    // Ghost head
    var ghostHead = ghost.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    ghostHead.name = "GhostHead";
    var ghEll  = ghostHead.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
    ghEll.property("ADBE Vector Ellipse Size").setValue([100, 100]);
    var ghFill = ghostHead.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    ghFill.property("ADBE Vector Fill Color").setValue([0.8, 0.8, 1.0]);
    ghost.property("ADBE Transform Group").property("ADBE Position").setValue([960, 400]);

    // Ghost body
    var ghostBodyS = ghost.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    ghostBodyS.name = "GhostBody";
    var gbRect  = ghostBodyS.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    gbRect.property("ADBE Vector Rect Size").setValue([80, 200]);
    var gbFill  = ghostBodyS.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    gbFill.property("ADBE Vector Fill Color").setValue([0.7, 0.7, 0.9]);

    // Apply ghostly effects
    try {
        var fastBlur = ghost.Effects.addProperty("ADBE Box Blur2");
        if (fastBlur) {
            var blurProp = fastBlur.property("ADBE Box Blur2-0001");
            blurProp.setValueAtTime(0,   0);
            blurProp.setValueAtTime(10,  15);
            blurProp.setValueAtTime(15,  30);
            easeAll(blurProp);
        }
    } catch(e) {}

    // Turbulent Displace for eerie distortion
    try {
        var turbDisplace = ghost.Effects.addProperty("ADBE Turbulent Displace");
        if (turbDisplace) {
            turbDisplace.property("ADBE Turbulent Displace-0001").setValue(1); // Displace type
            var tdAmt = turbDisplace.property("ADBE Turbulent Displace-0002");
            tdAmt.setValueAtTime(0,  20);
            tdAmt.setValueAtTime(15, 80);
            easeAll(tdAmt);
            // Animate evolution for movement
            turbDisplace.property("ADBE Turbulent Displace-0007").expression = "time * 50;";
        }
    } catch(e) {}

    // Ghost position (floating upward)
    var ghostPos = ghost.property("ADBE Transform Group").property("ADBE Position");
    ghostPos.setValueAtTime(0,   [960, 600]);
    ghostPos.setValueAtTime(15,  [960, 350]);
    easeAll(ghostPos);

    // Ghost opacity (100% → 0%)
    var ghostOp = ghost.property("ADBE Transform Group").property("ADBE Opacity");
    ghostOp.setValueAtTime(0,   100);
    ghostOp.setValueAtTime(12,  60);
    ghostOp.setValueAtTime(15,  0);
    easeAll(ghostOp);

    // "THE MEMORY FADES" text
    var ghostText = sc6.layers.addText("THE MEMORY FADES...");
    ghostText.name = "GhostText";
    var gtTD = ghostText.property("ADBE Text Properties").property("ADBE Text Document").value;
    gtTD.resetCharStyle();
    gtTD.font = "Georgia-Italic";
    gtTD.fontSize = 72;
    gtTD.fillColor = [0.7, 0.6, 1.0];
    gtTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    ghostText.property("ADBE Text Properties").property("ADBE Text Document").setValue(gtTD);
    ghostText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 820]);
    var gtOp = ghostText.property("ADBE Transform Group").property("ADBE Opacity");
    gtOp.setValueAtTime(0,  0);
    gtOp.setValueAtTime(3,  100);
    gtOp.setValueAtTime(12, 100);
    gtOp.setValueAtTime(15, 0);
    easeAll(gtOp);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 7 – Final Composite & End Card (90-100s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc7 = proj.items.addComp("Scene_07_FinalComposite", W, H, 1.0, 10, FPS);
    sc7.parentFolder = folderScenes;
    sc7.bgColor = [0.0, 0.0, 0.0];

    var finalBg = sc7.layers.addSolid([0.0, 0.0, 0.05], "FinalBG", W, H, 1.0);
    finalBg.moveToEnd();
    var fBgGrad = finalBg.Effects.addProperty("ADBE Ramp");
    fBgGrad.property("ADBE Ramp-0001").setValue([960, 0]);
    fBgGrad.property("ADBE Ramp-0002").setValue([0.1, 0.05, 0.2]);
    fBgGrad.property("ADBE Ramp-0003").setValue([960, 1080]);
    fBgGrad.property("ADBE Ramp-0004").setValue([0.0, 0.0, 0.0]);

    var finalTitle = sc7.layers.addText("THE JOURNEY\nOF A MEMORY");
    finalTitle.name = "FinalTitle";
    var ftTD2 = finalTitle.property("ADBE Text Properties").property("ADBE Text Document").value;
    ftTD2.resetCharStyle();
    ftTD2.font = "Georgia-BoldItalic";
    ftTD2.fontSize = 110;
    ftTD2.fillColor = [1.0, 0.95, 0.8];
    ftTD2.justification = ParagraphJustification.CENTER_JUSTIFY;
    finalTitle.property("ADBE Text Properties").property("ADBE Text Document").setValue(ftTD2);
    finalTitle.property("ADBE Transform Group").property("ADBE Position").setValue([960, 440]);
    var ftOp2 = finalTitle.property("ADBE Transform Group").property("ADBE Opacity");
    ftOp2.setValueAtTime(0, 0);
    ftOp2.setValueAtTime(2, 100);
    easeAll(ftOp2);

    var finalSub = sc7.layers.addText("A Motion Story in After Effects");
    finalSub.name = "FinalSubtitle";
    var fsTD = finalSub.property("ADBE Text Properties").property("ADBE Text Document").value;
    fsTD.resetCharStyle();
    fsTD.font = "Georgia-Italic";
    fsTD.fontSize = 52;
    fsTD.fillColor = [0.7, 0.6, 1.0];
    fsTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    finalSub.property("ADBE Text Properties").property("ADBE Text Document").setValue(fsTD);
    finalSub.property("ADBE Transform Group").property("ADBE Position").setValue([960, 650]);
    var fsOp = finalSub.property("ADBE Transform Group").property("ADBE Opacity");
    fsOp.setValueAtTime(1, 0);
    fsOp.setValueAtTime(3, 100);
    easeAll(fsOp);

    // ─────────────────────────────────────────────────────────────────────────
    // MASTER COMPOSITION (100s)
    // ─────────────────────────────────────────────────────────────────────────
    var masterComp = proj.items.addComp("MASTER_JourneyOfMemory", W, H, 1.0, DUR, FPS);
    masterComp.parentFolder = folderScenes;

    var l1 = masterComp.layers.add(sc1, 15); l1.startTime = 0;  l1.name = "SC1_MemoryReveal";
    var l2 = masterComp.layers.add(sc2, 15); l2.startTime = 15; l2.name = "SC2_FlagAnimation";
    var l3 = masterComp.layers.add(sc3, 15); l3.startTime = 30; l3.name = "SC3_LongShadow";
    var l4 = masterComp.layers.add(sc4, 15); l4.startTime = 45; l4.name = "SC4_Camera";
    var l5 = masterComp.layers.add(sc5, 15); l5.startTime = 60; l5.name = "SC5_Footsteps";
    var l6 = masterComp.layers.add(sc6, 15); l6.startTime = 75; l6.name = "SC6_GhostlyMemory";
    var l7 = masterComp.layers.add(sc7, 10); l7.startTime = 90; l7.name = "SC7_FinalComposite";

    // Color grading adjustment layer
    var colorAdj = masterComp.layers.addSolid([0,0,0], "ColorGrading", W, H, 1.0);
    colorAdj.adjustmentLayer = true;
    colorAdj.name = "LumetriColor_Master";
    try {
        var lumetri = colorAdj.Effects.addProperty("ADBE Lumetri");
        if (lumetri) {
            // Cinematic warm memory tone
            lumetri.property("ADBE Lumetri-0001").property("ADBE Lumetri Exposure").setValue(0.1);
            lumetri.property("ADBE Lumetri-0001").property("ADBE Lumetri Contrast").setValue(10);
            lumetri.property("ADBE Lumetri-0001").property("ADBE Lumetri Vibrance").setValue(15);
        }
    } catch(e) {}

    // Camera push-in drift
    var camNull = masterComp.layers.addNull();
    camNull.name = "CameraNull_Drift";
    var camS = camNull.property("ADBE Transform Group").property("ADBE Scale");
    camS.setValueAtTime(0,   [100, 100]);
    camS.setValueAtTime(DUR, [102.5, 102.5]);
    easeAll(camS);

    // ─── RENDER QUEUE ─────────────────────────────────────────────────────────
    var rqItem = proj.renderQueue.items.add(masterComp);
    rqItem.outputModules[1].applyTemplate("Lossless");
    rqItem.outputModules[1].file = new File(
        "c:/Users/Admin/Documents/GitHub/AE/Project The Journey of a Memory A Motion Story in After Effects/Final_JourneyOfMemory.avi"
    );

    proj.save(new File(
        "c:/Users/Admin/Documents/GitHub/AE/Project The Journey of a Memory A Motion Story in After Effects/Journey_Of_Memory_MotionStory.aep"
    ));

    app.endUndoGroup();
    // Project built successfully
})();
