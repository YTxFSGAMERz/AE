// =============================================================================
// Project City Life – An Animated Motion Scene
// build_project.jsx  –  ExtendScript AE project builder
// PDF Spec: 1920x1080, 30fps, 60-90s
// Scenes: City background, walking character, neon text, audio integration
// =============================================================================

(function buildCityLife() {
    if (!app.project) {
        app.newProject();
    }
    app.beginUndoGroup("Build: City Life Project");

    var proj = app.project;

    // ─── FOLDERS ───────────────────────────────────────────────────────────────
    var folderScenes    = proj.items.addFolder("Scenes");
    var folderAssets    = proj.items.addFolder("Assets");
    var folderPrecomps  = proj.items.addFolder("Pre-Comps");

    // ─── SETTINGS ──────────────────────────────────────────────────────────────
    var W = 1920, H = 1080, FPS = 30, DUR = 90; // 90 seconds

    // Cinematic easing
    var easeIn  = new KeyframeEase(0.0, 80.0);
    var easeOut = new KeyframeEase(0.0, 80.0);

    // ─── HELPER: set easy ease on all keys of a property ──────────────────────
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

    // ─── HELPER: solid layer ──────────────────────────────────────────────────
    function addSolid(comp, name, w, h, color) {
        return comp.layers.addSolid(color, name, w, h, 1.0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 1 – City Background
    // ─────────────────────────────────────────────────────────────────────────
    var bgComp = proj.items.addComp("Scene_01_CityBackground", W, H, 1.0, DUR, FPS);
    bgComp.parentFolder = folderScenes;

    // Sky gradient solid
    var sky = addSolid(bgComp, "Sky", W, H, [0.05, 0.05, 0.15]);
    sky.moveToEnd();

    // Sky gradient effect
    var skyGrad = sky.Effects.addProperty("ADBE Ramp");
    skyGrad.property("ADBE Ramp-0001").setValue([960, 0]);        // Start Point
    skyGrad.property("ADBE Ramp-0002").setValue([0.1, 0.1, 0.5]); // Start Color (deep blue)
    skyGrad.property("ADBE Ramp-0003").setValue([960, 1080]);     // End Point
    skyGrad.property("ADBE Ramp-0004").setValue([0.0, 0.0, 0.1]); // End Color (near black)

    // ── Building 1 (tall, center-left) ───────────────────────────────────────
    var bldg1 = bgComp.layers.addShape();
    bldg1.name = "Building_01";
    var bldg1Group = bldg1.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    bldg1Group.name = "Building";
    var bldg1Rect = bldg1Group.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    bldg1Rect.property("ADBE Vector Rect Size").setValue([180, 500]);
    bldg1Rect.property("ADBE Vector Rect Position").setValue([0, 0]);
    var bldg1Fill = bldg1Group.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    bldg1Fill.property("ADBE Vector Fill Color").setValue([0.08, 0.08, 0.2]);
    bldg1.property("ADBE Transform Group").property("ADBE Position").setValue([400, 580]);

    // ── Building 2 (medium, center) ───────────────────────────────────────────
    var bldg2 = bgComp.layers.addShape();
    bldg2.name = "Building_02";
    var bldg2Group = bldg2.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    bldg2Group.name = "Building";
    var bldg2Rect = bldg2Group.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    bldg2Rect.property("ADBE Vector Rect Size").setValue([220, 380]);
    var bldg2Fill = bldg2Group.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    bldg2Fill.property("ADBE Vector Fill Color").setValue([0.06, 0.06, 0.18]);
    bldg2.property("ADBE Transform Group").property("ADBE Position").setValue([650, 650]);

    // ── Building 3 (right side) ────────────────────────────────────────────────
    var bldg3 = bgComp.layers.addShape();
    bldg3.name = "Building_03";
    var bldg3Group = bldg3.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    bldg3Group.name = "Building";
    var bldg3Rect = bldg3Group.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    bldg3Rect.property("ADBE Vector Rect Size").setValue([260, 450]);
    var bldg3Fill = bldg3Group.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    bldg3Fill.property("ADBE Vector Fill Color").setValue([0.07, 0.07, 0.19]);
    bldg3.property("ADBE Transform Group").property("ADBE Position").setValue([1400, 615]);

    // ── Building 4 (far right) ─────────────────────────────────────────────────
    var bldg4 = bgComp.layers.addShape();
    bldg4.name = "Building_04";
    var bldg4Group = bldg4.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    bldg4Group.name = "Building";
    var bldg4Rect = bldg4Group.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    bldg4Rect.property("ADBE Vector Rect Size").setValue([200, 320]);
    var bldg4Fill = bldg4Group.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    bldg4Fill.property("ADBE Vector Fill Color").setValue([0.09, 0.09, 0.22]);
    bldg4.property("ADBE Transform Group").property("ADBE Position").setValue([1680, 700]);

    // ── Ground / Road ─────────────────────────────────────────────────────────
    var ground = bgComp.layers.addShape();
    ground.name = "Ground_Road";
    var groundGroup = ground.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var groundRect = groundGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    groundRect.property("ADBE Vector Rect Size").setValue([W, 200]);
    var groundFill = groundGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    groundFill.property("ADBE Vector Fill Color").setValue([0.1, 0.1, 0.12]);
    ground.property("ADBE Transform Group").property("ADBE Position").setValue([960, 980]);

    // ── Clouds (animated) ─────────────────────────────────────────────────────
    for (var c = 0; c < 3; c++) {
        var cloud = bgComp.layers.addShape();
        cloud.name = "Cloud_0" + (c + 1);
        var cGroup = cloud.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var cEll   = cGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
        cEll.property("ADBE Vector Ellipse Size").setValue([180 + c * 40, 70 + c * 20]);
        var cFill  = cGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        cFill.property("ADBE Vector Fill Color").setValue([0.6, 0.6, 0.8]);
        cloud.property("ADBE Transform Group").property("ADBE Opacity").setValue(25 + c * 10);

        var cPos = cloud.property("ADBE Transform Group").property("ADBE Position");
        var startY = 150 + c * 80;
        cPos.setValueAtTime(0,   [-200, startY]);
        cPos.setValueAtTime(DUR, [2200, startY]);
        easeAll(cPos);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 2 – Walking Character (Pre-comp)
    // ─────────────────────────────────────────────────────────────────────────
    var charComp = proj.items.addComp("Scene_02_Character", 400, 400, 1.0, DUR, FPS);
    charComp.parentFolder = folderPrecomps;
    charComp.bgColor = [0, 0, 0];

    // HEAD
    var head = charComp.layers.addShape();
    head.name = "Head";
    var headGroup = head.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var headEll   = headGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
    headEll.property("ADBE Vector Ellipse Size").setValue([80, 80]);
    var headFill  = headGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    headFill.property("ADBE Vector Fill Color").setValue([0.9, 0.7, 0.5]);
    head.property("ADBE Transform Group").property("ADBE Position").setValue([200, 100]);

    // BODY
    var body = charComp.layers.addShape();
    body.name = "Body";
    var bodyGroup = body.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var bodyRect  = bodyGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    bodyRect.property("ADBE Vector Rect Size").setValue([60, 100]);
    var bodyFill  = bodyGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    bodyFill.property("ADBE Vector Fill Color").setValue([0.2, 0.3, 0.8]);
    body.property("ADBE Transform Group").property("ADBE Position").setValue([200, 190]);

    // LEFT ARM
    var armL = charComp.layers.addShape();
    armL.name = "Arm_Left";
    var armLGroup = armL.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var armLRect  = armLGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    armLRect.property("ADBE Vector Rect Size").setValue([20, 70]);
    var armLFill  = armLGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    armLFill.property("ADBE Vector Fill Color").setValue([0.9, 0.7, 0.5]);
    armL.property("ADBE Transform Group").property("ADBE Position").setValue([165, 185]);
    // Arm swing animation
    var armLRot = armL.property("ADBE Transform Group").property("ADBE Rotate Z");
    armLRot.setValueAtTime(0,       -30);
    armLRot.setValueAtTime(0.25,     30);
    armLRot.setValueAtTime(0.5,     -30);
    easeAll(armLRot);
    armLRot.expression = "loopOut('cycle')";

    // RIGHT ARM
    var armR = charComp.layers.addShape();
    armR.name = "Arm_Right";
    var armRGroup = armR.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var armRRect  = armRGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    armRRect.property("ADBE Vector Rect Size").setValue([20, 70]);
    var armRFill  = armRGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    armRFill.property("ADBE Vector Fill Color").setValue([0.9, 0.7, 0.5]);
    armR.property("ADBE Transform Group").property("ADBE Position").setValue([235, 185]);
    var armRRot = armR.property("ADBE Transform Group").property("ADBE Rotate Z");
    armRRot.setValueAtTime(0,       30);
    armRRot.setValueAtTime(0.25,   -30);
    armRRot.setValueAtTime(0.5,     30);
    easeAll(armRRot);
    armRRot.expression = "loopOut('cycle')";

    // LEFT LEG
    var legL = charComp.layers.addShape();
    legL.name = "Leg_Left";
    var legLGroup = legL.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var legLRect  = legLGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    legLRect.property("ADBE Vector Rect Size").setValue([22, 90]);
    var legLFill  = legLGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    legLFill.property("ADBE Vector Fill Color").setValue([0.1, 0.1, 0.5]);
    legL.property("ADBE Transform Group").property("ADBE Position").setValue([182, 280]);
    var legLRot = legL.property("ADBE Transform Group").property("ADBE Rotate Z");
    legLRot.setValueAtTime(0,      25);
    legLRot.setValueAtTime(0.25,  -25);
    legLRot.setValueAtTime(0.5,    25);
    easeAll(legLRot);
    legLRot.expression = "loopOut('cycle')";

    // RIGHT LEG
    var legR = charComp.layers.addShape();
    legR.name = "Leg_Right";
    var legRGroup = legR.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var legRRect  = legRGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    legRRect.property("ADBE Vector Rect Size").setValue([22, 90]);
    var legRFill  = legRGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    legRFill.property("ADBE Vector Fill Color").setValue([0.1, 0.1, 0.5]);
    legR.property("ADBE Transform Group").property("ADBE Position").setValue([218, 280]);
    var legRRot = legR.property("ADBE Transform Group").property("ADBE Rotate Z");
    legRRot.setValueAtTime(0,     -25);
    legRRot.setValueAtTime(0.25,   25);
    legRRot.setValueAtTime(0.5,   -25);
    easeAll(legRRot);
    legRRot.expression = "loopOut('cycle')";

    // Bouncing body expression (applied to body position Y)
    body.property("ADBE Transform Group").property("ADBE Position").expression =
        "freq = 2;\namp = 8;\n[200, 190 + Math.sin(time * freq * 2 * Math.PI) * amp];";

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 3 – Neon Text (Pre-comp)
    // ─────────────────────────────────────────────────────────────────────────
    var neonComp = proj.items.addComp("Scene_03_NeonText", W, H, 1.0, DUR, FPS);
    neonComp.parentFolder = folderPrecomps;
    neonComp.bgColor = [0, 0, 0];

    // CITY LIFE neon text
    var neonText = neonComp.layers.addText("CITY LIFE");
    neonText.name = "NeonText_CityLife";
    var neonTD = neonText.property("ADBE Text Properties").property("ADBE Text Document").value;
    neonTD.resetCharStyle();
    neonTD.font = "Arial-BoldMT";
    neonTD.fontSize = 160;
    neonTD.fillColor = [0.0, 1.0, 1.0]; // cyan #00FFFF
    neonTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    neonText.property("ADBE Text Properties").property("ADBE Text Document").setValue(neonTD);
    neonText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 400]);

    // Glow effect
    var neonGlow = neonText.Effects.addProperty("ADBE Glo2");
    neonGlow.property("ADBE Glo2-0003").setValue(50);  // Glow Radius
    neonGlow.property("ADBE Glo2-0004").setValue(3.0); // Glow Intensity

    // Flicker opacity expression
    neonText.property("ADBE Transform Group").property("ADBE Opacity").expression =
        "freq = 8;\nminFlicker = 60;\nmaxFlicker = 100;\nrandom(minFlicker, maxFlicker);";

    // OPEN sign
    var openText = neonComp.layers.addText("OPEN 24/7");
    openText.name = "NeonText_Open";
    var openTD = openText.property("ADBE Text Properties").property("ADBE Text Document").value;
    openTD.resetCharStyle();
    openTD.font = "Arial-BoldMT";
    openTD.fontSize = 80;
    openTD.fillColor = [1.0, 0.0, 1.0]; // magenta #FF00FF
    openTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    openText.property("ADBE Text Properties").property("ADBE Text Document").setValue(openTD);
    openText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 520]);

    var openGlow = openText.Effects.addProperty("ADBE Glo2");
    openGlow.property("ADBE Glo2-0003").setValue(40);
    openGlow.property("ADBE Glo2-0004").setValue(2.5);
    openText.property("ADBE Transform Group").property("ADBE Opacity").expression =
        "freq = 5;\nminFlicker = 70;\nmaxFlicker = 100;\nrandom(minFlicker, maxFlicker);";

    // ─────────────────────────────────────────────────────────────────────────
    // MASTER COMPOSITION
    // ─────────────────────────────────────────────────────────────────────────
    var masterComp = proj.items.addComp("MASTER_CityLife", W, H, 1.0, DUR, FPS);
    masterComp.parentFolder = folderScenes;

    // Sky/bg layer
    var bgLayer = masterComp.layers.add(bgComp);
    bgLayer.name = "CityBackground";
    bgLayer.moveToEnd();

    // Character walking across screen
    var charLayer = masterComp.layers.add(charComp);
    charLayer.name = "WalkingCharacter";
    charLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([50, 50]);
    var charPos = charLayer.property("ADBE Transform Group").property("ADBE Position");
    charPos.setValueAtTime(0,   [-100, 870]);
    charPos.setValueAtTime(DUR, [2200, 870]);
    easeAll(charPos);

    // Neon text overlay
    var neonLayer = masterComp.layers.add(neonComp);
    neonLayer.name = "NeonText_Overlay";
    neonLayer.blendingMode = BlendingMode.SCREEN;

    // Camera push-in: subtle 2.5% scale over full duration (cinematic drift)
    var masterScale = masterComp.layers.addNull();
    masterScale.name = "CameraNull_PushIn";
    var scaleP = masterScale.property("ADBE Transform Group").property("ADBE Scale");
    scaleP.setValueAtTime(0,   [100, 100]);
    scaleP.setValueAtTime(DUR, [102.5, 102.5]);
    easeAll(scaleP);
    bgLayer.parent   = masterScale;
    charLayer.parent = masterScale;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER QUEUE
    // ─────────────────────────────────────────────────────────────────────────
    var rqItem = proj.renderQueue.items.add(masterComp);
    rqItem.outputModules[1].applyTemplate("Lossless");
    var outputPath = Folder.desktop.fsName; // placeholder
    rqItem.outputModules[1].file = new File(
        "c:/Users/Admin/Documents/GitHub/AE/Project City Life An Animated Motion Scene/Final_CityLife.avi"
    );

    // Save project
    proj.save(new File(
        "c:/Users/Admin/Documents/GitHub/AE/Project City Life An Animated Motion Scene/City_Life_AnimatedScene.aep"
    ));

    app.endUndoGroup();
    // Project built successfully
})();
