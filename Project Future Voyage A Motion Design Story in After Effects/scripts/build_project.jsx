// =============================================================================
// Project Future Voyage - A Motion Design Story in After Effects
// Studio-Grade ExtendScript AE Builder
// Conforms strictly to Project Future Voyage Specification PDF
// =============================================================================

(function buildFutureVoyage() {
    var traceFile = new File("C:/Users/Admin/Documents/GitHub/AE/future_voyage_trace.txt");
    function trace(msg) {
        try {
            traceFile.open("a");
            traceFile.writeln(msg);
            traceFile.close();
        } catch(e) {}
    }

    trace("TRACE 1: Script started");
    try {

    if (!app.project) {
        app.newProject();
    }
    app.beginUndoGroup("Build: Future Voyage Project (Studio Grade)");

    try {
        app.beginSuppressDialogs();
    } catch(e) {}

    var proj = app.project;

    trace("TRACE 2: Clearing old items");
    while (proj.items.length > 0) {
        proj.items[1].remove();
    }

    var folderScenes   = proj.items.addFolder("Scenes");
    var folderAssets   = proj.items.addFolder("Assets");
    var folderPrecomps = proj.items.addFolder("Pre-Comps");

    var W = 1920, H = 1080, FPS = 30, DUR = 95;

    var easeIn  = new KeyframeEase(0.0, 80.0);
    var easeOut = new KeyframeEase(0.0, 80.0);

    function easeAll(prop) {
        if (!prop || prop.numKeys < 1) return;
        try {
            if (prop.propertyValueType === PropertyValueType.SHAPE ||
                prop.propertyValueType === PropertyValueType.TEXT_DOCUMENT ||
                prop.propertyValueType === PropertyValueType.CUSTOM_VALUE ||
                prop.propertyValueType === PropertyValueType.NO_VALUE) {
                return;
            }
        } catch(e) {}
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

    function getProp(parent, names) {
        if (!parent) return null;
        for (var i = 0; i < names.length; i++) {
            try {
                var p = parent.property(names[i]);
                if (p) return p;
            } catch(e) {}
        }
        return null;
    }

    function getRotation(layer) {
        if (!layer) return null;
        var tg = layer.property("ADBE Transform Group");
        if (!tg) return null;
        return getProp(tg, ["ADBE Rotate Z", "ADBE Rotation", "Rotation"]);
    }

    var projectRoot = "C:/Users/Admin/Documents/GitHub/AE/Project Future Voyage A Motion Design Story in After Effects/assets/";
    function importAsset(relPath) {
        var f = new File(projectRoot + relPath);
        if (!f.exists) return null;
        try {
            var item = proj.importFile(new ImportOptions(f));
            item.parentFolder = folderAssets;
            return item;
        } catch(e) {
            return null;
        }
    }

    trace("TRACE 3: Importing assets");
    var footageWorldMap  = importAsset("images/world_map.png");
    var footagePlane     = importAsset("images/plane.png");
    var footageButton    = importAsset("images/interactive_button.png");
    var footageCursor    = importAsset("images/cursor.png");
    var footageDevice    = importAsset("images/device_hand.png");
    var footageHud       = importAsset("images/hud_reticle.png");
    var footageStars     = importAsset("images/stars_bg.jpg");
    var footageAudio     = importAsset("audio/space_soundtrack.mp3");
    var footageWhoosh    = importAsset("audio/whoosh.mp3");
    var footageClick     = importAsset("audio/click.mp3");

    trace("TRACE 4: Scene 1 Map Path");
    var sc1 = proj.items.addComp("Scene_01_MapPath", W, H, 1.0, DUR, FPS);
    sc1.parentFolder = folderScenes;

    var sc1Bg = sc1.layers.addSolid([0.02, 0.04, 0.09], "Map_DeepBackground", W, H, 1.0);
    sc1Bg.moveToEnd();

    if (footageWorldMap) {
        var mapLayer = sc1.layers.add(footageWorldMap);
        mapLayer.name = "WorldMap_Blueprint";
        mapLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([78, 78]);
        mapLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);
        mapLayer.property("ADBE Transform Group").property("ADBE Opacity").setValue(45);
        try {
            var mapTint = mapLayer.Effects.addProperty("ADBE Tint");
            mapTint.property("ADBE Tint-0002").setValue([0.0, 0.8, 1.0]);
        } catch(e) {}
    }

    for (var g = 0; g < 6; g++) {
        var gridLine = sc1.layers.addSolid([0.0, 0.6, 0.9], "Grid_Line_" + g, W, 1, 1.0);
        gridLine.property("ADBE Transform Group").property("ADBE Position").setValue([960, 160 + g * 150]);
        gridLine.property("ADBE Transform Group").property("ADBE Opacity").setValue(20);
    }

    var pathShape = sc1.layers.addShape();
    pathShape.name = "Flight_Trajectory_Path";
    var contents = pathShape.property("ADBE Root Vectors Group");

    var pathGroup = contents.addProperty("ADBE Vector Shape - Group");
    var curve = new Shape();
    curve.vertices = [[350, 750], [700, 420], [1150, 480], [1580, 280]];
    curve.inTangents = [[0, 0], [-120, 80], [-100, -60], [-80, 40]];
    curve.outTangents = [[100, -80], [120, -80], [100, 60], [0, 0]];
    curve.closed = false;
    pathGroup.property("ADBE Vector Shape").setValue(curve);

    var pStroke = contents.addProperty("ADBE Vector Graphic - Stroke");
    pStroke.property("ADBE Vector Stroke Color").setValue([0.0, 0.9, 1.0]);
    pStroke.property("ADBE Vector Stroke Width").setValue(6);

    var trim = contents.addProperty("ADBE Vector Filter - Trim");
    var trimEnd = trim.property("ADBE Vector Trim End");
    if (trimEnd) {
        trimEnd.setValueAtTime(1.0,  0);
        trimEnd.setValueAtTime(14.0, 100);
        easeAll(trimEnd);
    }

    if (footageHud) {
        var hudLayer = sc1.layers.add(footageHud);
        hudLayer.name = "Waypoint_Target_HUD";
        hudLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([65, 65]);
        hudLayer.property("ADBE Transform Group").property("ADBE Position").setValue([1580, 280]);
        var hudRot = getRotation(hudLayer);
        if (hudRot) {
            hudRot.expression = "time * 45;";
        }
        var hudOp = hudLayer.property("ADBE Transform Group").property("ADBE Opacity");
        hudOp.setValueAtTime(0,  0);
        hudOp.setValueAtTime(12, 0);
        hudOp.setValueAtTime(14, 100);
        easeAll(hudOp);
    }

    if (footagePlane) {
        var planeLayer = sc1.layers.add(footagePlane);
        planeLayer.name = "Voyager_Craft_Marker";
        planeLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([18, 18]);
        var plPos = planeLayer.property("ADBE Transform Group").property("ADBE Position");
        plPos.setValueAtTime(1.0,  [350, 750]);
        plPos.setValueAtTime(5.5,  [700, 420]);
        plPos.setValueAtTime(10.0, [1150, 480]);
        plPos.setValueAtTime(14.0, [1580, 280]);
        easeAll(plPos);

        var plRot = getRotation(planeLayer);
        if (plRot) {
            plRot.setValueAtTime(1.0,  -35);
            plRot.setValueAtTime(5.5,  15);
            plRot.setValueAtTime(10.0, -25);
            plRot.setValueAtTime(14.0, 0);
            easeAll(plRot);
        }
    }

    trace("TRACE 5: Scene 2 Interactive UI");
    var sc2 = proj.items.addComp("Scene_02_InteractiveUI", W, H, 1.0, DUR, FPS);
    sc2.parentFolder = folderScenes;
    sc2.bgColor = [0.03, 0.05, 0.10];

    var sc2Bg = sc2.layers.addSolid([0.05, 0.08, 0.16], "UI_Console_BG", W, H, 1.0);
    sc2Bg.moveToEnd();

    var btnComp = proj.items.addComp("PreComp_UIButton", 600, 200, 1.0, DUR, FPS);
    btnComp.parentFolder = folderPrecomps;

    if (footageButton) {
        var btnGraphic = btnComp.layers.add(footageButton);
        btnGraphic.name = "Button_Capsule";
        btnGraphic.property("ADBE Transform Group").property("ADBE Position").setValue([300, 100]);
    }
    var btnText = btnComp.layers.addText("INITIALIZE VOYAGE");
    btnText.name = "Button_Label";
    var btTD = btnText.property("ADBE Text Properties").property("ADBE Text Document").value;
    btTD.resetCharStyle();
    btTD.font = "Arial-BoldMT";
    btTD.fontSize = 36;
    btTD.fillColor = [0.0, 0.9, 1.0];
    btTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    btnText.property("ADBE Text Properties").property("ADBE Text Document").setValue(btTD);
    btnText.property("ADBE Transform Group").property("ADBE Position").setValue([300, 112]);

    var btnLayer = sc2.layers.add(btnComp);
    btnLayer.name = "Interactive_Button_Element";
    btnLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

    var btnScale = btnLayer.property("ADBE Transform Group").property("ADBE Scale");
    btnScale.setValueAtTime(0.5, [0, 0]);
    btnScale.setValueAtTime(3.0, [100, 100]);
    btnScale.setValueAtTime(7.0, [100, 100]);
    btnScale.setValueAtTime(7.2, [120, 120]);
    btnScale.setValueAtTime(7.5, [100, 100]);
    easeAll(btnScale);

    var btnRot = getRotation(btnLayer);
    if (btnRot) {
        btnRot.setValueAtTime(0.5, 0);
        btnRot.setValueAtTime(3.0, 720);
        easeAll(btnRot);
    }

    if (footageCursor) {
        var curLayer = sc2.layers.add(footageCursor);
        curLayer.name = "Interactive_Pointer_Cursor";
        curLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([35, 35]);
        var curPos = curLayer.property("ADBE Transform Group").property("ADBE Position");
        curPos.setValueAtTime(3.5, [1600, 950]);
        curPos.setValueAtTime(6.8, [980, 560]);
        easeAll(curPos);

        var curScale = curLayer.property("ADBE Transform Group").property("ADBE Scale");
        curScale.setValueAtTime(6.8, [35, 35]);
        curScale.setValueAtTime(7.0, [27, 27]);
        curScale.setValueAtTime(7.3, [35, 35]);
        easeAll(curScale);

        var curOp = curLayer.property("ADBE Transform Group").property("ADBE Opacity");
        curOp.setValueAtTime(8.0, 100);
        curOp.setValueAtTime(9.5, 0);
        easeAll(curOp);
    }

    trace("TRACE 6: Scene 3 Holographic Map");
    var sc3 = proj.items.addComp("Scene_03_HolographicMap", W, H, 1.0, DUR, FPS);
    sc3.parentFolder = folderScenes;

    var sc3Bg = sc3.layers.addSolid([0.02, 0.03, 0.06], "Holo_BG", W, H, 1.0);
    sc3Bg.moveToEnd();

    var devNull = sc3.layers.addNull();
    devNull.name = "MotionTracker_TargetNull";
    devNull.property("ADBE Transform Group").property("ADBE Position").setValue([960, 680]);

    if (footageDevice) {
        var devLayer = sc3.layers.add(footageDevice);
        devLayer.name = "Mobile_Device_Frame";
        devLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([70, 70]);
        devLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 750]);
        devLayer.parent = devNull;
    }

    var holoComp = proj.items.addComp("PreComp_HologramSphere", 800, 800, 1.0, DUR, FPS);
    holoComp.parentFolder = folderPrecomps;

    for (var r = 0; r < 4; r++) {
        var ring = holoComp.layers.addShape();
        ring.name = "Holo_Ring_" + r;
        var rGroup = ring.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var rEll   = rGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
        rEll.property("ADBE Vector Ellipse Size").setValue([250 + r * 110, 100 + r * 45]);
        var rStr   = rGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
        rStr.property("ADBE Vector Stroke Color").setValue([0.0, 0.9, 1.0]);
        rStr.property("ADBE Vector Stroke Width").setValue(3);
        ring.property("ADBE Transform Group").property("ADBE Position").setValue([400, 400]);
        var rRot = getRotation(ring);
        if (rRot) {
            rRot.expression = "(time * " + (30 + r * 20) + ") % 360;";
        }
    }

    if (footageWorldMap) {
        var hMap = holoComp.layers.add(footageWorldMap);
        hMap.name = "Hologram_Planet_Texture";
        hMap.property("ADBE Transform Group").property("ADBE Scale").setValue([30, 30]);
        hMap.property("ADBE Transform Group").property("ADBE Position").setValue([400, 400]);
        hMap.property("ADBE Transform Group").property("ADBE Opacity").setValue(70);
    }

    var holoLayer = sc3.layers.add(holoComp);
    holoLayer.name = "3D_Hologram_Projection";
    holoLayer.threeDLayer = true;
    holoLayer.parent = devNull;
    holoLayer.property("ADBE Transform Group").property("ADBE Position").setValue([0, -220, 0]);

    var hScale = holoLayer.property("ADBE Transform Group").property("ADBE Scale");
    hScale.setValueAtTime(1.0, [0, 0, 0]);
    hScale.setValueAtTime(4.0, [100, 100, 100]);
    easeAll(hScale);

    var hRotY = holoLayer.property("ADBE Transform Group").property("ADBE Rotate Y");
    if (hRotY) {
        hRotY.expression = "time * 45;";
    }

    var hGlow = holoLayer.Effects.addProperty("ADBE Glo2");
    hGlow.property("ADBE Glo2-0003").setValue(50);
    hGlow.property("ADBE Glo2-0004").setValue(2.8);

    trace("TRACE 7: Scene 4 3D Title Reveal");
    var sc4 = proj.items.addComp("Scene_04_TitleReveal", W, H, 1.0, DUR, FPS);
    sc4.parentFolder = folderScenes;

    if (footageStars) {
        var starBg = sc4.layers.add(footageStars);
        starBg.name = "Deep_Space_Stars";
        starBg.property("ADBE Transform Group").property("ADBE Scale").setValue([110, 110]);
        starBg.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);
        starBg.moveToEnd();
    }

    var title3D = sc4.layers.addText("Next Destination: Mars");
    title3D.name = "Title_NextDestinationMars";
    title3D.threeDLayer = true;
    title3D.motionBlur = true;
    var tTD = title3D.property("ADBE Text Properties").property("ADBE Text Document").value;
    tTD.resetCharStyle();
    tTD.font = "Arial-BoldMT";
    tTD.fontSize = 110;
    tTD.fillColor = [1.0, 0.6, 0.2];
    tTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    title3D.property("ADBE Text Properties").property("ADBE Text Document").setValue(tTD);

    var tPos = title3D.property("ADBE Transform Group").property("ADBE Position");
    tPos.setValueAtTime(1.0,  [W + 400, 540, 200]);
    tPos.setValueAtTime(5.0,  [960, 540, 0]);
    easeAll(tPos);

    var tRotY = title3D.property("ADBE Transform Group").property("ADBE Rotate Y");
    if (tRotY) {
        tRotY.setValueAtTime(1.0, 180);
        tRotY.setValueAtTime(5.0, 0);
        easeAll(tRotY);
    }

    var tGlow = title3D.Effects.addProperty("ADBE Glo2");
    tGlow.property("ADBE Glo2-0003").setValue(60);
    tGlow.property("ADBE Glo2-0004").setValue(2.5);

    trace("TRACE 8: Scene 5 Kinetic Text");
    var sc5 = proj.items.addComp("Scene_05_KineticText", W, H, 1.0, DUR, FPS);
    sc5.parentFolder = folderScenes;

    var sc5Bg = sc5.layers.addSolid([0.02, 0.04, 0.08], "Kinetic_BG", W, H, 1.0);
    sc5Bg.moveToEnd();

    var kineticText = sc5.layers.addText("Exploration Begins");
    kineticText.name = "Kinetic_ExplorationBegins";
    kineticText.threeDLayer = true;
    kineticText.motionBlur = true;

    var kTD = kineticText.property("ADBE Text Properties").property("ADBE Text Document").value;
    kTD.resetCharStyle();
    kTD.font = "Arial-BoldMT";
    kTD.fontSize = 130;
    kTD.fillColor = [0.0, 0.95, 1.0];
    kTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    kineticText.property("ADBE Text Properties").property("ADBE Text Document").setValue(kTD);

    kineticText.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, -80, 0]);

    var kPos = kineticText.property("ADBE Transform Group").property("ADBE Position");
    kPos.setValueAtTime(1.0, [960, -200, 0]);
    kPos.setValueAtTime(4.5, [960, 540, 0]);
    easeAll(kPos);

    var kRotX = kineticText.property("ADBE Transform Group").property("ADBE Rotate X");
    if (kRotX) {
        kRotX.setValueAtTime(1.0, -90);
        kRotX.setValueAtTime(3.0, 30);
        kRotX.setValueAtTime(4.5, 0);
        easeAll(kRotX);
    }

    var kRotY = kineticText.property("ADBE Transform Group").property("ADBE Rotate Y");
    if (kRotY) {
        kRotY.setValueAtTime(1.0, 180);
        kRotY.setValueAtTime(4.5, 0);
        easeAll(kRotY);
    }

    var kOp = kineticText.property("ADBE Transform Group").property("ADBE Opacity");
    kOp.setValueAtTime(1.0, 0);
    kOp.setValueAtTime(3.5, 100);
    easeAll(kOp);

    var kGlow = kineticText.Effects.addProperty("ADBE Glo2");
    kGlow.property("ADBE Glo2-0003").setValue(50);
    kGlow.property("ADBE Glo2-0004").setValue(2.8);

    trace("TRACE 9: Scene 6 Master Comp");
    var masterComp = proj.items.addComp("MASTER_FutureVoyage", W, H, 1.0, DUR, FPS);
    masterComp.parentFolder = folderScenes;

    if (footageAudio) {
        var aLayer = masterComp.layers.add(footageAudio);
        aLayer.name = "Space_Cinematic_Audio";
        var aLev = aLayer.property("ADBE Audio Group").property("ADBE Audio Levels");
        aLev.setValueAtTime(0,       [-48.0, -48.0]);
        aLev.setValueAtTime(3.0,     [0.0, 0.0]);
        aLev.setValueAtTime(DUR - 4, [0.0, 0.0]);
        aLev.setValueAtTime(DUR,     [-48.0, -48.0]);
        easeAll(aLev);
    }

    if (footageWhoosh) {
        var wLayer1 = masterComp.layers.add(footageWhoosh);
        wLayer1.startTime = 18.0;
        var wLayer2 = masterComp.layers.add(footageWhoosh);
        wLayer2.startTime = 36.0;
        var wLayer3 = masterComp.layers.add(footageWhoosh);
        wLayer3.startTime = 53.0;
    }

    var lSc1 = masterComp.layers.add(sc1);
    lSc1.startTime = 0;
    var op1 = lSc1.property("ADBE Transform Group").property("ADBE Opacity");
    op1.setValueAtTime(18.0, 100);
    op1.setValueAtTime(20.0, 0);
    easeAll(op1);

    var lSc2 = masterComp.layers.add(sc2);
    lSc2.startTime = 18.0;
    var op2 = lSc2.property("ADBE Transform Group").property("ADBE Opacity");
    op2.setValueAtTime(18.0, 0);
    op2.setValueAtTime(19.5, 100);
    op2.setValueAtTime(36.0, 100);
    op2.setValueAtTime(38.0, 0);
    easeAll(op2);

    var lSc3 = masterComp.layers.add(sc3);
    lSc3.startTime = 36.0;
    var op3 = lSc3.property("ADBE Transform Group").property("ADBE Opacity");
    op3.setValueAtTime(36.0, 0);
    op3.setValueAtTime(37.5, 100);
    op3.setValueAtTime(53.0, 100);
    op3.setValueAtTime(55.0, 0);
    easeAll(op3);

    var lSc4 = masterComp.layers.add(sc4);
    lSc4.startTime = 53.0;
    var op4 = lSc4.property("ADBE Transform Group").property("ADBE Opacity");
    op4.setValueAtTime(53.0, 0);
    op4.setValueAtTime(54.5, 100);
    op4.setValueAtTime(70.0, 100);
    op4.setValueAtTime(72.0, 0);
    easeAll(op4);

    var lSc5 = masterComp.layers.add(sc5);
    lSc5.startTime = 70.0;
    var op5 = lSc5.property("ADBE Transform Group").property("ADBE Opacity");
    op5.setValueAtTime(70.0, 0);
    op5.setValueAtTime(71.5, 100);
    op5.setValueAtTime(92.0, 100);
    op5.setValueAtTime(95.0, 0);
    easeAll(op5);

    var masterCamera = masterComp.layers.addNull();
    masterCamera.name = "Master_Cinematic_PushIn";
    var mcScale = masterCamera.property("ADBE Transform Group").property("ADBE Scale");
    mcScale.setValueAtTime(0,   [100, 100]);
    mcScale.setValueAtTime(DUR, [103.0, 103.0]);
    easeAll(mcScale);
    lSc1.parent = masterCamera;
    lSc2.parent = masterCamera;
    lSc3.parent = masterCamera;
    lSc4.parent = masterCamera;
    lSc5.parent = masterCamera;

    var adjLayer = masterComp.layers.addSolid([1, 1, 1], "Lumetri_ColorGrade_Layer", W, H, 1.0);
    adjLayer.adjustmentLayer = true;
    try {
        adjLayer.Effects.addProperty("ADBE Lumetri");
    } catch(e) {}

    trace("TRACE 10: Saving project file");
    var saveFile = new File("C:/Users/Admin/Documents/GitHub/AE/Project Future Voyage A Motion Design Story in After Effects/Future_Voyage_MotionStory.aep");
    proj.save(saveFile);
    trace("TRACE 11: Saved successfully!");

    try {
        app.endSuppressDialogs(false);
    } catch(e) {}

    } catch(err) {
        trace("EXCEPTION: " + err.toString() + " at line " + (err.line || "unknown"));
    }
    try {
        app.endUndoGroup();
    } catch(e) {}
})();
