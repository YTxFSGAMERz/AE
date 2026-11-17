// =============================================================================
// Project Future Voyage – A Motion Design Story in After Effects
// build_project.jsx  –  ExtendScript AE project builder
// PDF Spec: 1920x1080, 30fps, 90-120s, 6 scenes
// Scenes: Map path, button/cursor, holographic map, title reveal,
//         kinetic text, final integration
// =============================================================================

(function buildFutureVoyage() {
    if (!app.project) {
        app.newProject();
    }
    app.beginUndoGroup("Build: Future Voyage Project");

    var proj = app.project;

    // ─── FOLDERS ───────────────────────────────────────────────────────────────
    var folderScenes   = proj.items.addFolder("Scenes");
    var folderPrecomps = proj.items.addFolder("Pre-Comps");
    var folderAssets   = proj.items.addFolder("Assets");

    // ─── SETTINGS ──────────────────────────────────────────────────────────────
    var W = 1920, H = 1080, FPS = 30, DUR = 100; // 100s within 90-120 range

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
    // SCENE 1 – The Journey Begins (Map Path Animation, 0-20s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc1 = proj.items.addComp("Scene_01_MapPath", W, H, 1.0, 20, FPS);
    sc1.parentFolder = folderScenes;
    sc1.bgColor = [0.02, 0.05, 0.12];

    // Map background (dark ocean color)
    var mapBg = sc1.layers.addSolid([0.03, 0.08, 0.18], "MapBackground", W, H, 1.0);
    mapBg.moveToEnd();

    // Grid lines (holographic map feel)
    for (var g = 0; g < 8; g++) {
        var gridH = sc1.layers.addShape();
        gridH.name = "GridH_" + g;
        var ghGroup = gridH.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var ghRect  = ghGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
        ghRect.property("ADBE Vector Rect Size").setValue([W, 1]);
        var ghFill  = ghGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        ghFill.property("ADBE Vector Fill Color").setValue([0.0, 0.5, 1.0]);
        gridH.property("ADBE Transform Group").property("ADBE Position").setValue([960, 135 * g]);
        gridH.property("ADBE Transform Group").property("ADBE Opacity").setValue(20);
    }

    // Travel path shape (curved line via shape layer)
    var pathLayer = sc1.layers.addShape();
    pathLayer.name = "TravelPath";
    var pathGroup = pathLayer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    // Path shape (bezier-like polyline)
    var pathShape = pathGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Group");
    var pathStroke = pathGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    pathStroke.property("ADBE Vector Stroke Color").setValue([0.0, 1.0, 1.0]);
    pathStroke.property("ADBE Vector Stroke Width").setValue(4);

    // Trim Paths for path drawing animation
    var trimPaths = pathGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Filter - Trim");
    var trimEnd = trimPaths.property("ADBE Vector Trim End");
    trimEnd.setValueAtTime(0,  0);
    trimEnd.setValueAtTime(15, 100);
    easeAll(trimEnd);

    // Destination marker (circle that follows path)
    var marker = sc1.layers.addShape();
    marker.name = "PathMarker";
    var mGroup = marker.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var mEll   = mGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
    mEll.property("ADBE Vector Ellipse Size").setValue([30, 30]);
    var mFill  = mGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    mFill.property("ADBE Vector Fill Color").setValue([1.0, 0.5, 0.0]);
    var markerGlow = marker.Effects.addProperty("ADBE Glo2");
    markerGlow.property("ADBE Glo2-0003").setValue(30);
    markerGlow.property("ADBE Glo2-0004").setValue(3.0);

    // Animate marker along path (simulated with position keyframes)
    var mPos = marker.property("ADBE Transform Group").property("ADBE Position");
    mPos.setValueAtTime(0,  [200, 700]);
    mPos.setValueAtTime(5,  [500, 500]);
    mPos.setValueAtTime(10, [900, 400]);
    mPos.setValueAtTime(15, [1400, 300]);
    mPos.setValueAtTime(20, [1700, 400]);
    easeAll(mPos);

    // "DESTINATION: MARS" label
    var destLabel = sc1.layers.addText("DESTINATION: MARS");
    destLabel.name = "DestLabel";
    var dlTD = destLabel.property("ADBE Text Properties").property("ADBE Text Document").value;
    dlTD.resetCharStyle();
    dlTD.font = "Arial-BoldMT";
    dlTD.fontSize = 48;
    dlTD.fillColor = [0.0, 1.0, 1.0];
    dlTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    destLabel.property("ADBE Text Properties").property("ADBE Text Document").setValue(dlTD);
    destLabel.property("ADBE Transform Group").property("ADBE Position").setValue([960, 150]);
    var dlOp = destLabel.property("ADBE Transform Group").property("ADBE Opacity");
    dlOp.setValueAtTime(0, 0);
    dlOp.setValueAtTime(3, 100);
    easeAll(dlOp);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 2 – Interactive Screen (Button + Cursor, 20-40s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc2 = proj.items.addComp("Scene_02_InteractiveScreen", W, H, 1.0, 20, FPS);
    sc2.parentFolder = folderScenes;
    sc2.bgColor = [0.02, 0.02, 0.08];

    // Button background
    var btnBg = sc2.layers.addShape();
    btnBg.name = "ExploreButton";
    var btnGroup  = btnBg.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var btnRect   = btnGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    btnRect.property("ADBE Vector Rect Size").setValue([400, 100]);
    btnRect.property("ADBE Vector Rect Roundness").setValue(50);
    var btnStroke = btnGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    btnStroke.property("ADBE Vector Stroke Color").setValue([0.0, 1.0, 1.0]);
    btnStroke.property("ADBE Vector Stroke Width").setValue(3);
    var btnFillG  = btnGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    btnFillG.property("ADBE Vector Fill Color").setValue([0.0, 0.1, 0.3]);
    btnBg.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

    // Button scale animation (0 → 100%)
    var btnScale = btnBg.property("ADBE Transform Group").property("ADBE Scale");
    btnScale.setValueAtTime(0,   [0, 0]);
    btnScale.setValueAtTime(1.5, [110, 110]);
    btnScale.setValueAtTime(2.0, [100, 100]);
    easeAll(btnScale);

    // Button rotation (0 → 720)
    var btnRot = btnBg.property("ADBE Transform Group").property("ADBE Rotate Z");
    btnRot.setValueAtTime(0,   0);
    btnRot.setValueAtTime(2.0, 720);
    easeAll(btnRot);

    // Button text
    var btnText = sc2.layers.addText("EXPLORE NOW");
    btnText.name = "ButtonText";
    var btTD = btnText.property("ADBE Text Properties").property("ADBE Text Document").value;
    btTD.resetCharStyle();
    btTD.font = "Arial-BoldMT";
    btTD.fontSize = 48;
    btTD.fillColor = [0.0, 1.0, 1.0];
    btTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    btnText.property("ADBE Text Properties").property("ADBE Text Document").setValue(btTD);
    btnText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 557]);
    btnText.parent = btnBg;

    // Cursor (triangle shape simulating cursor)
    var cursor = sc2.layers.addShape();
    cursor.name = "Cursor";
    var curGroup = cursor.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var curPoly  = curGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    curPoly.property("ADBE Vector Rect Size").setValue([20, 30]);
    var curFill  = curGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    curFill.property("ADBE Vector Fill Color").setValue([1.0, 1.0, 1.0]);
    cursor.property("ADBE Transform Group").property("ADBE Opacity").setValue(90);

    // Cursor movement (simulates clicking the button)
    var curPos = cursor.property("ADBE Transform Group").property("ADBE Position");
    curPos.setValueAtTime(0,    [1600, 200]);
    curPos.setValueAtTime(5,    [960, 540]);
    curPos.setValueAtTime(5.5,  [960, 540]);
    easeAll(curPos);

    // Click: cursor scale pop
    var curScale = cursor.property("ADBE Transform Group").property("ADBE Scale");
    curScale.setValueAtTime(5,    [100, 100]);
    curScale.setValueAtTime(5.1,  [120, 120]);
    curScale.setValueAtTime(5.3,  [100, 100]);
    easeAll(curScale);

    // Button fade out after click
    var btnOp = btnBg.property("ADBE Transform Group").property("ADBE Opacity");
    btnOp.setValueAtTime(5.3,  100);
    btnOp.setValueAtTime(7.0,  0);
    easeAll(btnOp);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 3 – Holographic Map (3D + Glow, 40-60s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc3 = proj.items.addComp("Scene_03_HolographicMap", W, H, 1.0, 20, FPS);
    sc3.parentFolder = folderScenes;
    sc3.bgColor = [0.0, 0.02, 0.05];

    // Hologram circle rings
    for (var r = 0; r < 4; r++) {
        var ring = sc3.layers.addShape();
        ring.name = "HoloRing_" + r;
        var ringGroup  = ring.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var ringEll    = ringGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
        ringEll.property("ADBE Vector Ellipse Size").setValue([200 + r * 120, 200 + r * 120]);
        var ringStroke = ringGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
        ringStroke.property("ADBE Vector Stroke Color").setValue([0.0, 0.8, 1.0]);
        ringStroke.property("ADBE Vector Stroke Width").setValue(2);
        ring.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);
        ring.property("ADBE Transform Group").property("ADBE Opacity").setValue(60 - r * 10);
        ring.threeDLayer = true;

        // Pop-up scale animation
        var ringS = ring.property("ADBE Transform Group").property("ADBE Scale");
        ringS.setValueAtTime(0,   [0, 0, 0]);
        ringS.setValueAtTime(1.5, [110 + r * 5, 110 + r * 5, 110 + r * 5]);
        ringS.setValueAtTime(2.0, [100, 100, 100]);
        easeAll(ringS);

        // Spinning rotation
        var ringRot = ring.property("ADBE Transform Group").property("ADBE Rotate Y");
        if (ringRot) {
            ringRot.setValueAtTime(0,   0);
            ringRot.setValueAtTime(20, 360 * (r % 2 === 0 ? 1 : -1));
        }
        
        // Glow
        var ringGlow = ring.Effects.addProperty("ADBE Glo2");
        ringGlow.property("ADBE Glo2-0003").setValue(40 + r * 10);
        ringGlow.property("ADBE Glo2-0004").setValue(2.0);
    }

    // "HOLOGRAPHIC INTERFACE" label
    var holoLabel = sc3.layers.addText("HOLOGRAPHIC\nINTERFACE");
    holoLabel.name = "HoloLabel";
    var hlTD = holoLabel.property("ADBE Text Properties").property("ADBE Text Document").value;
    hlTD.resetCharStyle();
    hlTD.font = "Arial-BoldMT";
    hlTD.fontSize = 72;
    hlTD.fillColor = [0.0, 1.0, 0.8];
    hlTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    holoLabel.property("ADBE Text Properties").property("ADBE Text Document").setValue(hlTD);
    holoLabel.property("ADBE Transform Group").property("ADBE Position").setValue([960, 200]);
    var hlGlow = holoLabel.Effects.addProperty("ADBE Glo2");
    hlGlow.property("ADBE Glo2-0003").setValue(50);
    hlGlow.property("ADBE Glo2-0004").setValue(2.5);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 4 – Title Reveal / Rotating Typography (60-75s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc4 = proj.items.addComp("Scene_04_TitleReveal", W, H, 1.0, 15, FPS);
    sc4.parentFolder = folderScenes;
    sc4.bgColor = [0.0, 0.0, 0.05];

    // Dark gradient bg
    var titleBg = sc4.layers.addSolid([0.0, 0.0, 0.08], "TitleBG", W, H, 1.0);
    var titleBgGrad = titleBg.Effects.addProperty("ADBE Ramp");
    titleBgGrad.property("ADBE Ramp-0001").setValue([960, 0]);
    titleBgGrad.property("ADBE Ramp-0002").setValue([0.0, 0.05, 0.2]);
    titleBgGrad.property("ADBE Ramp-0003").setValue([960, 1080]);
    titleBgGrad.property("ADBE Ramp-0004").setValue([0.0, 0.0, 0.0]);
    titleBg.moveToEnd();

    // Main 3D title
    var mainTitle = sc4.layers.addText("NEXT DESTINATION:\nMARS");
    mainTitle.name = "MainTitle_3D";
    mainTitle.threeDLayer = true;
    var mtTD = mainTitle.property("ADBE Text Properties").property("ADBE Text Document").value;
    mtTD.resetCharStyle();
    mtTD.font = "Arial-BoldMT";
    mtTD.fontSize = 120;
    mtTD.fillColor = [1.0, 0.6, 0.0];
    mtTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    mainTitle.property("ADBE Text Properties").property("ADBE Text Document").setValue(mtTD);

    // Position (slide in from right)
    var mtPos = mainTitle.property("ADBE Transform Group").property("ADBE Position");
    mtPos.setValueAtTime(0,   [3000, 540, 0]);
    mtPos.setValueAtTime(3,   [960, 540, 0]);
    easeAll(mtPos);

    // Y Rotation (0 → 180 → 0)
    var mtRotY = mainTitle.property("ADBE Transform Group").property("ADBE Rotate Y");
    if (mtRotY) {
        mtRotY.setValueAtTime(0,   180);
        mtRotY.setValueAtTime(3,   0);
        easeAll(mtRotY);
    }

    // Motion blur
    mainTitle.motionBlur = true;

    // Glow on title
    var mtGlow = mainTitle.Effects.addProperty("ADBE Glo2");
    mtGlow.property("ADBE Glo2-0003").setValue(60);
    mtGlow.property("ADBE Glo2-0004").setValue(2.0);

    // Subtitle
    var subTitle = sc4.layers.addText("A MOTION DESIGN STORY");
    subTitle.name = "Subtitle";
    var stTD = subTitle.property("ADBE Text Properties").property("ADBE Text Document").value;
    stTD.resetCharStyle();
    stTD.font = "Arial-ItalicMT";
    stTD.fontSize = 48;
    stTD.fillColor = [0.0, 0.8, 1.0];
    stTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    subTitle.property("ADBE Text Properties").property("ADBE Text Document").setValue(stTD);
    subTitle.property("ADBE Transform Group").property("ADBE Position").setValue([960, 680]);
    var stOp = subTitle.property("ADBE Transform Group").property("ADBE Opacity");
    stOp.setValueAtTime(2, 0);
    stOp.setValueAtTime(4, 100);
    easeAll(stOp);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 5 – Kinetic Text Transition (75-90s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc5 = proj.items.addComp("Scene_05_KineticText", W, H, 1.0, 15, FPS);
    sc5.parentFolder = folderScenes;
    sc5.bgColor = [0.0, 0.0, 0.03];

    // "EXPLORATION BEGINS" hanging text
    var kineticText = sc5.layers.addText("EXPLORATION BEGINS");
    kineticText.name = "KineticText_Main";
    kineticText.threeDLayer = true;
    kineticText.motionBlur = true;
    var ktTD = kineticText.property("ADBE Text Properties").property("ADBE Text Document").value;
    ktTD.resetCharStyle();
    ktTD.font = "Arial-BoldMT";
    ktTD.fontSize = 100;
    ktTD.fillColor = [1.0, 1.0, 1.0];
    ktTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    kineticText.property("ADBE Text Properties").property("ADBE Text Document").setValue(ktTD);

    // Anchor point to top (hanging effect)
    kineticText.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([960, 0, 0]);
    kineticText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 400, 0]);

    // Y Rotation: 180 → 0 (hang swing in)
    var ktRotY = kineticText.property("ADBE Transform Group").property("ADBE Rotate Y");
    if (ktRotY) {
        ktRotY.setValueAtTime(0,   180);
        ktRotY.setValueAtTime(3,   0);
        easeAll(ktRotY);
    }

    // Position: off-screen → center
    var ktPos = kineticText.property("ADBE Transform Group").property("ADBE Position");
    ktPos.setValueAtTime(0,   [960, -300, 0]);
    ktPos.setValueAtTime(3,   [960, 400, 0]);
    easeAll(ktPos);

    // Opacity fade in
    var ktOp = kineticText.property("ADBE Transform Group").property("ADBE Opacity");
    ktOp.setValueAtTime(0, 0);
    ktOp.setValueAtTime(2, 100);
    easeAll(ktOp);

    // Glow
    var ktGlow = kineticText.Effects.addProperty("ADBE Glo2");
    ktGlow.property("ADBE Glo2-0003").setValue(40);
    ktGlow.property("ADBE Glo2-0004").setValue(1.5);

    // "THE FUTURE IS NOW" secondary line
    var kineticText2 = sc5.layers.addText("THE FUTURE IS NOW");
    kineticText2.name = "KineticText_Sub";
    var kt2TD = kineticText2.property("ADBE Text Properties").property("ADBE Text Document").value;
    kt2TD.resetCharStyle();
    kt2TD.font = "Arial-ItalicMT";
    kt2TD.fontSize = 60;
    kt2TD.fillColor = [0.0, 1.0, 1.0];
    kt2TD.justification = ParagraphJustification.CENTER_JUSTIFY;
    kineticText2.property("ADBE Text Properties").property("ADBE Text Document").setValue(kt2TD);
    kineticText2.property("ADBE Transform Group").property("ADBE Position").setValue([960, 580]);
    var kt2Op = kineticText2.property("ADBE Transform Group").property("ADBE Opacity");
    kt2Op.setValueAtTime(3, 0);
    kt2Op.setValueAtTime(5, 100);
    easeAll(kt2Op);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 6 – Final Integration (90-100s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc6 = proj.items.addComp("Scene_06_FinalIntegration", W, H, 1.0, 10, FPS);
    sc6.parentFolder = folderScenes;
    sc6.bgColor = [0.0, 0.0, 0.0];

    // End card
    var endCard = sc6.layers.addSolid([0.0, 0.0, 0.05], "EndCardBG", W, H, 1.0);
    endCard.moveToEnd();
    var endCardGrad = endCard.Effects.addProperty("ADBE Ramp");
    endCardGrad.property("ADBE Ramp-0001").setValue([960, 0]);
    endCardGrad.property("ADBE Ramp-0002").setValue([0.0, 0.1, 0.4]);
    endCardGrad.property("ADBE Ramp-0003").setValue([960, 1080]);
    endCardGrad.property("ADBE Ramp-0004").setValue([0.0, 0.0, 0.0]);

    var endTitle = sc6.layers.addText("FUTURE VOYAGE");
    endTitle.name = "EndTitle";
    var etTD = endTitle.property("ADBE Text Properties").property("ADBE Text Document").value;
    etTD.resetCharStyle();
    etTD.font = "Arial-BoldMT";
    etTD.fontSize = 140;
    etTD.fillColor = [1.0, 0.6, 0.0];
    etTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    endTitle.property("ADBE Text Properties").property("ADBE Text Document").setValue(etTD);
    endTitle.property("ADBE Transform Group").property("ADBE Position").setValue([960, 500]);
    var etGlow = endTitle.Effects.addProperty("ADBE Glo2");
    etGlow.property("ADBE Glo2-0003").setValue(70);
    etGlow.property("ADBE Glo2-0004").setValue(3.0);
    var etOp = endTitle.property("ADBE Transform Group").property("ADBE Opacity");
    etOp.setValueAtTime(0, 0);
    etOp.setValueAtTime(2, 100);
    easeAll(etOp);

    var endSub = sc6.layers.addText("A Motion Design Story in After Effects");
    endSub.name = "EndSubtitle";
    var esTD = endSub.property("ADBE Text Properties").property("ADBE Text Document").value;
    esTD.resetCharStyle();
    esTD.font = "Arial-ItalicMT";
    esTD.fontSize = 48;
    esTD.fillColor = [0.0, 0.8, 1.0];
    esTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    endSub.property("ADBE Text Properties").property("ADBE Text Document").setValue(esTD);
    endSub.property("ADBE Transform Group").property("ADBE Position").setValue([960, 620]);

    // ─────────────────────────────────────────────────────────────────────────
    // MASTER COMPOSITION (100s)
    // ─────────────────────────────────────────────────────────────────────────
    var masterComp = proj.items.addComp("MASTER_FutureVoyage", W, H, 1.0, DUR, FPS);
    masterComp.parentFolder = folderScenes;

    // Add scenes sequentially
    var sc1Layer = masterComp.layers.add(sc1, 20);
    sc1Layer.startTime = 0;
    sc1Layer.name = "SC1_MapPath";

    var sc2Layer = masterComp.layers.add(sc2, 20);
    sc2Layer.startTime = 20;
    sc2Layer.name = "SC2_Interactive";

    var sc3Layer = masterComp.layers.add(sc3, 20);
    sc3Layer.startTime = 40;
    sc3Layer.name = "SC3_Holographic";

    var sc4Layer = masterComp.layers.add(sc4, 15);
    sc4Layer.startTime = 60;
    sc4Layer.name = "SC4_TitleReveal";

    var sc5Layer = masterComp.layers.add(sc5, 15);
    sc5Layer.startTime = 75;
    sc5Layer.name = "SC5_KineticText";

    var sc6Layer = masterComp.layers.add(sc6, 10);
    sc6Layer.startTime = 90;
    sc6Layer.name = "SC6_FinalIntegration";

    // Camera push-in null
    var camNull = masterComp.layers.addNull();
    camNull.name = "CameraNull_PushIn";
    var camScale = camNull.property("ADBE Transform Group").property("ADBE Scale");
    camScale.setValueAtTime(0,   [100, 100]);
    camScale.setValueAtTime(DUR, [102.5, 102.5]);
    easeAll(camScale);

    // Lumetri color adjustment
    var adj = masterComp.layers.addSolid([0,0,0], "ColorGrading_Adj", W, H, 1.0);
    adj.adjustmentLayer = true;
    adj.name = "LumetriColorGrading";
    var lumetri = adj.Effects.addProperty("ADBE Lumetri");
    if (lumetri) {
        // Slight cool/cinematic tone
        try {
            lumetri.property("ADBE Lumetri-0001").property("ADBE Lumetri Exposure").setValue(-0.1);
            lumetri.property("ADBE Lumetri-0001").property("ADBE Lumetri Contrast").setValue(15);
        } catch(e) {}
    }

    // Motion blur on master
    masterComp.motionBlurAdaptiveSampleLimit = 16;

    // ─── RENDER QUEUE ─────────────────────────────────────────────────────────
    var rqItem = proj.renderQueue.items.add(masterComp);
    rqItem.outputModules[1].applyTemplate("Lossless");
    rqItem.outputModules[1].file = new File(
        "c:/Users/Admin/Documents/GitHub/AE/Project Future Voyage A Motion Design Story in After Effects/Final_FutureVoyage.avi"
    );

    proj.save(new File(
        "c:/Users/Admin/Documents/GitHub/AE/Project Future Voyage A Motion Design Story in After Effects/Future_Voyage_MotionStory.aep"
    ));

    app.endUndoGroup();
    // Project built successfully
})();
