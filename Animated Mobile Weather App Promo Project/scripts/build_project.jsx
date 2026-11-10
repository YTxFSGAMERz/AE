// Adobe After Effects ExtendScript
// Project: Animated Mobile Weather App Promo
// Master Builder Script - Generates full 60-second composition (1920x1080 @ 30fps)
// Conforming to course specification: Final_WeatherApp_Promo.aep

(function() {
    app.beginUndoGroup("Build Animated Mobile Weather App Promo");

    // =========================================================================
    // 1. PROJECT & COMPOSITION INITIALIZATION
    // =========================================================================
    var project = app.project;
    if (!project) {
        project = app.newProject();
    }

    var compWidth = 1920;
    var compHeight = 1080;
    var compPixelAspect = 1.0;
    var compDuration = 60.0; // 60.0 Seconds (1801 Frames @ 30fps)
    var compFrameRate = 30.0;
    var compName = "Weather App Promo";

    var mainComp = project.items.addComp(
        compName,
        compWidth,
        compHeight,
        compPixelAspect,
        compDuration,
        compFrameRate
    );
    mainComp.motionBlur = true; // Enable motion blur globally

    // Base paths for project media
    var projectRoot = "C:/Users/Admin/Documents/GitHub/AE/Animated Mobile Weather App Promo Project";
    var footagePath = projectRoot + "/assets/footage/presenter_greenscreen.mp4";
    var phoneFramePath = projectRoot + "/assets/images/phone_frame.png";
    var skyDayPath = projectRoot + "/assets/images/sky_day.jpg";
    var skyNightPath = projectRoot + "/assets/images/sky_night.jpg";
    var cloudTexturePath = projectRoot + "/assets/images/cloud_texture.png";
    var audioTrackPath = projectRoot + "/assets/audio/promo_soundtrack.mp3";

    // =========================================================================
    // HELPER FUNCTIONS (ExtendScript / ECMAScript 3 Compliant)
    // =========================================================================

    // Apply Easy Ease (Speed = 0, Influence = 75%)
    function applyEasyEase(prop) {
        if (!prop || prop.numKeys < 1) return;
        var easeIn = new KeyframeEase(0.0, 75.0);
        var easeOut = new KeyframeEase(0.0, 75.0);
        for (var k = 1; k <= prop.numKeys; k++) {
            try {
                if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL || prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
                    var easesIn = [easeIn, easeIn];
                    var easesOut = [easeOut, easeOut];
                    if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
                        easesIn.push(easeIn);
                        easesOut.push(easeOut);
                    }
                    prop.setTemporalEaseAtKey(k, easesIn, easesOut);
                } else {
                    prop.setTemporalEaseAtKey(k, [easeIn], [easeOut]);
                }
            } catch(e) {}
        }
    }

    // Safely add Gradient Ramp (ADBE Ramp)
    function applyGradientRamp(layer, startPt, startCol, endPt, endCol, rampType) {
        try {
            var ramp = layer.property("ADBE Effect Parade").addProperty("ADBE Ramp");
            if (ramp) {
                ramp.property("ADBE Ramp-0001").setValue(startPt);
                ramp.property("ADBE Ramp-0002").setValue(startCol);
                ramp.property("ADBE Ramp-0003").setValue(endPt);
                ramp.property("ADBE Ramp-0004").setValue(endCol);
                ramp.property("ADBE Ramp-0005").setValue(rampType || 1); // 1 = Linear, 2 = Radial
            }
        } catch(e) {}
    }

    // Safely add Drop Shadow (ADBE Drop Shadow)
    function applyDropShadow(layer, distance, softness, opacity, angle) {
        try {
            var ds = layer.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
            if (ds) {
                ds.property("ADBE Drop Shadow-0002").setValue(opacity || 100);
                ds.property("ADBE Drop Shadow-0003").setValue(angle || 135);
                ds.property("ADBE Drop Shadow-0004").setValue(distance || 25);
                ds.property("ADBE Drop Shadow-0005").setValue(softness || 40);
            }
        } catch(e) {}
    }

    // Safely add Glow (ADBE Glo2)
    function applyGlow(layer, radius, intensity, threshold) {
        try {
            var glow = layer.property("ADBE Effect Parade").addProperty("ADBE Glo2");
            if (glow) {
                glow.property("ADBE Glo2-0001").setValue(threshold || 50);
                glow.property("ADBE Glo2-0002").setValue(radius || 40);
                glow.property("ADBE Glo2-0003").setValue(intensity || 1.2);
            }
        } catch(e) {}
    }

    // Helper to safely import a media file
    function safeImportFile(filePath) {
        try {
            var f = new File(filePath);
            if (f.exists) {
                var io = new ImportOptions(f);
                return project.importFile(io);
            }
        } catch(e) {}
        return null;
    }

    // =========================================================================
    // STEP 7A: BACKGROUND MUSIC & AUDIO SYNCHRONIZATION (00:00 - 01:00)
    // =========================================================================
    var audioItem = safeImportFile(audioTrackPath);
    if (audioItem) {
        var audioLayer = mainComp.layers.add(audioItem);
        audioLayer.name = "01_Audio_Soundtrack";
        audioLayer.startTime = 0.0;
        audioLayer.inPoint = 0.0;
        audioLayer.outPoint = 60.0;

        // Audio levels fade in and out smoothly
        try {
            var audLevels = audioLayer.property("ADBE Audio Group").property("ADBE Audio Levels - 0001");
            audLevels.setValueAtTime(0.0, [-24.0, -24.0]);
            audLevels.setValueAtTime(1.5, [0.0, 0.0]);
            audLevels.setValueAtTime(57.5, [0.0, 0.0]);
            audLevels.setValueAtTime(60.0, [-48.0, -48.0]);
            applyEasyEase(audLevels);
        } catch(e) {}
    }

    // =========================================================================
    // STAGE BACKDROP (00:00 - 01:00)
    // =========================================================================
    var bgSolid = mainComp.layers.addSolid(
        [0.05, 0.07, 0.12], // Deep Charcoal / Slate Navy
        "02_Stage_Background",
        compWidth,
        compHeight,
        1.0,
        compDuration
    );
    bgSolid.moveToEnd();
    applyGradientRamp(
        bgSolid,
        [960, 0],
        [0.08, 0.12, 0.20, 1.0], // Top soft twilight navy
        [960, 1080],
        [0.03, 0.04, 0.07, 1.0], // Bottom deep obsidian slate
        1
    );
    bgSolid.locked = true;

    // =========================================================================
    // STEP 2: CREATE INTRO TRANSITION (00:00 - 00:08)
    // Shape layers (rectangles & diagonal chevrons) sliding in with motion blur
    // =========================================================================
    var introGroup = [];

    // Intro Shape 1: Cyan/Sky Blue Diagonal Transition Slab
    var slab1 = mainComp.layers.addShape();
    slab1.name = "03a_Intro_Slab_SkyBlue";
    slab1.motionBlur = true;
    slab1.inPoint = 0.0;
    slab1.outPoint = 8.5;

    var s1Contents = slab1.property("ADBE Root Vectors Group");
    var s1Group = s1Contents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var s1Rect = s1Group.addProperty("ADBE Vector Shape - Rect");
    s1Rect.property("ADBE Vector Rect Size").setValue([2600, 480]);
    s1Rect.property("ADBE Vector Rect Roundness").setValue(16);
    var s1Fill = s1Group.addProperty("ADBE Vector Graphic - Fill");
    s1Fill.property("ADBE Vector Fill Color").setValue([0.22, 0.74, 0.97, 1.0]); // Sky Blue #38BDF8

    var s1Trans = slab1.property("ADBE Transform Group");
    s1Trans.property("ADBE Rotate Z").setValue(-22); // Diagonal sweep
    var s1Pos = s1Trans.property("ADBE Position");
    var s1Op = s1Trans.property("ADBE Opacity");

    s1Pos.setValueAtTime(0.0, [-1200, 300]);
    s1Pos.setValueAtTime(1.8, [960, 540]);
    s1Pos.setValueAtTime(6.0, [960, 540]);
    s1Pos.setValueAtTime(8.0, [3200, 800]);

    s1Op.setValueAtTime(0.0, 0);
    s1Op.setValueAtTime(0.8, 95);
    s1Op.setValueAtTime(6.5, 95);
    s1Op.setValueAtTime(8.0, 0);

    applyEasyEase(s1Pos);
    applyEasyEase(s1Op);

    // Intro Shape 2: Deep Indigo Transition Slab (Staggered offset)
    var slab2 = mainComp.layers.addShape();
    slab2.name = "03b_Intro_Slab_Indigo";
    slab2.motionBlur = true;
    slab2.inPoint = 0.2;
    slab2.outPoint = 8.5;

    var s2Contents = slab2.property("ADBE Root Vectors Group");
    var s2Group = s2Contents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var s2Rect = s2Group.addProperty("ADBE Vector Shape - Rect");
    s2Rect.property("ADBE Vector Rect Size").setValue([2600, 400]);
    s2Rect.property("ADBE Vector Rect Roundness").setValue(16);
    var s2Fill = s2Group.addProperty("ADBE Vector Graphic - Fill");
    s2Fill.property("ADBE Vector Fill Color").setValue([0.38, 0.40, 0.94, 1.0]); // Indigo #6366F1

    var s2Trans = slab2.property("ADBE Transform Group");
    s2Trans.property("ADBE Rotate Z").setValue(-22);
    var s2Pos = s2Trans.property("ADBE Position");
    var s2Op = s2Trans.property("ADBE Opacity");

    s2Pos.setValueAtTime(0.3, [3200, 800]);
    s2Pos.setValueAtTime(2.2, [960, 540]);
    s2Pos.setValueAtTime(6.0, [960, 540]);
    s2Pos.setValueAtTime(8.2, [-1200, 300]);

    s2Op.setValueAtTime(0.3, 0);
    s2Op.setValueAtTime(1.0, 90);
    s2Op.setValueAtTime(6.5, 90);
    s2Op.setValueAtTime(8.2, 0);

    applyEasyEase(s2Pos);
    applyEasyEase(s2Op);

    // Intro Shape 3: Amber Energy Burst Circle (Center Pop)
    var burstCircle = mainComp.layers.addShape();
    burstCircle.name = "03c_Intro_Burst_Circle";
    burstCircle.motionBlur = true;
    burstCircle.inPoint = 0.5;
    burstCircle.outPoint = 8.0;

    var bcContents = burstCircle.property("ADBE Root Vectors Group");
    var bcGroup = bcContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var bcEllipse = bcGroup.addProperty("ADBE Vector Shape - Ellipse");
    bcEllipse.property("ADBE Vector Ellipse Size").setValue([320, 320]);
    var bcFill = bcGroup.addProperty("ADBE Vector Graphic - Fill");
    bcFill.property("ADBE Vector Fill Color").setValue([0.96, 0.62, 0.04, 0.85]); // Amber #F59E0B

    var bcTrans = burstCircle.property("ADBE Transform Group");
    bcTrans.property("ADBE Position").setValue([960, 540]);
    var bcScale = bcTrans.property("ADBE Scale");
    var bcOp = bcTrans.property("ADBE Opacity");

    bcScale.setValueAtTime(0.5, [0, 0]);
    bcScale.setValueAtTime(2.0, [140, 140]);
    bcScale.setValueAtTime(2.4, [100, 100]);
    bcScale.setValueAtTime(6.0, [100, 100]);
    bcScale.setValueAtTime(7.8, [280, 280]);

    bcOp.setValueAtTime(0.5, 0);
    bcOp.setValueAtTime(1.5, 80);
    bcOp.setValueAtTime(6.2, 80);
    bcOp.setValueAtTime(7.8, 0);

    applyEasyEase(bcScale);
    applyEasyEase(bcOp);

    // =========================================================================
    // STEP 3: LOGO REVEAL (00:08 - 00:16)
    // Masked reveal with Rectangle Tool, Scale pop, Rotation flair, and Glow
    // =========================================================================

    // Vector Weather App Logo: Sun + Cloud Badge
    var logoLayer = mainComp.layers.addShape();
    logoLayer.name = "04a_Logo_SunCloud_Badge";
    logoLayer.motionBlur = true;
    logoLayer.inPoint = 8.0;
    logoLayer.outPoint = 16.5;

    var lContents = logoLayer.property("ADBE Root Vectors Group");

    // Radiant Sun Group
    var sunGroup = lContents.addProperty("ADBE Vector Group");
    sunGroup.name = "Sun_Core";
    var sunVecs = sunGroup.property("ADBE Vectors Group");
    var sunCircle = sunVecs.addProperty("ADBE Vector Shape - Ellipse");
    sunCircle.property("ADBE Vector Ellipse Size").setValue([140, 140]);
    sunCircle.property("ADBE Vector Ellipse Position").setValue([30, -30]);
    var sunFill = sunVecs.addProperty("ADBE Vector Graphic - Fill");
    sunFill.property("ADBE Vector Fill Color").setValue([1.0, 0.76, 0.03, 1.0]); // Sun Golden Glow

    // Cloud Group (Interlocking organic cloud shapes)
    var cloudGroup = lContents.addProperty("ADBE Vector Group");
    cloudGroup.name = "Cloud_Body";
    var cVecs = cloudGroup.property("ADBE Vectors Group");

    var puff1 = cVecs.addProperty("ADBE Vector Shape - Ellipse");
    puff1.property("ADBE Vector Ellipse Size").setValue([150, 150]);
    puff1.property("ADBE Vector Ellipse Position").setValue([-30, 20]);

    var puff2 = cVecs.addProperty("ADBE Vector Shape - Ellipse");
    puff2.property("ADBE Vector Ellipse Size").setValue([120, 120]);
    puff2.property("ADBE Vector Ellipse Position").setValue([50, 30]);

    var puff3 = cVecs.addProperty("ADBE Vector Shape - Rect");
    puff3.property("ADBE Vector Rect Size").setValue([180, 70]);
    puff3.property("ADBE Vector Rect Position").setValue([10, 55]);
    puff3.property("ADBE Vector Rect Roundness").setValue(35);

    var cloudFill = cVecs.addProperty("ADBE Vector Graphic - Fill");
    cloudFill.property("ADBE Vector Fill Color").setValue([0.94, 0.96, 1.0, 1.0]); // Crisp Cloud White

    // Logo Mask: Rectangle Mask Path Animation to reveal it
    try {
        var logoMask = logoLayer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        logoMask.maskMode = MaskMode.ADD;
        var maskShapeProp = logoMask.property("ADBE Mask Shape");

        // Keyframe mask path from height 0 (hidden) to fully open
        var closedShape = new Shape();
        closedShape.vertices = [[-160, 140], [160, 140], [160, 140], [-160, 140]];
        closedShape.closed = true;

        var openShape = new Shape();
        openShape.vertices = [[-160, -140], [160, -140], [160, 140], [-160, 140]];
        openShape.closed = true;

        maskShapeProp.setValueAtTime(8.2, closedShape);
        maskShapeProp.setValueAtTime(9.6, openShape);
        applyEasyEase(maskShapeProp);
    } catch(errMask) {}

    // Logo Transform Animation: Scale pop + Rotation flair
    var lTrans = logoLayer.property("ADBE Transform Group");
    lTrans.property("ADBE Position").setValue([960, 380]);
    var lScale = lTrans.property("ADBE Scale");
    var lRot = lTrans.property("ADBE Rotate Z");
    var lOp = lTrans.property("ADBE Opacity");

    lScale.setValueAtTime(8.0, [0, 0]);
    lScale.setValueAtTime(9.4, [118, 118]);
    lScale.setValueAtTime(9.8, [100, 100]);
    lScale.setValueAtTime(15.2, [100, 100]);
    lScale.setValueAtTime(16.0, [80, 80]);

    lRot.setValueAtTime(8.0, -35);
    lRot.setValueAtTime(9.8, 0);

    lOp.setValueAtTime(8.0, 0);
    lOp.setValueAtTime(8.8, 100);
    lOp.setValueAtTime(15.2, 100);
    lOp.setValueAtTime(16.0, 0);

    applyEasyEase(lScale);
    applyEasyEase(lRot);
    applyEasyEase(lOp);
    applyGlow(logoLayer, 45, 1.3, 40);
    applyDropShadow(logoLayer, 18, 30, 40, 135);

    // Logo Title Text: "AeroWeather"
    var logoTitle = mainComp.layers.addText("AeroWeather");
    logoTitle.name = "04b_Logo_Title_Text";
    logoTitle.motionBlur = true;
    logoTitle.inPoint = 8.4;
    logoTitle.outPoint = 16.5;

    var ltProp = logoTitle.property("ADBE Text Properties").property("ADBE Text Document");
    var ltDoc = ltProp.value;
    ltDoc.fontSize = 72;
    ltDoc.fillColor = [1.0, 1.0, 1.0];
    ltDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    ltProp.setValue(ltDoc);

    var ltTrans = logoTitle.property("ADBE Transform Group");
    var ltPos = ltTrans.property("ADBE Position");
    var ltOp = ltTrans.property("ADBE Opacity");

    ltPos.setValueAtTime(8.4, [960, 520]);
    ltPos.setValueAtTime(9.8, [960, 485]);
    ltPos.setValueAtTime(15.2, [960, 485]);
    ltPos.setValueAtTime(16.0, [960, 460]);

    ltOp.setValueAtTime(8.4, 0);
    ltOp.setValueAtTime(9.5, 100);
    ltOp.setValueAtTime(15.2, 100);
    ltOp.setValueAtTime(16.0, 0);

    applyEasyEase(ltPos);
    applyEasyEase(ltOp);

    // Logo Subtitle: "Intelligent Hyperlocal Forecasts"
    var logoSub = mainComp.layers.addText("Intelligent Hyperlocal Forecasts");
    logoSub.name = "04c_Logo_Subtitle_Text";
    logoSub.motionBlur = true;
    logoSub.inPoint = 8.8;
    logoSub.outPoint = 16.5;

    var lsProp = logoSub.property("ADBE Text Properties").property("ADBE Text Document");
    var lsDoc = lsProp.value;
    lsDoc.fontSize = 24;
    lsDoc.fillColor = [0.58, 0.64, 0.72]; // Slate Grey
    lsDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    lsProp.setValue(lsDoc);

    var lsTrans = logoSub.property("ADBE Transform Group");
    var lsPos = lsTrans.property("ADBE Position");
    var lsOp = lsTrans.property("ADBE Opacity");

    lsPos.setValueAtTime(8.8, [960, 545]);
    lsPos.setValueAtTime(10.0, [960, 525]);
    lsPos.setValueAtTime(15.2, [960, 525]);
    lsPos.setValueAtTime(16.0, [960, 510]);

    lsOp.setValueAtTime(8.8, 0);
    lsOp.setValueAtTime(9.8, 90);
    lsOp.setValueAtTime(15.2, 90);
    lsOp.setValueAtTime(16.0, 0);

    applyEasyEase(lsPos);
    applyEasyEase(lsOp);

    // =========================================================================
    // STEP 4: MESSAGE POP-UP (00:11 - 00:16)
    // Speech bubble shape layer with bouncy position and opacity
    // =========================================================================
    var bubbleLayer = mainComp.layers.addShape();
    bubbleLayer.name = "05a_Speech_Bubble_Shape";
    bubbleLayer.motionBlur = true;
    bubbleLayer.inPoint = 11.0;
    bubbleLayer.outPoint = 16.5;

    var bContents = bubbleLayer.property("ADBE Root Vectors Group");
    var bGroup = bContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");

    // Rounded rectangle bubble body
    var bRect = bGroup.addProperty("ADBE Vector Shape - Rect");
    bRect.property("ADBE Vector Rect Size").setValue([520, 110]);
    bRect.property("ADBE Vector Rect Roundness").setValue(28);

    // Pointer notch triangle at top
    var bNotch = bGroup.addProperty("ADBE Vector Shape - Star");
    bNotch.property("ADBE Vector Star Type").setValue(2); // Polygon
    bNotch.property("ADBE Vector Star Points").setValue(3);
    bNotch.property("ADBE Vector Star Outer Radius").setValue(22);
    bNotch.property("ADBE Vector Star Position").setValue([0, -55]);

    var bFill = bGroup.addProperty("ADBE Vector Graphic - Fill");
    bFill.property("ADBE Vector Fill Color").setValue([0.98, 0.99, 1.0, 0.95]); // Translucent crisp white

    applyDropShadow(bubbleLayer, 20, 35, 30, 90);

    var bTrans = bubbleLayer.property("ADBE Transform Group");
    var bPos = bTrans.property("ADBE Position");
    var bScale = bTrans.property("ADBE Scale");
    var bOp = bTrans.property("ADBE Opacity");

    bPos.setValueAtTime(11.0, [960, 710]);
    bPos.setValueAtTime(12.0, [960, 660]);
    bPos.setValueAtTime(15.2, [960, 660]);
    bPos.setValueAtTime(16.0, [960, 630]);

    bScale.setValueAtTime(11.0, [0, 0]);
    bScale.setValueAtTime(11.8, [110, 110]);
    bScale.setValueAtTime(12.2, [100, 100]);
    bScale.setValueAtTime(15.2, [100, 100]);
    bScale.setValueAtTime(16.0, [80, 80]);

    bOp.setValueAtTime(11.0, 0);
    bOp.setValueAtTime(11.6, 100);
    bOp.setValueAtTime(15.2, 100);
    bOp.setValueAtTime(16.0, 0);

    applyEasyEase(bPos);
    applyEasyEase(bScale);
    applyEasyEase(bOp);

    // Message Pop-up Text: "Welcome to the Weather App!"
    var bubbleText = mainComp.layers.addText("Welcome to the Weather App!");
    bubbleText.name = "05b_Message_Text";
    bubbleText.motionBlur = true;
    bubbleText.inPoint = 11.2;
    bubbleText.outPoint = 16.5;

    var btProp = bubbleText.property("ADBE Text Properties").property("ADBE Text Document");
    var btDoc = btProp.value;
    btDoc.fontSize = 28;
    btDoc.fillColor = [0.06, 0.09, 0.16]; // Deep Slate Navy
    btDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    btProp.setValue(btDoc);

    var btTrans = bubbleText.property("ADBE Transform Group");
    var btPos = btTrans.property("ADBE Position");
    var btOp = btTrans.property("ADBE Opacity");

    btPos.setValueAtTime(11.2, [960, 700]);
    btPos.setValueAtTime(12.1, [960, 650]);
    btPos.setValueAtTime(15.2, [960, 650]);
    btPos.setValueAtTime(16.0, [960, 620]);

    btOp.setValueAtTime(11.2, 0);
    btOp.setValueAtTime(11.9, 100);
    btOp.setValueAtTime(15.2, 100);
    btOp.setValueAtTime(16.0, 0);

    applyEasyEase(btPos);
    applyEasyEase(btOp);

    // Subtitle inside message bubble
    var bubbleSub = mainComp.layers.addText("Live radar • Hourly rain alerts • AI forecasts");
    bubbleSub.name = "05c_Message_Subtext";
    bubbleSub.motionBlur = true;
    bubbleSub.inPoint = 11.5;
    bubbleSub.outPoint = 16.5;

    var btsProp = bubbleSub.property("ADBE Text Properties").property("ADBE Text Document");
    var btsDoc = btsProp.value;
    btsDoc.fontSize = 17;
    btsDoc.fillColor = [0.35, 0.42, 0.52];
    btsDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    btsProp.setValue(btsDoc);

    var btsTrans = bubbleSub.property("ADBE Transform Group");
    var btsPos = btsTrans.property("ADBE Position");
    var btsOp = btsTrans.property("ADBE Opacity");

    btsPos.setValueAtTime(11.5, [960, 730]);
    btsPos.setValueAtTime(12.2, [960, 680]);
    btsPos.setValueAtTime(15.2, [960, 680]);

    btsOp.setValueAtTime(11.5, 0);
    btsOp.setValueAtTime(12.2, 95);
    btsOp.setValueAtTime(15.2, 95);
    btsOp.setValueAtTime(16.0, 0);

    applyEasyEase(btsPos);
    applyEasyEase(btsOp);

    // =========================================================================
    // STEP 5: MOBILE WEATHER APP CONTAINER & 4-PHASE SIMULATION (00:16 - 00:38)
    // 4 Phases: Morning, Day, Evening, Night
    // Animated weather icons, atmospheric ramps, and cards
    // =========================================================================

    // Mobile Phone Chassis (Bezel + Frame)
    var phoneChassis = mainComp.layers.addShape();
    phoneChassis.name = "06a_Mobile_Chassis_Bezel";
    phoneChassis.motionBlur = true;
    phoneChassis.inPoint = 16.0;
    phoneChassis.outPoint = 60.0;

    var pcContents = phoneChassis.property("ADBE Root Vectors Group");
    var pcGroup = pcContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");

    // Outer Phone Body
    var pcOuter = pcGroup.addProperty("ADBE Vector Shape - Rect");
    pcOuter.property("ADBE Vector Rect Size").setValue([430, 860]);
    pcOuter.property("ADBE Vector Rect Roundness").setValue(56);
    var pcOuterFill = pcGroup.addProperty("ADBE Vector Graphic - Fill");
    pcOuterFill.property("ADBE Vector Fill Color").setValue([0.11, 0.13, 0.17, 1.0]); // Titanium Dark

    // Outer Stroke (Chrome rim highlight)
    var pcStroke = pcGroup.addProperty("ADBE Vector Graphic - Stroke");
    pcStroke.property("ADBE Vector Stroke Width").setValue(3);
    pcStroke.property("ADBE Vector Stroke Color").setValue([0.30, 0.35, 0.44, 0.8]);

    applyDropShadow(phoneChassis, 35, 55, 45, 135);

    var pcTrans = phoneChassis.property("ADBE Transform Group");
    var pcPos = pcTrans.property("ADBE Position");
    var pcScale = pcTrans.property("ADBE Scale");

    // Position: Center stage during Step 5, shifts left for Green Screen interaction in Step 6
    pcPos.setValueAtTime(16.0, [960, 1200]);
    pcPos.setValueAtTime(17.8, [960, 540]);
    pcPos.setValueAtTime(37.5, [960, 540]);
    pcPos.setValueAtTime(39.5, [540, 540]); // Shifts left to give space to presenter
    pcPos.setValueAtTime(49.5, [540, 540]);
    pcPos.setValueAtTime(51.5, [960, 540]); // Recenters for Outro CTA

    pcScale.setValueAtTime(16.0, [80, 80]);
    pcScale.setValueAtTime(17.8, [100, 100]);
    pcScale.setValueAtTime(37.5, [100, 100]);
    pcScale.setValueAtTime(39.5, [88, 88]);
    pcScale.setValueAtTime(49.5, [88, 88]);
    pcScale.setValueAtTime(51.5, [100, 100]);

    applyEasyEase(pcPos);
    applyEasyEase(pcScale);

    // Inner Phone Screen (Rounded mask viewport)
    var phoneScreen = mainComp.layers.addShape();
    phoneScreen.name = "06b_Mobile_Screen_Viewport";
    phoneScreen.motionBlur = true;
    phoneScreen.inPoint = 16.0;
    phoneScreen.outPoint = 60.0;

    var psContents = phoneScreen.property("ADBE Root Vectors Group");
    var psGroup = psContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var psRect = psGroup.addProperty("ADBE Vector Shape - Rect");
    psRect.property("ADBE Vector Rect Size").setValue([394, 824]);
    psRect.property("ADBE Vector Rect Roundness").setValue(46);
    var psFill = psGroup.addProperty("ADBE Vector Graphic - Fill");
    psFill.property("ADBE Vector Fill Color").setValue([0.08, 0.10, 0.14, 1.0]);

    // Parent screen to chassis so transforms match automatically
    phoneScreen.parent = phoneChassis;
    phoneScreen.property("ADBE Transform Group").property("ADBE Position").setValue([0, 0]);

    // -------------------------------------------------------------------------
    // Phase 5A: MORNING (16.0s - 21.5s)
    // Sunrise glow, rising sun icon, fresh morning metrics
    // -------------------------------------------------------------------------
    var morningSolid = mainComp.layers.addSolid([1.0, 0.65, 0.45], "06c_Morning_Atmosphere", 394, 824, 1.0, 6.0);
    morningSolid.parent = phoneScreen;
    morningSolid.inPoint = 16.0;
    morningSolid.outPoint = 21.8;
    applyGradientRamp(
        morningSolid,
        [197, 0],
        [1.0, 0.69, 0.47, 1.0], // Sunrise Peach
        [197, 824],
        [0.45, 0.72, 0.95, 1.0], // Morning Sky Blue
        1
    );

    var mTrans = morningSolid.property("ADBE Transform Group");
    mTrans.property("ADBE Position").setValue([0, 0]);
    var mOp = mTrans.property("ADBE Opacity");
    mOp.setValueAtTime(16.0, 0);
    mOp.setValueAtTime(17.2, 100);
    mOp.setValueAtTime(21.0, 100);
    mOp.setValueAtTime(21.8, 0);
    applyEasyEase(mOp);

    // Morning Weather Card Text
    var morningText = mainComp.layers.addText("7:00 AM\n18°C • Sunny Morning\nWind 8 km/h • Humidity 65%");
    morningText.name = "06c_Morning_UI_Text";
    morningText.parent = phoneScreen;
    morningText.inPoint = 16.5;
    morningText.outPoint = 21.8;

    var mtProp = morningText.property("ADBE Text Properties").property("ADBE Text Document");
    var mtDoc = mtProp.value;
    mtDoc.fontSize = 24;
    mtDoc.fillColor = [1.0, 1.0, 1.0];
    mtDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    mtProp.setValue(mtDoc);

    var mtTrans = morningText.property("ADBE Transform Group");
    var mtPos = mtTrans.property("ADBE Position");
    var mtOp = mtTrans.property("ADBE Opacity");
    mtPos.setValueAtTime(16.5, [0, 80]);
    mtPos.setValueAtTime(17.5, [0, 50]);
    mtPos.setValueAtTime(21.0, [0, 50]);
    mtPos.setValueAtTime(21.8, [-60, 50]);

    mtOp.setValueAtTime(16.5, 0);
    mtOp.setValueAtTime(17.5, 100);
    mtOp.setValueAtTime(21.0, 100);
    mtOp.setValueAtTime(21.8, 0);
    applyEasyEase(mtPos);
    applyEasyEase(mtOp);

    // -------------------------------------------------------------------------
    // Phase 5B: DAY (21.5s - 27.0s)
    // Radiant sun with rotating rays, brilliant clear sky, UV index
    // -------------------------------------------------------------------------
    var daySolid = mainComp.layers.addSolid([0.16, 0.65, 0.95], "06d_Day_Atmosphere", 394, 824, 1.0, 6.0);
    daySolid.parent = phoneScreen;
    daySolid.inPoint = 21.2;
    daySolid.outPoint = 27.2;
    applyGradientRamp(
        daySolid,
        [197, 0],
        [0.15, 0.72, 0.98, 1.0], // Azure Sky Blue
        [197, 824],
        [0.05, 0.42, 0.82, 1.0], // Deep Oceanic Blue
        1
    );

    var dTrans = daySolid.property("ADBE Transform Group");
    dTrans.property("ADBE Position").setValue([0, 0]);
    var dOp = dTrans.property("ADBE Opacity");
    dOp.setValueAtTime(21.2, 0);
    dOp.setValueAtTime(22.2, 100);
    dOp.setValueAtTime(26.4, 100);
    dOp.setValueAtTime(27.2, 0);
    applyEasyEase(dOp);

    // Day Rotating Radiant Sun Shape
    var daySun = mainComp.layers.addShape();
    daySun.name = "06d_Day_Rotating_Sun";
    daySun.parent = phoneScreen;
    daySun.motionBlur = true;
    daySun.inPoint = 21.4;
    daySun.outPoint = 27.2;

    var dsContents = daySun.property("ADBE Root Vectors Group");
    var dsSunGroup = dsContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var dsSunCircle = dsSunGroup.addProperty("ADBE Vector Shape - Ellipse");
    dsSunCircle.property("ADBE Vector Ellipse Size").setValue([90, 90]);
    var dsSunFill = dsSunGroup.addProperty("ADBE Vector Graphic - Fill");
    dsSunFill.property("ADBE Vector Fill Color").setValue([1.0, 0.85, 0.15, 1.0]); // Solar Gold

    // Rays (Polystar with 8 points)
    var dsRays = dsSunGroup.addProperty("ADBE Vector Shape - Star");
    dsRays.property("ADBE Vector Star Type").setValue(1); // Star
    dsRays.property("ADBE Vector Star Points").setValue(8);
    dsRays.property("ADBE Vector Star Inner Radius").setValue(55);
    dsRays.property("ADBE Vector Star Outer Radius").setValue(75);
    var dsRaysFill = dsSunGroup.addProperty("ADBE Vector Graphic - Fill");
    dsRaysFill.property("ADBE Vector Fill Color").setValue([1.0, 0.75, 0.05, 0.8]);

    var dstTrans = daySun.property("ADBE Transform Group");
    dstTrans.property("ADBE Position").setValue([0, -110]);
    var dstRot = dstTrans.property("ADBE Rotate Z");
    var dstScale = dstTrans.property("ADBE Scale");
    var dstOp = dstTrans.property("ADBE Opacity");

    dstRot.setValueAtTime(21.4, 0);
    dstRot.setValueAtTime(27.2, 360); // Full smooth rotation

    dstScale.setValueAtTime(21.4, [0, 0]);
    dstScale.setValueAtTime(22.3, [100, 100]);
    dstScale.setValueAtTime(26.4, [100, 100]);
    dstScale.setValueAtTime(27.2, [0, 0]);

    dstOp.setValueAtTime(21.4, 0);
    dstOp.setValueAtTime(22.0, 100);
    dstOp.setValueAtTime(26.6, 100);
    dstOp.setValueAtTime(27.2, 0);

    applyEasyEase(dstScale);
    applyEasyEase(dstOp);
    applyGlow(daySun, 35, 1.5, 45);

    // Day Weather Card Text
    var dayText = mainComp.layers.addText("1:00 PM\n28°C • Clear & Bright\nUV Index: 8 (Very High) • Humidity 38%");
    dayText.name = "06d_Day_UI_Text";
    dayText.parent = phoneScreen;
    dayText.inPoint = 21.6;
    dayText.outPoint = 27.2;

    var dtProp = dayText.property("ADBE Text Properties").property("ADBE Text Document");
    var dtDoc = dtProp.value;
    dtDoc.fontSize = 23;
    dtDoc.fillColor = [1.0, 1.0, 1.0];
    dtDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    dtProp.setValue(dtDoc);

    var dtTrans = dayText.property("ADBE Transform Group");
    var dtPos = dtTrans.property("ADBE Position");
    var dtOp = dtTrans.property("ADBE Opacity");
    dtPos.setValueAtTime(21.6, [0, 90]);
    dtPos.setValueAtTime(22.5, [0, 50]);
    dtPos.setValueAtTime(26.5, [0, 50]);
    dtPos.setValueAtTime(27.2, [-60, 50]);

    dtOp.setValueAtTime(21.6, 0);
    dtOp.setValueAtTime(22.4, 100);
    dtOp.setValueAtTime(26.5, 100);
    dtOp.setValueAtTime(27.2, 0);
    applyEasyEase(dtPos);
    applyEasyEase(dtOp);

    // -------------------------------------------------------------------------
    // Phase 5C: EVENING (27.0s - 32.5s)
    // Sunset gradient, golden twilight, drifting cloud layers
    // -------------------------------------------------------------------------
    var eveSolid = mainComp.layers.addSolid([0.85, 0.32, 0.65], "06e_Evening_Atmosphere", 394, 824, 1.0, 6.0);
    eveSolid.parent = phoneScreen;
    eveSolid.inPoint = 26.8;
    eveSolid.outPoint = 32.8;
    applyGradientRamp(
        eveSolid,
        [197, 0],
        [0.75, 0.18, 0.85, 1.0], // Twilight Violet #C026D3
        [197, 824],
        [0.98, 0.45, 0.10, 1.0], // Warm Sunset Amber #F97316
        1
    );

    var eTrans = eveSolid.property("ADBE Transform Group");
    eTrans.property("ADBE Position").setValue([0, 0]);
    var eOp = eTrans.property("ADBE Opacity");
    eOp.setValueAtTime(26.8, 0);
    eOp.setValueAtTime(27.8, 100);
    eOp.setValueAtTime(32.0, 100);
    eOp.setValueAtTime(32.8, 0);
    applyEasyEase(eOp);

    // Evening Weather Card Text
    var eveText = mainComp.layers.addText("6:30 PM\n22°C • Golden Hour Sunset\nSunset: 6:42 PM • Gentle Breeze");
    eveText.name = "06e_Evening_UI_Text";
    eveText.parent = phoneScreen;
    eveText.inPoint = 27.2;
    eveText.outPoint = 32.8;

    var etProp = eveText.property("ADBE Text Properties").property("ADBE Text Document");
    var etDoc = etProp.value;
    etDoc.fontSize = 23;
    etDoc.fillColor = [1.0, 1.0, 1.0];
    etDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    etProp.setValue(etDoc);

    var etTrans = eveText.property("ADBE Transform Group");
    var etPos = etTrans.property("ADBE Position");
    var etOp = etTrans.property("ADBE Opacity");
    etPos.setValueAtTime(27.2, [0, 90]);
    etPos.setValueAtTime(28.0, [0, 50]);
    etPos.setValueAtTime(32.0, [0, 50]);
    etPos.setValueAtTime(32.8, [-60, 50]);

    etOp.setValueAtTime(27.2, 0);
    etOp.setValueAtTime(28.0, 100);
    etOp.setValueAtTime(32.0, 100);
    etOp.setValueAtTime(32.8, 0);
    applyEasyEase(etPos);
    applyEasyEase(etOp);

    // -------------------------------------------------------------------------
    // Phase 5D: NIGHT (32.5s - 38.0s)
    // Deep starry night sky, crescent moon icon, night weather metrics
    // -------------------------------------------------------------------------
    var nightSolid = mainComp.layers.addSolid([0.04, 0.06, 0.14], "06f_Night_Atmosphere", 394, 824, 1.0, 6.0);
    nightSolid.parent = phoneScreen;
    nightSolid.inPoint = 32.2;
    nightSolid.outPoint = 60.0;
    applyGradientRamp(
        nightSolid,
        [197, 0],
        [0.08, 0.12, 0.28, 1.0], // Midnight Sapphire
        [197, 824],
        [0.02, 0.03, 0.08, 1.0], // Deep Space Obsidian
        1
    );

    var nTrans = nightSolid.property("ADBE Transform Group");
    nTrans.property("ADBE Position").setValue([0, 0]);
    var nOp = nTrans.property("ADBE Opacity");
    nOp.setValueAtTime(32.2, 0);
    nOp.setValueAtTime(33.2, 100);
    applyEasyEase(nOp);

    // Night Glowing Crescent Moon Shape
    var moonShape = mainComp.layers.addShape();
    moonShape.name = "06f_Night_Crescent_Moon";
    moonShape.parent = phoneScreen;
    moonShape.motionBlur = true;
    moonShape.inPoint = 32.4;
    moonShape.outPoint = 60.0;

    var mnContents = moonShape.property("ADBE Root Vectors Group");
    var mnGroup = mnContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var mnOuter = mnGroup.addProperty("ADBE Vector Shape - Ellipse");
    mnOuter.property("ADBE Vector Ellipse Size").setValue([80, 80]);
    var mnFill = mnGroup.addProperty("ADBE Vector Graphic - Fill");
    mnFill.property("ADBE Vector Fill Color").setValue([0.90, 0.94, 1.0, 1.0]); // Silvery Moon

    var mntTrans = moonShape.property("ADBE Transform Group");
    mntTrans.property("ADBE Position").setValue([0, -110]);
    var mntScale = mntTrans.property("ADBE Scale");
    var mntOp = mntTrans.property("ADBE Opacity");

    mntScale.setValueAtTime(32.4, [0, 0]);
    mntScale.setValueAtTime(33.5, [100, 100]);
    mntOp.setValueAtTime(32.4, 0);
    mntOp.setValueAtTime(33.2, 100);

    applyEasyEase(mntScale);
    applyEasyEase(mntOp);
    applyGlow(moonShape, 30, 1.4, 30);

    // Night Weather Card Text
    var nightText = mainComp.layers.addText("10:00 PM\n16°C • Clear Night Sky\nAQI: 24 (Excellent) • Humidity 72%");
    nightText.name = "06f_Night_UI_Text";
    nightText.parent = phoneScreen;
    nightText.inPoint = 32.6;
    nightText.outPoint = 60.0;

    var ntProp = nightText.property("ADBE Text Properties").property("ADBE Text Document");
    var ntDoc = ntProp.value;
    ntDoc.fontSize = 23;
    ntDoc.fillColor = [1.0, 1.0, 1.0];
    ntDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    ntProp.setValue(ntDoc);

    var ntTrans = nightText.property("ADBE Transform Group");
    var ntPos = ntTrans.property("ADBE Position");
    var ntOp = ntTrans.property("ADBE Opacity");
    ntPos.setValueAtTime(32.6, [0, 90]);
    ntPos.setValueAtTime(33.6, [0, 50]);

    ntOp.setValueAtTime(32.6, 0);
    ntOp.setValueAtTime(33.6, 100);
    applyEasyEase(ntPos);
    applyEasyEase(ntOp);

    // =========================================================================
    // STEP 6: GREEN SCREEN COMPOSITE (00:38 - 00:50)
    // Keylight 1.2, Despill Bias, Screen Color removal, Subject interaction
    // =========================================================================
    var greenItem = safeImportFile(footagePath);
    if (greenItem) {
        var gsLayer = mainComp.layers.add(greenItem);
        gsLayer.name = "07_Presenter_GreenScreen_Keyed";
        gsLayer.motionBlur = true;
        gsLayer.startTime = 38.0;
        gsLayer.inPoint = 38.0;
        gsLayer.outPoint = 50.5;

        // Position presenter on right stage gesturing toward mobile screen
        var gsTrans = gsLayer.property("ADBE Transform Group");
        var gsPos = gsTrans.property("ADBE Position");
        var gsScale = gsTrans.property("ADBE Scale");
        var gsOp = gsTrans.property("ADBE Opacity");

        gsPos.setValueAtTime(38.0, [1380, 680]);
        gsPos.setValueAtTime(39.5, [1320, 620]);
        gsPos.setValueAtTime(49.0, [1320, 620]);
        gsPos.setValueAtTime(50.5, [1450, 680]);

        gsScale.setValueAtTime(38.0, [95, 95]);
        gsScale.setValueAtTime(39.5, [105, 105]);
        gsScale.setValueAtTime(49.0, [105, 105]);
        gsScale.setValueAtTime(50.5, [95, 95]);

        gsOp.setValueAtTime(38.0, 0);
        gsOp.setValueAtTime(39.0, 100);
        gsOp.setValueAtTime(49.5, 100);
        gsOp.setValueAtTime(50.5, 0);

        applyEasyEase(gsPos);
        applyEasyEase(gsScale);
        applyEasyEase(gsOp);

        // Apply Keylight 1.2 (ADBE Keylight)
        try {
            var keylight = gsLayer.property("ADBE Effect Parade").addProperty("ADBE Keylight");
            if (keylight) {
                // Screen Colour (Pure Green keying)
                try { keylight.property("ADBE Keylight-0002").setValue([0.0, 1.0, 0.0, 1.0]); } catch(e) {}
                // Screen Gain (Tuned for clean fringe removal)
                try { keylight.property("ADBE Keylight-0003").setValue(105.0); } catch(e) {}
                // Screen Balance
                try { keylight.property("ADBE Keylight-0004").setValue(95.0); } catch(e) {}
                // Despill Bias
                try { keylight.property("ADBE Keylight-0005").setValue([0.5, 0.5, 0.5, 1.0]); } catch(e) {}
                // Clip Black & Clip White
                try { keylight.property("ADBE Keylight-0010").setValue(10.0); } catch(e) {}
                try { keylight.property("ADBE Keylight-0011").setValue(90.0); } catch(e) {}
            }
        } catch(errKey) {}

        // Interactive Callout Badge synchronized to presenter gesture
        var calloutBadge = mainComp.layers.addShape();
        calloutBadge.name = "07b_Interactive_Feature_Badge";
        calloutBadge.motionBlur = true;
        calloutBadge.inPoint = 40.0;
        calloutBadge.outPoint = 49.5;

        var cbContents = calloutBadge.property("ADBE Root Vectors Group");
        var cbGroup = cbContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
        var cbRect = cbGroup.addProperty("ADBE Vector Shape - Rect");
        cbRect.property("ADBE Vector Rect Size").setValue([340, 75]);
        cbRect.property("ADBE Vector Rect Roundness").setValue(20);
        var cbFill = cbGroup.addProperty("ADBE Vector Graphic - Fill");
        cbFill.property("ADBE Vector Fill Color").setValue([0.15, 0.78, 0.95, 0.95]); // Cyan Pill

        applyDropShadow(calloutBadge, 15, 25, 35, 90);

        var cbTrans = calloutBadge.property("ADBE Transform Group");
        var cbPos = cbTrans.property("ADBE Position");
        var cbScale = cbTrans.property("ADBE Scale");
        var cbOp = cbTrans.property("ADBE Opacity");

        cbPos.setValueAtTime(40.0, [880, 480]);
        cbPos.setValueAtTime(41.0, [880, 430]);
        cbPos.setValueAtTime(48.5, [880, 430]);
        cbPos.setValueAtTime(49.5, [880, 400]);

        cbScale.setValueAtTime(40.0, [0, 0]);
        cbScale.setValueAtTime(40.8, [112, 112]);
        cbScale.setValueAtTime(41.2, [100, 100]);
        cbScale.setValueAtTime(48.5, [100, 100]);
        cbScale.setValueAtTime(49.5, [80, 80]);

        cbOp.setValueAtTime(40.0, 0);
        cbOp.setValueAtTime(40.8, 100);
        cbOp.setValueAtTime(48.5, 100);
        cbOp.setValueAtTime(49.5, 0);

        applyEasyEase(cbPos);
        applyEasyEase(cbScale);
        applyEasyEase(cbOp);

        // Callout Badge Text
        var cbText = mainComp.layers.addText("LIVE RADAR & ALERTS");
        cbText.name = "07c_Feature_Badge_Text";
        cbText.motionBlur = true;
        cbText.inPoint = 40.2;
        cbText.outPoint = 49.5;

        var cbtProp = cbText.property("ADBE Text Properties").property("ADBE Text Document");
        var cbtDoc = cbtProp.value;
        cbtDoc.fontSize = 20;
        cbtDoc.fillColor = [0.04, 0.08, 0.14];
        cbtDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
        cbtProp.setValue(cbtDoc);

        var cbtTrans = cbText.property("ADBE Transform Group");
        var cbtPos = cbtTrans.property("ADBE Position");
        var cbtOp = cbtTrans.property("ADBE Opacity");

        cbtPos.setValueAtTime(40.2, [880, 490]);
        cbtPos.setValueAtTime(41.0, [880, 438]);
        cbtPos.setValueAtTime(48.5, [880, 438]);

        cbtOp.setValueAtTime(40.2, 0);
        cbtOp.setValueAtTime(41.0, 100);
        cbtOp.setValueAtTime(48.5, 100);
        cbtOp.setValueAtTime(49.5, 0);

        applyEasyEase(cbtPos);
        applyEasyEase(cbtOp);
    }

    // =========================================================================
    // STEP 7B & 8: OUTRO CALL TO ACTION & RESOLUTION (00:50 - 01:00)
    // "Download Now!", "Check Weather Anywhere!", App Store Badges, Render Queue
    // =========================================================================

    // Outro Headline: "Check Weather Anywhere!"
    var outroHeadline = mainComp.layers.addText("Check Weather Anywhere!");
    outroHeadline.name = "08a_Outro_Headline";
    outroHeadline.motionBlur = true;
    outroHeadline.inPoint = 50.5;
    outroHeadline.outPoint = 60.0;

    var ohProp = outroHeadline.property("ADBE Text Properties").property("ADBE Text Document");
    var ohDoc = ohProp.value;
    ohDoc.fontSize = 64;
    ohDoc.fillColor = [1.0, 1.0, 1.0];
    ohDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    ohProp.setValue(ohDoc);

    var ohTrans = outroHeadline.property("ADBE Transform Group");
    var ohPos = ohTrans.property("ADBE Position");
    var ohScale = ohTrans.property("ADBE Scale");
    var ohOp = ohTrans.property("ADBE Opacity");

    ohPos.setValueAtTime(50.5, [960, 220]);
    ohPos.setValueAtTime(52.0, [960, 180]);
    ohPos.setValueAtTime(58.0, [960, 180]);

    ohScale.setValueAtTime(50.5, [85, 85]);
    ohScale.setValueAtTime(52.0, [100, 100]);

    ohOp.setValueAtTime(50.5, 0);
    ohOp.setValueAtTime(51.8, 100);
    ohOp.setValueAtTime(58.0, 100);
    ohOp.setValueAtTime(59.8, 0);

    applyEasyEase(ohPos);
    applyEasyEase(ohScale);
    applyEasyEase(ohOp);

    // Outro Subtitle: "Available Free on iOS & Android"
    var outroSub = mainComp.layers.addText("Available Free on iOS & Android");
    outroSub.name = "08b_Outro_Subtitle";
    outroSub.motionBlur = true;
    outroSub.inPoint = 51.0;
    outroSub.outPoint = 60.0;

    var osbProp = outroSub.property("ADBE Text Properties").property("ADBE Text Document");
    var osbDoc = osbProp.value;
    osbDoc.fontSize = 28;
    osbDoc.fillColor = [0.58, 0.65, 0.75];
    osbDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    osbProp.setValue(osbDoc);

    var osbTrans = outroSub.property("ADBE Transform Group");
    var osbPos = osbTrans.property("ADBE Position");
    var osbOp = osbTrans.property("ADBE Opacity");

    osbPos.setValueAtTime(51.0, [960, 260]);
    osbPos.setValueAtTime(52.5, [960, 230]);
    osbPos.setValueAtTime(58.0, [960, 230]);

    osbOp.setValueAtTime(51.0, 0);
    osbOp.setValueAtTime(52.5, 95);
    osbOp.setValueAtTime(58.0, 95);
    osbOp.setValueAtTime(59.8, 0);

    applyEasyEase(osbPos);
    applyEasyEase(osbOp);

    // Outro Call-To-Action Button Shape: "Download Now!"
    var ctaButton = mainComp.layers.addShape();
    ctaButton.name = "08c_Outro_CTA_Button";
    ctaButton.motionBlur = true;
    ctaButton.inPoint = 51.5;
    ctaButton.outPoint = 60.0;

    var ctaContents = ctaButton.property("ADBE Root Vectors Group");
    var ctaGroup = ctaContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var ctaRect = ctaGroup.addProperty("ADBE Vector Shape - Rect");
    ctaRect.property("ADBE Vector Rect Size").setValue([340, 72]);
    ctaRect.property("ADBE Vector Rect Roundness").setValue(24);
    var ctaFill = ctaGroup.addProperty("ADBE Vector Graphic - Fill");
    ctaFill.property("ADBE Vector Fill Color").setValue([0.22, 0.74, 0.97, 1.0]); // Accent Sky Blue

    applyDropShadow(ctaButton, 20, 30, 40, 90);

    var ctaTrans = ctaButton.property("ADBE Transform Group");
    var ctaPos = ctaTrans.property("ADBE Position");
    var ctaScale = ctaTrans.property("ADBE Scale");
    var ctaOp = ctaTrans.property("ADBE Opacity");

    ctaPos.setValueAtTime(51.5, [960, 960]);
    ctaPos.setValueAtTime(52.8, [960, 910]);
    ctaPos.setValueAtTime(58.0, [960, 910]);

    ctaScale.setValueAtTime(51.5, [0, 0]);
    ctaScale.setValueAtTime(52.6, [110, 110]);
    ctaScale.setValueAtTime(53.0, [100, 100]);

    ctaOp.setValueAtTime(51.5, 0);
    ctaOp.setValueAtTime(52.4, 100);
    ctaOp.setValueAtTime(58.0, 100);
    ctaOp.setValueAtTime(59.8, 0);

    applyEasyEase(ctaPos);
    applyEasyEase(ctaScale);
    applyEasyEase(ctaOp);

    // Outro CTA Button Label: "DOWNLOAD NOW"
    var ctaLabel = mainComp.layers.addText("DOWNLOAD NOW");
    ctaLabel.name = "08d_Outro_CTA_Label";
    ctaLabel.motionBlur = true;
    ctaLabel.inPoint = 51.8;
    ctaLabel.outPoint = 60.0;

    var clProp = ctaLabel.property("ADBE Text Properties").property("ADBE Text Document");
    var clDoc = clProp.value;
    clDoc.fontSize = 26;
    clDoc.fillColor = [0.05, 0.08, 0.14]; // Dark Contrast
    clDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    clProp.setValue(clDoc);

    var clTrans = ctaLabel.property("ADBE Transform Group");
    var clPos = clTrans.property("ADBE Position");
    var clOp = clTrans.property("ADBE Opacity");

    clPos.setValueAtTime(51.8, [960, 968]);
    clPos.setValueAtTime(52.8, [960, 918]);
    clPos.setValueAtTime(58.0, [960, 918]);

    clOp.setValueAtTime(51.8, 0);
    clOp.setValueAtTime(52.6, 100);
    clOp.setValueAtTime(58.0, 100);
    clOp.setValueAtTime(59.8, 0);

    applyEasyEase(clPos);
    applyEasyEase(clOp);

    // =========================================================================
    // STEP 8: RENDER QUEUE CONFIGURATION & SAVE PROJECT
    // Save as Final_WeatherApp_Promo.aep
    // =========================================================================
    var aepPath = projectRoot + "/Final_WeatherApp_Promo.aep";
    var aepFile = new File(aepPath);
    try {
        project.save(aepFile);
    } catch(errSave) {}

    // Add to Render Queue
    try {
        var rq = project.renderQueue;
        var rqItem = rq.items.add(mainComp);
        var om = rqItem.outputModule(1);
        var mp4Path = projectRoot + "/Final_WeatherApp_Promo.mp4";
        om.file = new File(mp4Path);
        // Set to H.264 if template exists
        try { om.applyTemplate("H.264 - Match Render Settings - 15 Mbps"); } catch(e) {}
    } catch(errRQ) {}

    app.endUndoGroup();

    return "Successfully generated composition 'Weather App Promo' (60s, 1080p @ 30fps) and saved to " + aepPath;
})();
