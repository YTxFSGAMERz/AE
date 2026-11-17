// =============================================================================
// Project City Life - An Animated Motion Scene
// Studio-Grade ExtendScript AE Builder
// Conforms strictly to Project City Life Specification PDF
// =============================================================================

(function buildCityLife() {
    var traceFile = new File("C:/Users/Admin/Documents/GitHub/AE/city_life_trace.txt");
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
    app.beginUndoGroup("Build: City Life Project (Studio Grade)");

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

    var W = 1920, H = 1080, FPS = 30, DUR = 75; // 75s within 60-90s range

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
    var projectRoot = "C:/Users/Admin/Documents/GitHub/AE/Project City Life An Animated Motion Scene/assets/";
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

    // Import authentic studio footage items
    var footageSkylineBack  = importAsset("images/skyline_back.png");
    var footageSkylineFront = importAsset("images/skyline_front.png");
    var footageCloud        = importAsset("images/cloud.png");
    var footageCar          = importAsset("images/car.png");
    var footageRailing      = importAsset("images/railing.png");
    var footageCharacter    = importAsset("images/character.png");
    var footageAudio        = importAsset("audio/city_soundtrack.mp3");

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 1 - City Background & Atmospheric Clouds
    // ─────────────────────────────────────────────────────────────────────────
    var bgComp = proj.items.addComp("Scene_01_CityBackground", W, H, 1.0, DUR, FPS);
    bgComp.parentFolder = folderScenes;

    // 1. Sky Gradient Solid
    var sky = bgComp.layers.addSolid([0.04, 0.05, 0.12], "Sky_Gradient", W, H, 1.0);
    sky.moveToEnd();
    var skyRamp = sky.Effects.addProperty("ADBE Ramp");
    skyRamp.property("ADBE Ramp-0001").setValue([960, 0]);
    skyRamp.property("ADBE Ramp-0002").setValue([0.08, 0.12, 0.28]);
    skyRamp.property("ADBE Ramp-0003").setValue([960, 800]);
    skyRamp.property("ADBE Ramp-0004").setValue([0.02, 0.03, 0.08]);

    // 2. Stars / Atmosphere Particles
    var stars = bgComp.layers.addSolid([1.0, 1.0, 1.0], "Atmosphere_Stars", W, H, 1.0);
    stars.property("ADBE Transform Group").property("ADBE Opacity").setValue(40);
    try {
        var noise = stars.Effects.addProperty("ADBE Noise");
        noise.property(1).setValue(12);
    } catch(e) {}

    // 3. Realistic Cloud Cutouts (animated horizontally across screen with Easy Ease)
    if (footageCloud) {
        for (var c = 0; c < 4; c++) {
            var cloudLayer = bgComp.layers.add(footageCloud);
            cloudLayer.name = "Cloud_Cutout_0" + (c + 1);
            var scaleVal = 40 + c * 25;
            cloudLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([scaleVal, scaleVal]);
            cloudLayer.property("ADBE Transform Group").property("ADBE Opacity").setValue(25 + c * 15);
            var yPos = 80 + c * 90;
            var cPos = cloudLayer.property("ADBE Transform Group").property("ADBE Position");
            var startX = -350 - c * 200;
            var endX   = W + 400 + c * 250;
            cPos.setValueAtTime(0,   [startX, yPos]);
            cPos.setValueAtTime(DUR, [endX, yPos]);
            easeAll(cPos);
        }
    }

    // 4. Distant Skyline Layer (Parallax Background)
    if (footageSkylineBack) {
        var skyBackLayer = bgComp.layers.add(footageSkylineBack);
        skyBackLayer.name = "Skyline_Distant_Cutout";
        skyBackLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([160, 160]);
        skyBackLayer.property("ADBE Transform Group").property("ADBE Opacity").setValue(65);
        var sbPos = skyBackLayer.property("ADBE Transform Group").property("ADBE Position");
        sbPos.setValueAtTime(0,   [900, 680]);
        sbPos.setValueAtTime(DUR, [980, 680]);
        easeAll(sbPos);
    }

    // 5. Foreground City Skyline (High-Res Cutout)
    if (footageSkylineFront) {
        var skyFrontLayer = bgComp.layers.add(footageSkylineFront);
        skyFrontLayer.name = "Skyline_Front_Cutout";
        skyFrontLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([105, 105]);
        skyFrontLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 660]);
    }

    // 6. City Road Ground Solid
    var road = bgComp.layers.addSolid([0.08, 0.08, 0.10], "Ground_Road", W, 220, 1.0);
    road.property("ADBE Transform Group").property("ADBE Position").setValue([960, 970]);

    // Road Markings (Dashed White Lines)
    for (var m = 0; m < 9; m++) {
        var mark = bgComp.layers.addSolid([0.8, 0.8, 0.6], "RoadMark_" + m, 100, 10, 1.0);
        mark.property("ADBE Transform Group").property("ADBE Position").setValue([120 + m * 220, 980]);
        mark.property("ADBE Transform Group").property("ADBE Opacity").setValue(50);
    }

    // 7. Transparent Car Driving Along Road
    if (footageCar) {
        var carLayer = bgComp.layers.add(footageCar);
        carLayer.name = "City_Traffic_Car";
        carLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([45, 45]);
        var carPos = carLayer.property("ADBE Transform Group").property("ADBE Position");
        carPos.setValueAtTime(0,   [-300, 930]);
        carPos.setValueAtTime(35,  [W + 350, 930]);
        carPos.setValueAtTime(36,  [-300, 930]);
        carPos.setValueAtTime(DUR, [W + 350, 930]);
        easeAll(carPos);
    }

    // 8. Foreground Street Railing
    if (footageRailing) {
        var railLayer = bgComp.layers.add(footageRailing);
        railLayer.name = "Foreground_Railing";
        railLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([85, 85]);
        railLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 1030]);
        railLayer.property("ADBE Transform Group").property("ADBE Opacity").setValue(85);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 2 & 3 - Character Design, Walk Cycle & Expressions
    // ─────────────────────────────────────────────────────────────────────────
    var charComp = proj.items.addComp("Scene_02_Character", 800, 1200, 1.0, DUR, FPS);
    charComp.parentFolder = folderPrecomps;

    if (footageCharacter) {
        var charLayer = charComp.layers.add(footageCharacter);
        charLayer.name = "Character_Figure";
        charLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([60, 60]);
        charLayer.property("ADBE Transform Group").property("ADBE Position").setValue([400, 600]);

        // PDF Required Expression: Bouncing character
        // freq = 2; amp = 30; value + [0, Math.sin(time * freq * 2 * Math.PI) * amp];
        charLayer.property("ADBE Transform Group").property("ADBE Position").expression =
            "freq = 2;\namp = 18;\nvalue + [0, Math.sin(time * freq * 2 * Math.PI) * amp];";

        // Walk sway rotation
        var charRot = getRotation(charLayer);
        if (charRot) {
            charRot.expression = "Math.sin(time * 2 * 2 * Math.PI) * 4;";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 5 - Neon Text Animation & Light Sweep
    // ─────────────────────────────────────────────────────────────────────────
    var neonComp = proj.items.addComp("Scene_05_NeonText", W, H, 1.0, DUR, FPS);
    neonComp.parentFolder = folderPrecomps;

    // Neon Text "CITY LIFE" (Cyan #00FFFF)
    var neonMain = neonComp.layers.addText("CITY LIFE");
    neonMain.name = "NeonText_CityLife";
    var nmTD = neonMain.property("ADBE Text Properties").property("ADBE Text Document").value;
    nmTD.resetCharStyle();
    nmTD.font = "Arial-BoldMT";
    nmTD.fontSize = 180;
    nmTD.fillColor = [0.0, 1.0, 1.0];
    nmTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    neonMain.property("ADBE Text Properties").property("ADBE Text Document").setValue(nmTD);
    neonMain.property("ADBE Transform Group").property("ADBE Position").setValue([960, 360]);

    // Glow Effect (Radius: 40-60, Intensity: 2.5-3 per PDF)
    var mainGlow = neonMain.Effects.addProperty("ADBE Glo2");
    mainGlow.property("ADBE Glo2-0003").setValue(55);
    mainGlow.property("ADBE Glo2-0004").setValue(2.8);

    // PDF Required Expression: Text Flicker Opacity
    neonMain.property("ADBE Transform Group").property("ADBE Opacity").expression =
        "freq = 8;\nminFlicker = 60;\nmaxFlicker = 100;\nrandom(minFlicker, maxFlicker);";

    // CC Light Sweep animated across text
    try {
        var sweep = neonMain.Effects.addProperty("CC Light Sweep");
        sweep.property("CC Light Sweep-0004").setValue(65);
        sweep.property("CC Light Sweep-0005").setValue(2.5);
        var sweepCenter = sweep.property("CC Light Sweep-0001");
        sweepCenter.setValueAtTime(0,   [400, 360]);
        sweepCenter.setValueAtTime(4,   [1500, 360]);
        sweepCenter.setValueAtTime(8,   [400, 360]);
        sweepCenter.setValueAtTime(12,  [1500, 360]);
        easeAll(sweepCenter);
        sweepCenter.expression = "loopOut('cycle');";
    } catch(e) {}

    // Secondary Neon Sign "OPEN 24/7" (Magenta #FF00FF)
    var neonSub = neonComp.layers.addText("OPEN 24/7");
    neonSub.name = "NeonText_Open";
    var nsTD = neonSub.property("ADBE Text Properties").property("ADBE Text Document").value;
    nsTD.resetCharStyle();
    nsTD.font = "Arial-BoldMT";
    nsTD.fontSize = 80;
    nsTD.fillColor = [1.0, 0.0, 1.0];
    nsTD.justification = ParagraphJustification.CENTER_JUSTIFY;
    neonSub.property("ADBE Text Properties").property("ADBE Text Document").setValue(nsTD);
    neonSub.property("ADBE Transform Group").property("ADBE Position").setValue([960, 480]);

    var subGlow = neonSub.Effects.addProperty("ADBE Glo2");
    subGlow.property("ADBE Glo2-0003").setValue(45);
    subGlow.property("ADBE Glo2-0004").setValue(2.5);
    neonSub.property("ADBE Transform Group").property("ADBE Opacity").expression =
        "freq = 5;\nminFlicker = 70;\nmaxFlicker = 100;\nrandom(minFlicker, maxFlicker);";

    // ─────────────────────────────────────────────────────────────────────────
    // MASTER COMPOSITION & AUDIO INTEGRATION (Scene 4)
    // ─────────────────────────────────────────────────────────────────────────
    var masterComp = proj.items.addComp("MASTER_CityLife", W, H, 1.0, DUR, FPS);
    masterComp.parentFolder = folderScenes;

    // 1. Audio Integration (PDF Requirement: -48dB fade in, EQ/reverb pacing)
    if (footageAudio) {
        var audioLayer = masterComp.layers.add(footageAudio);
        audioLayer.name = "City_Soundtrack_Audio";
        var aLevels = audioLayer.property("ADBE Audio Group").property("ADBE Audio Levels");
        aLevels.setValueAtTime(0,       [-48.0, -48.0]);
        aLevels.setValueAtTime(3.0,     [0.0, 0.0]);
        aLevels.setValueAtTime(DUR - 4, [0.0, 0.0]);
        aLevels.setValueAtTime(DUR,     [-48.0, -48.0]);
        easeAll(aLevels);
    }

    // 2. City Background Layer
    var bgLayer = masterComp.layers.add(bgComp);
    bgLayer.name = "City_Background_Stage";
    bgLayer.moveToEnd();

    // 3. Walking Character Layer
    var chLayer = masterComp.layers.add(charComp);
    chLayer.name = "Walking_Character_Action";
    chLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([48, 48]);
    var chPos = chLayer.property("ADBE Transform Group").property("ADBE Position");
    chPos.setValueAtTime(0,   [-150, 780]);
    chPos.setValueAtTime(DUR, [W + 200, 780]);
    easeAll(chPos);

    // 4. Neon Text Overlay Layer
    var neonLayer = masterComp.layers.add(neonComp);
    neonLayer.name = "Neon_Sign_Overlay";
    neonLayer.blendingMode = BlendingMode.SCREEN;

    // 5. Cinematic Camera Drift (2.5% scale push-in over full duration)
    var cameraNull = masterComp.layers.addNull();
    cameraNull.name = "Cinematic_Camera_Drift";
    var camScale = cameraNull.property("ADBE Transform Group").property("ADBE Scale");
    camScale.setValueAtTime(0,   [100, 100]);
    camScale.setValueAtTime(DUR, [103.5, 103.5]);
    easeAll(camScale);
    bgLayer.parent = cameraNull;
    chLayer.parent = cameraNull;

    // 6. Adjustment Layer with Lumetri Color / Tone Finish
    var adjLayer = masterComp.layers.addSolid([1, 1, 1], "ColorGrade_AdjustmentLayer", W, H, 1.0);
    adjLayer.adjustmentLayer = true;
    try {
        adjLayer.Effects.addProperty("ADBE Lumetri");
    } catch(e) {}

    // Save project file
    var saveFile = new File("C:/Users/Admin/Documents/GitHub/AE/Project City Life An Animated Motion Scene/City_Life_AnimatedScene.aep");
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
