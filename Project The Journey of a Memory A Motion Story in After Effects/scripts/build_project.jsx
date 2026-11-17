// =============================================================================
// Project The Journey of a Memory - A Motion Story in After Effects
// Studio-Grade ExtendScript AE Builder
// Conforms strictly to Project The Journey of a Memory Specification PDF
// =============================================================================

(function buildJourneyOfMemory() {
    var traceFile = new File("C:/Users/Admin/Documents/GitHub/AE/journey_of_memory_trace.txt");
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
    app.beginUndoGroup("Build: Journey of a Memory Project (Studio Grade)");

    try {
        app.beginSuppressDialogs();
    } catch(e) {}

    var proj = app.project;

    // Clear existing items in project
    while (proj.items.length > 0) {
        proj.items[1].remove();
    }

    var folderScenes   = proj.items.addFolder("Scenes");
    var folderAssets   = proj.items.addFolder("Assets");
    var folderPrecomps = proj.items.addFolder("Pre-Comps");

    var W = 1920, H = 1080, FPS = 30, DUR = 95; // 95s within 90-120s range

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

    // Helper: Import asset safely
    var projectRoot = "C:/Users/Admin/Documents/GitHub/AE/Project The Journey of a Memory A Motion Story in After Effects/assets/";
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

    // Import authentic studio assets
    var footageMemoryPhoto  = importAsset("images/memory_photo.jpg");
    var footageWorldMap     = importAsset("images/world_map.png");
    var footagePaper        = importAsset("images/paper_texture.jpg");
    var footageCamBody      = importAsset("images/camera_body.png");
    var footageCamLens      = importAsset("images/camera_lens.png");
    var footageCamBtn       = importAsset("images/camera_button.png");
    var footageFootL        = importAsset("images/footprint_left.png");
    var footageFootR        = importAsset("images/footprint_right.png");
    var footageGhost        = importAsset("images/ghost_silhouette.png");
    var footageAudio        = importAsset("audio/memory_soundtrack.mp3");
    var footageShutter      = importAsset("audio/camera_shutter.mp3");
    var footageWhoosh       = importAsset("audio/whoosh.mp3");

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 1 - Memory Reveal (Masking Split Effect, 0-16s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc1 = proj.items.addComp("Scene_01_MemoryReveal", W, H, 1.0, DUR, FPS);
    sc1.parentFolder = folderScenes;

    var sc1Bg = sc1.layers.addSolid([0.08, 0.06, 0.05], "Sepia_Memory_BG", W, H, 1.0);
    sc1Bg.moveToEnd();

    // Authentic Memory Photo
    if (footageMemoryPhoto) {
        var memLayer = sc1.layers.add(footageMemoryPhoto);
        memLayer.name = "Memory_Photograph";
        memLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([68, 68]);
        memLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

        // PDF Requirement: Pen Tool left/right masks, Mask Path animated to reveal with Easy Ease
        var maskL = memLayer.mask.addProperty("Mask");
        maskL.name = "SplitMask_Left";
        maskL.maskMode = MaskMode.ADD;
        var mlShape = maskL.property("ADBE Mask Shape");

        var pL_start = new Shape();
        pL_start.vertices = [[0, 0], [0, 0], [0, 1080], [0, 1080]];
        pL_start.closed = true;

        var pL_end = new Shape();
        pL_end.vertices = [[0, 0], [960, 0], [960, 1080], [0, 1080]];
        pL_end.closed = true;

        mlShape.setValueAtTime(1.0, pL_start);
        mlShape.setValueAtTime(5.5, pL_end);
        easeAll(mlShape);

        var maskR = memLayer.mask.addProperty("Mask");
        maskR.name = "SplitMask_Right";
        maskR.maskMode = MaskMode.ADD;
        var mrShape = maskR.property("ADBE Mask Shape");

        var pR_start = new Shape();
        pR_start.vertices = [[W, 0], [W, 0], [W, 1080], [W, 1080]];
        pR_start.closed = true;

        var pR_end = new Shape();
        pR_end.vertices = [[960, 0], [W, 0], [W, 1080], [960, 1080]];
        pR_end.closed = true;

        mrShape.setValueAtTime(1.0, pR_start);
        mrShape.setValueAtTime(5.5, pR_end);
        easeAll(mrShape);
    }

    // Cinematic Title: "A MEMORY BEGINS"
    var title1 = sc1.layers.addText("A MEMORY BEGINS");
    title1.name = "Title_MemoryBegins";
    var t1TD = title1.property("ADBE Text Properties").property("ADBE Text Document").value;
    t1TD.resetCharStyle();
    t1TD.font = "Georgia-BoldMT";
    t1TD.fontSize = 84;
    t1TD.fillColor = [1.0, 0.95, 0.85];
    t1TD.justification = ParagraphJustification.CENTER_JUSTIFY;
    title1.property("ADBE Text Properties").property("ADBE Text Document").setValue(t1TD);
    title1.property("ADBE Transform Group").property("ADBE Position").setValue([960, 160]);

    var t1Op = title1.property("ADBE Transform Group").property("ADBE Opacity");
    t1Op.setValueAtTime(0,    0);
    t1Op.setValueAtTime(2.5,  100);
    t1Op.setValueAtTime(13.0, 100);
    t1Op.setValueAtTime(15.5, 0);
    easeAll(t1Op);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 2 - The Flag of a Place (Shape Layer Animation, 14-30s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc2 = proj.items.addComp("Scene_02_FlagAnimation", W, H, 1.0, DUR, FPS);
    sc2.parentFolder = folderScenes;
    sc2.bgColor = [0.08, 0.08, 0.12];

    var flagRoot = sc2.layers.addNull();
    flagRoot.name = "Flag_Container_Null";
    flagRoot.property("ADBE Transform Group").property("ADBE Position").setValue([960, 480]);

    // Red and white stripes
    var flagBase = sc2.layers.addShape();
    flagBase.name = "Flag_Stripes";
    flagBase.parent = flagRoot;
    flagBase.property("ADBE Transform Group").property("ADBE Position").setValue([0, 0]);

    var fbGroup = flagBase.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    for (var s = 0; s < 13; s++) {
        var strRect = fbGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
        strRect.property("ADBE Vector Rect Size").setValue([760, 36]);
        strRect.property("ADBE Vector Rect Position").setValue([0, -216 + s * 36]);
        var strFill = fbGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        if (s % 2 === 0) {
            strFill.property("ADBE Vector Fill Color").setValue([0.8, 0.1, 0.15]);
        } else {
            strFill.property("ADBE Vector Fill Color").setValue([0.98, 0.98, 0.98]);
        }
    }

    // Blue Canton
    var canton = sc2.layers.addShape();
    canton.name = "Flag_Blue_Canton";
    canton.parent = flagRoot;
    canton.property("ADBE Transform Group").property("ADBE Position").setValue([-190, -108]);
    var cGroup = canton.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    var cRect  = cGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    cRect.property("ADBE Vector Rect Size").setValue([380, 252]);
    var cFill  = cGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
    cFill.property("ADBE Vector Fill Color").setValue([0.05, 0.15, 0.45]);

    // Stars array inside canton
    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 6; col++) {
            var star = sc2.layers.addShape();
            star.name = "Star_" + row + "_" + col;
            star.parent = flagRoot;
            star.property("ADBE Transform Group").property("ADBE Position").setValue([-340 + col * 60, -200 + row * 46]);
            var sGroup = star.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
            var sEll   = sGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");
            sEll.property("ADBE Vector Ellipse Size").setValue([12, 12]);
            var sFill  = sGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
            sFill.property("ADBE Vector Fill Color").setValue([1.0, 1.0, 1.0]);
        }
    }

    // Flag slide-in
    var frPos = flagRoot.property("ADBE Transform Group").property("ADBE Position");
    frPos.setValueAtTime(0.5, [-800, 480]);
    frPos.setValueAtTime(4.0, [960, 480]);
    easeAll(frPos);

    // Text: "United States of America"
    var flagText = sc2.layers.addText("United States of America");
    flagText.name = "Text_UnitedStatesOfAmerica";
    var ftTD = flagText.property("ADBE Text Properties").property("ADBE Text Document").value;
    ftTD.resetCharStyle();
    ftTD.font = "Arial-BoldMT";
    ftTD.fontSize = 52;
    ftTD.fillColor = [1.0, 1.0, 1.0];
    ftTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    flagText.property("ADBE Text Properties").property("ADBE Text Document").setValue(ftTD);
    flagText.property("ADBE Transform Group").property("ADBE Position").setValue([960, 840]);

    var ftOp = flagText.property("ADBE Transform Group").property("ADBE Opacity");
    ftOp.setValueAtTime(3.5, 0);
    ftOp.setValueAtTime(5.5, 100);
    easeAll(ftOp);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 3 - Motion Text Shadow (Depth Effect, 28-44s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc3 = proj.items.addComp("Scene_03_MotionTextShadow", W, H, 1.0, DUR, FPS);
    sc3.parentFolder = folderScenes;

    var sc3Bg = sc3.layers.addSolid([0.06, 0.08, 0.12], "ShadowText_BG", W, H, 1.0);
    sc3Bg.moveToEnd();

    for (var sh = 20; sh >= 0; sh--) {
        var shText = sc3.layers.addText("Journey Begins");
        shText.name = (sh === 0) ? "JourneyBegins_FrontText" : ("Shadow_Layer_" + sh);
        shText.motionBlur = true;
        var sTD = shText.property("ADBE Text Properties").property("ADBE Text Document").value;
        sTD.resetCharStyle();
        sTD.font = "Arial-BoldMT";
        sTD.fontSize = 140;
        if (sh === 0) {
            sTD.fillColor = [1.0, 0.85, 0.3];
        } else {
            var darken = 0.03 * (21 - sh);
            sTD.fillColor = [0.2 - darken * 0.1, 0.12 - darken * 0.06, 0.05];
        }
        sTD.justification = ParagraphJustification.CENTER_JUSTIFY;
        shText.property("ADBE Text Properties").property("ADBE Text Document").setValue(sTD);

        var stPos = shText.property("ADBE Transform Group").property("ADBE Position");
        stPos.setValueAtTime(1.0,  [960 + sh * 1.5, 540 + sh * 1.5]);
        stPos.setValueAtTime(8.0,  [960 + sh * 4.5, 540 + sh * 4.5]);
        stPos.setValueAtTime(14.0, [960 + sh * 1.5, 540 + sh * 1.5]);
        easeAll(stPos);

        if (sh > 0) {
            shText.property("ADBE Transform Group").property("ADBE Opacity").setValue(75 - sh * 2.5);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 4 - Designed Memory Object (Camera Rig, 42-58s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc4 = proj.items.addComp("Scene_04_CameraMemoryObject", W, H, 1.0, DUR, FPS);
    sc4.parentFolder = folderScenes;

    var sc4Bg = sc4.layers.addSolid([0.10, 0.09, 0.08], "Camera_Stage_BG", W, H, 1.0);
    sc4Bg.moveToEnd();

    var camNull = sc4.layers.addNull();
    camNull.name = "Camera_Rig_Null";
    camNull.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

    var cnPos = camNull.property("ADBE Transform Group").property("ADBE Position");
    cnPos.setValueAtTime(0.5,  [960, 580]);
    cnPos.setValueAtTime(4.0,  [960, 520]);
    cnPos.setValueAtTime(8.0,  [960, 560]);
    cnPos.setValueAtTime(12.0, [960, 530]);
    cnPos.setValueAtTime(15.0, [960, 540]);
    easeAll(cnPos);

    // 1. Camera Body
    if (footageCamBody) {
        var cbLayer = sc4.layers.add(footageCamBody);
        cbLayer.name = "Camera_Chassis_Body";
        cbLayer.parent = camNull;
        cbLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([90, 90]);
        cbLayer.property("ADBE Transform Group").property("ADBE Position").setValue([0, 0]);
    }

    // 2. Camera Lens
    if (footageCamLens) {
        var clLayer = sc4.layers.add(footageCamLens);
        clLayer.name = "Camera_Optics_Lens";
        clLayer.parent = camNull;
        clLayer.property("ADBE Transform Group").property("ADBE Position").setValue([0, 15]);
        var clScale = clLayer.property("ADBE Transform Group").property("ADBE Scale");
        clScale.setValueAtTime(1.0,  [90, 90]);
        clScale.setValueAtTime(5.0,  [125, 125]);
        clScale.setValueAtTime(7.0,  [90, 90]);
        clScale.setValueAtTime(11.0, [125, 125]);
        clScale.setValueAtTime(13.0, [90, 90]);
        easeAll(clScale);
    }

    // 3. Shutter Button
    if (footageCamBtn) {
        var btnLayer = sc4.layers.add(footageCamBtn);
        btnLayer.name = "Camera_Shutter_Button";
        btnLayer.parent = camNull;
        btnLayer.property("ADBE Transform Group").property("ADBE Position").setValue([190, -180]);
        
        var bPos = btnLayer.property("ADBE Transform Group").property("ADBE Position");
        bPos.setValueAtTime(5.0, [190, -180]);
        bPos.setValueAtTime(5.2, [190, -165]);
        bPos.setValueAtTime(5.5, [190, -180]);
        easeAll(bPos);

        var bRot = getRotation(btnLayer);
        if (bRot) {
            bRot.setValueAtTime(5.0, 0);
            bRot.setValueAtTime(5.2, 45);
            bRot.setValueAtTime(5.5, 0);
            easeAll(bRot);
        }
    }

    // Flash overlay
    var flash = sc4.layers.addSolid([1.0, 1.0, 1.0], "Camera_Shutter_Flash", W, H, 1.0);
    var flOp = flash.property("ADBE Transform Group").property("ADBE Opacity");
    flOp.setValueAtTime(5.0, 0);
    flOp.setValueAtTime(5.1, 90);
    flOp.setValueAtTime(5.4, 0);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 5 - Footsteps Across a Map (Path Animation, 56-72s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc5 = proj.items.addComp("Scene_05_FootstepsMap", W, H, 1.0, DUR, FPS);
    sc5.parentFolder = folderScenes;

    if (footageWorldMap) {
        var mBg = sc5.layers.add(footageWorldMap);
        mBg.name = "Expedition_Map_Background";
        mBg.property("ADBE Transform Group").property("ADBE Scale").setValue([82, 82]);
        mBg.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);
        mBg.property("ADBE Transform Group").property("ADBE Opacity").setValue(55);
        try {
            var tint = mBg.Effects.addProperty("ADBE Tint");
            tint.property("ADBE Tint-0001").setValue([0.2, 0.15, 0.1]);
            tint.property("ADBE Tint-0002").setValue([0.9, 0.82, 0.68]);
        } catch(e) {}
    }

    var stepsCoords = [
        [320, 720], [420, 660], [530, 600], [660, 560],
        [790, 510], [920, 480], [1050, 430], [1200, 390],
        [1350, 350], [1500, 310]
    ];

    for (var st = 0; st < stepsCoords.length; st++) {
        var isLeft = (st % 2 === 0);
        var footAsset = isLeft ? footageFootL : footageFootR;
        if (footAsset) {
            var stepLayer = sc5.layers.add(footAsset);
            stepLayer.name = "Footstep_" + (st + 1);
            stepLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([22, 22]);
            stepLayer.property("ADBE Transform Group").property("ADBE Position").setValue(stepsCoords[st]);
            
            var sTime = 1.0 + st * 1.2;
            var stOp = stepLayer.property("ADBE Transform Group").property("ADBE Opacity");
            stOp.setValueAtTime(0, 0);
            stOp.setValueAtTime(sTime, 0);
            stOp.setValueAtTime(sTime + 0.4, 100);
            easeAll(stOp);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 6 - Ghostly Memory (Surreal Effect, 70-86s)
    // ─────────────────────────────────────────────────────────────────────────
    var sc6 = proj.items.addComp("Scene_06_GhostlyMemory", W, H, 1.0, DUR, FPS);
    sc6.parentFolder = folderScenes;

    var sc6Bg = sc6.layers.addSolid([0.04, 0.05, 0.09], "Ethereal_Mist_BG", W, H, 1.0);
    sc6Bg.moveToEnd();

    if (footageGhost) {
        var ghostLayer = sc6.layers.add(footageGhost);
        ghostLayer.name = "Ghostly_Silhouette_Figure";
        ghostLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([75, 75]);
        
        var ghPos = ghostLayer.property("ADBE Transform Group").property("ADBE Position");
        ghPos.setValueAtTime(0.5,  [960, 620]);
        ghPos.setValueAtTime(14.0, [960, 460]);
        easeAll(ghPos);

        var ghOp = ghostLayer.property("ADBE Transform Group").property("ADBE Opacity");
        ghOp.setValueAtTime(0.5,  100);
        ghOp.setValueAtTime(9.0,  85);
        ghOp.setValueAtTime(14.5, 0);
        easeAll(ghOp);

        try {
            var fBlur = ghostLayer.Effects.addProperty("ADBE Box Blur2");
            fBlur.property("ADBE Box Blur2-0001").setValue(14);
        } catch(e) {}

        try {
            var turb = ghostLayer.Effects.addProperty("ADBE Turbulent Displace");
            turb.property("ADBE Turbulent Displace-0002").setValue(45);
            turb.property("ADBE Turbulent Displace-0003").setValue(65);
            var evol = turb.property("ADBE Turbulent Displace-0006");
            evol.expression = "time * 90;";
        } catch(e) {}
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 7 - Final Composite and Rendering (0-95s)
    // ─────────────────────────────────────────────────────────────────────────
    var masterComp = proj.items.addComp("MASTER_JourneyOfMemory", W, H, 1.0, DUR, FPS);
    masterComp.parentFolder = folderScenes;

    // 1. Soundtrack Audio
    if (footageAudio) {
        var mAudio = masterComp.layers.add(footageAudio);
        mAudio.name = "Nostalgic_Memory_Soundtrack";
        var aLev = mAudio.property("ADBE Audio Group").property("ADBE Audio Levels");
        aLev.setValueAtTime(0,       [-48.0, -48.0]);
        aLev.setValueAtTime(3.0,     [0.0, 0.0]);
        aLev.setValueAtTime(DUR - 4, [0.0, 0.0]);
        aLev.setValueAtTime(DUR,     [-48.0, -48.0]);
        easeAll(aLev);
    }

    // 2. Camera Shutter Sound Effect
    if (footageShutter) {
        var sfxShutter = masterComp.layers.add(footageShutter);
        sfxShutter.startTime = 47.0;
    }

    // 3. Whoosh SFX at transitions
    if (footageWhoosh) {
        var w1 = masterComp.layers.add(footageWhoosh);
        w1.startTime = 14.0;
        var w2 = masterComp.layers.add(footageWhoosh);
        w2.startTime = 55.0;
    }

    // 4. Assemble Scenes sequentially with gentle cross-dissolves
    // Scene 1: Memory Reveal (0 - 16s)
    var lSc1 = masterComp.layers.add(sc1);
    lSc1.startTime = 0;
    var op1 = lSc1.property("ADBE Transform Group").property("ADBE Opacity");
    op1.setValueAtTime(14.0, 100);
    op1.setValueAtTime(16.0, 0);
    easeAll(op1);

    // Scene 2: Flag Animation (14 - 30s)
    var lSc2 = masterComp.layers.add(sc2);
    lSc2.startTime = 14.0;
    var op2 = lSc2.property("ADBE Transform Group").property("ADBE Opacity");
    op2.setValueAtTime(14.0, 0);
    op2.setValueAtTime(15.5, 100);
    op2.setValueAtTime(28.0, 100);
    op2.setValueAtTime(30.0, 0);
    easeAll(op2);

    // Scene 3: Motion Text Shadow (28 - 44s)
    var lSc3 = masterComp.layers.add(sc3);
    lSc3.startTime = 28.0;
    var op3 = lSc3.property("ADBE Transform Group").property("ADBE Opacity");
    op3.setValueAtTime(28.0, 0);
    op3.setValueAtTime(29.5, 100);
    op3.setValueAtTime(42.0, 100);
    op3.setValueAtTime(44.0, 0);
    easeAll(op3);

    // Scene 4: Designed Memory Object (Camera) (42 - 58s)
    var lSc4 = masterComp.layers.add(sc4);
    lSc4.startTime = 42.0;
    var op4 = lSc4.property("ADBE Transform Group").property("ADBE Opacity");
    op4.setValueAtTime(42.0, 0);
    op4.setValueAtTime(43.5, 100);
    op4.setValueAtTime(56.0, 100);
    op4.setValueAtTime(58.0, 0);
    easeAll(op4);

    // Scene 5: Footsteps Across Map (56 - 72s)
    var lSc5 = masterComp.layers.add(sc5);
    lSc5.startTime = 56.0;
    var op5 = lSc5.property("ADBE Transform Group").property("ADBE Opacity");
    op5.setValueAtTime(56.0, 0);
    op5.setValueAtTime(57.5, 100);
    op5.setValueAtTime(70.0, 100);
    op5.setValueAtTime(72.0, 0);
    easeAll(op5);

    // Scene 6: Ghostly Memory (70 - 95s)
    var lSc6 = masterComp.layers.add(sc6);
    lSc6.startTime = 70.0;
    var op6 = lSc6.property("ADBE Transform Group").property("ADBE Opacity");
    op6.setValueAtTime(70.0, 0);
    op6.setValueAtTime(71.5, 100);
    op6.setValueAtTime(92.0, 100);
    op6.setValueAtTime(95.0, 0);
    easeAll(op6);

    // 5. Vintage Paper Texture Overlay
    if (footagePaper) {
        var pOverlay = masterComp.layers.add(footagePaper);
        pOverlay.name = "Vintage_Paper_Grain";
        pOverlay.property("ADBE Transform Group").property("ADBE Scale").setValue([110, 110]);
        pOverlay.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);
        pOverlay.property("ADBE Transform Group").property("ADBE Opacity").setValue(28);
        pOverlay.blendingMode = BlendingMode.SOFT_LIGHT;
    }

    // 6. Master Camera Push-In
    var masterNull = masterComp.layers.addNull();
    masterNull.name = "Master_Cinematic_PushIn";
    var mnScale = masterNull.property("ADBE Transform Group").property("ADBE Scale");
    mnScale.setValueAtTime(0,   [100, 100]);
    mnScale.setValueAtTime(DUR, [103.0, 103.0]);
    easeAll(mnScale);
    lSc1.parent = masterNull;
    lSc2.parent = masterNull;
    lSc3.parent = masterNull;
    lSc4.parent = masterNull;
    lSc5.parent = masterNull;
    lSc6.parent = masterNull;

    // 7. Lumetri Color Adjustment Layer
    var adjLayer = masterComp.layers.addSolid([1, 1, 1], "Lumetri_FilmGrade_AdjustmentLayer", W, H, 1.0);
    adjLayer.adjustmentLayer = true;
    try {
        adjLayer.Effects.addProperty("ADBE Lumetri");
    } catch(e) {}

    // Save project
    var saveFile = new File("C:/Users/Admin/Documents/GitHub/AE/Project The Journey of a Memory A Motion Story in After Effects/Journey_Of_Memory_MotionStory.aep");
    proj.save(saveFile);

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
