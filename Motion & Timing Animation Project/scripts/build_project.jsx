// Adobe After Effects ExtendScript
// Project: Motion & Timing Animation Project
// Automatically builds the full 60-second composition with shapes, text, footage stabilization, and time remapping.

(function() {
    app.beginUndoGroup("Build Motion & Timing Animation Project");

    // 1. Create / Reset Project
    // -------------------------------------------------------------
    var project = app.project;
    
    // Project specifications
    var compWidth = 1920;
    var compHeight = 1080;
    var compPixelAspect = 1.0;
    var compDuration = 60.0; // 60 seconds
    var compFrameRate = 30.0;
    var compName = "Final_Motion_Project";

    // Create main composition
    var mainComp = project.items.addComp(
        compName,
        compWidth,
        compHeight,
        compPixelAspect,
        compDuration,
        compFrameRate
    );
    mainComp.motionBlur = true; // Enable motion blur globally for the comp

    // Helper: Apply Easy Ease (Speed = 0, Influence = 75)
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

    // 2. Set Up the Scene - Background Solid & Gradient Ramp
    // -------------------------------------------------------------
    var bgSolid = mainComp.layers.addSolid(
        [0.92, 0.95, 0.98], // Light sky tone
        "01_Stage_Background",
        compWidth,
        compHeight,
        1.0,
        compDuration
    );
    bgSolid.moveToEnd();

    // Add subtle gradient ramp to give a rich studio backdrop
    var rampFx = bgSolid.property("ADBE Effect Parade").addProperty("ADBE Ramp");
    if (rampFx) {
        rampFx.property("ADBE Ramp-0001").setValue([960, 0]);      // Start of Ramp
        rampFx.property("ADBE Ramp-0002").setValue([0.86, 0.92, 0.98, 1.0]); // Start Color (Sky Blue)
        rampFx.property("ADBE Ramp-0003").setValue([960, 1080]);   // End of Ramp
        rampFx.property("ADBE Ramp-0004").setValue([0.96, 0.97, 1.00, 1.0]); // End Color (Clean Soft Mist)
        rampFx.property("ADBE Ramp-0005").setValue(1);             // Linear Ramp
    }
    bgSolid.locked = true;

    // 3. Shape 1: Circle (Ellipse)
    // -------------------------------------------------------------
    var circleLayer = mainComp.layers.addShape();
    circleLayer.name = "02_Shape_Circle";
    circleLayer.motionBlur = true;

    var circleContents = circleLayer.property("ADBE Root Vectors Group");
    var circleGroup = circleContents.addProperty("ADBE Vector Group");
    var circleGroupContents = circleGroup.property("ADBE Vectors Group");
    
    var ellipse = circleGroupContents.addProperty("ADBE Vector Shape - Ellipse");
    ellipse.property("ADBE Vector Ellipse Size").setValue([220, 220]);
    
    var circleFill = circleGroupContents.addProperty("ADBE Vector Graphic - Fill");
    circleFill.property("ADBE Vector Fill Color").setValue([0.18, 0.52, 0.92, 1.0]); // Royal Azure

    // Circle Animation
    var cTransform = circleLayer.property("ADBE Transform Group");
    var cPos = cTransform.property("ADBE Position");
    var cScale = cTransform.property("ADBE Scale");
    var cRot = cTransform.property("ADBE Rotate Z");
    var cOp = cTransform.property("ADBE Opacity");

    // Intro Phase (0s - 16s)
    cPos.setValueAtTime(0.5, [-150, 480]);
    cPos.setValueAtTime(2.5, [750, 480]);
    cPos.setValueAtTime(5.5, [1300, 320]);
    cPos.setValueAtTime(9.0, [500, 700]);
    cPos.setValueAtTime(13.0, [960, 540]);
    cPos.setValueAtTime(16.0, [960, -250]); // Exit

    cScale.setValueAtTime(0.5, [0, 0]);
    cScale.setValueAtTime(2.2, [120, 120]);
    cScale.setValueAtTime(2.5, [100, 100]);
    cScale.setValueAtTime(12.0, [100, 100]);
    cScale.setValueAtTime(13.0, [130, 130]);
    cScale.setValueAtTime(16.0, [0, 0]);

    cRot.setValueAtTime(0.5, 0);
    cRot.setValueAtTime(6.0, 360);
    cRot.setValueAtTime(13.0, 720);
    cRot.setValueAtTime(16.0, 1080);

    cOp.setValueAtTime(0.5, 0);
    cOp.setValueAtTime(1.8, 100);
    cOp.setValueAtTime(14.5, 100);
    cOp.setValueAtTime(16.0, 0);

    // Rejoin Phase 3 (38s - 60s)
    cPos.setValueAtTime(38.0, [-200, 540]);
    cPos.setValueAtTime(41.0, [650, 540]);
    cPos.setValueAtTime(46.0, [850, 420]);
    cPos.setValueAtTime(52.0, [960, 540]);
    cPos.setValueAtTime(58.0, [960, 540]);

    cScale.setValueAtTime(38.0, [0, 0]);
    cScale.setValueAtTime(40.5, [115, 115]);
    cScale.setValueAtTime(41.0, [100, 100]);
    cScale.setValueAtTime(57.0, [100, 100]);
    cScale.setValueAtTime(59.5, [0, 0]);

    cOp.setValueAtTime(38.0, 0);
    cOp.setValueAtTime(40.0, 90);
    cOp.setValueAtTime(57.0, 90);
    cOp.setValueAtTime(59.5, 0);

    applyEasyEase(cPos);
    applyEasyEase(cScale);
    applyEasyEase(cRot);
    applyEasyEase(cOp);

    // 4. Shape 2: Square (Rounded Rectangle)
    // -------------------------------------------------------------
    var squareLayer = mainComp.layers.addShape();
    squareLayer.name = "03_Shape_Square";
    squareLayer.motionBlur = true;

    var sqContents = squareLayer.property("ADBE Root Vectors Group");
    var sqGroup = sqContents.addProperty("ADBE Vector Group");
    var sqGroupContents = sqGroup.property("ADBE Vectors Group");

    var rect = sqGroupContents.addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([200, 200]);
    rect.property("ADBE Vector Rect Roundness").setValue(28);

    var sqFill = sqGroupContents.addProperty("ADBE Vector Graphic - Fill");
    sqFill.property("ADBE Vector Fill Color").setValue([0.98, 0.42, 0.32, 1.0]); // Vivid Coral

    var sqTransform = squareLayer.property("ADBE Transform Group");
    var sqPos = sqTransform.property("ADBE Position");
    var sqScale = sqTransform.property("ADBE Scale");
    var sqRot = sqTransform.property("ADBE Rotate Z");
    var sqOp = sqTransform.property("ADBE Opacity");

    // Intro Phase (1s - 16s)
    sqPos.setValueAtTime(1.0, [2080, 500]);
    sqPos.setValueAtTime(3.2, [1180, 500]);
    sqPos.setValueAtTime(6.5, [600, 360]);
    sqPos.setValueAtTime(10.0, [1400, 680]);
    sqPos.setValueAtTime(13.2, [960, 540]);
    sqPos.setValueAtTime(16.2, [2150, 540]);

    sqScale.setValueAtTime(1.0, [0, 0]);
    sqScale.setValueAtTime(2.8, [125, 125]);
    sqScale.setValueAtTime(3.2, [100, 100]);
    sqScale.setValueAtTime(12.5, [100, 100]);
    sqScale.setValueAtTime(13.2, [130, 130]);
    sqScale.setValueAtTime(16.2, [0, 0]);

    sqRot.setValueAtTime(1.0, -180);
    sqRot.setValueAtTime(4.0, 90);
    sqRot.setValueAtTime(8.5, 270);
    sqRot.setValueAtTime(13.2, 540);
    sqRot.setValueAtTime(16.2, 720);

    sqOp.setValueAtTime(1.0, 0);
    sqOp.setValueAtTime(2.5, 95);
    sqOp.setValueAtTime(14.5, 95);
    sqOp.setValueAtTime(16.2, 0);

    // Rejoin Phase 3 (38s - 60s)
    sqPos.setValueAtTime(38.5, [2100, 540]);
    sqPos.setValueAtTime(41.5, [1270, 540]);
    sqPos.setValueAtTime(46.5, [1070, 660]);
    sqPos.setValueAtTime(52.5, [960, 540]);
    sqPos.setValueAtTime(58.0, [960, 540]);

    sqScale.setValueAtTime(38.5, [0, 0]);
    sqScale.setValueAtTime(41.0, [115, 115]);
    sqScale.setValueAtTime(41.5, [100, 100]);
    sqScale.setValueAtTime(57.0, [100, 100]);
    sqScale.setValueAtTime(59.5, [0, 0]);

    sqRot.setValueAtTime(38.5, 0);
    sqRot.setValueAtTime(46.5, 180);
    sqRot.setValueAtTime(58.0, 360);

    sqOp.setValueAtTime(38.5, 0);
    sqOp.setValueAtTime(40.5, 90);
    sqOp.setValueAtTime(57.0, 90);
    sqOp.setValueAtTime(59.5, 0);

    applyEasyEase(sqPos);
    applyEasyEase(sqScale);
    applyEasyEase(sqRot);
    applyEasyEase(sqOp);

    // 5. Shape 3: Triangle (Polystar - 3 Points)
    // -------------------------------------------------------------
    var triLayer = mainComp.layers.addShape();
    triLayer.name = "04_Shape_Triangle";
    triLayer.motionBlur = true;

    var triContents = triLayer.property("ADBE Root Vectors Group");
    var triGroup = triContents.addProperty("ADBE Vector Group");
    var triGroupContents = triGroup.property("ADBE Vectors Group");

    var star = triGroupContents.addProperty("ADBE Vector Shape - Star");
    star.property("ADBE Vector Star Type").setValue(2); // Polygon
    star.property("ADBE Vector Star Points").setValue(3); // 3 points = triangle
    star.property("ADBE Vector Star Outer Radius").setValue(125);
    try { star.property("ADBE Vector Star Outer Roundess").setValue(8); } catch(e) {}

    var triFill = triGroupContents.addProperty("ADBE Vector Graphic - Fill");
    triFill.property("ADBE Vector Fill Color").setValue([0.15, 0.78, 0.62, 1.0]); // Emerald Green

    var triTransform = triLayer.property("ADBE Transform Group");
    var triPos = triTransform.property("ADBE Position");
    var triScale = triTransform.property("ADBE Scale");
    var triRot = triTransform.property("ADBE Rotate Z");
    var triOp = triTransform.property("ADBE Opacity");

    // Intro Phase (1.5s - 16.5s)
    triPos.setValueAtTime(1.5, [960, 1250]);
    triPos.setValueAtTime(3.8, [960, 680]);
    triPos.setValueAtTime(7.0, [1150, 420]);
    triPos.setValueAtTime(10.5, [720, 360]);
    triPos.setValueAtTime(13.5, [960, 540]);
    triPos.setValueAtTime(16.5, [960, 1300]);

    triScale.setValueAtTime(1.5, [0, 0]);
    triScale.setValueAtTime(3.4, [125, 125]);
    triScale.setValueAtTime(3.8, [100, 100]);
    triScale.setValueAtTime(12.8, [100, 100]);
    triScale.setValueAtTime(13.5, [130, 130]);
    triScale.setValueAtTime(16.5, [0, 0]);

    triRot.setValueAtTime(1.5, 0);
    triRot.setValueAtTime(5.5, 180);
    triRot.setValueAtTime(9.5, 360);
    triRot.setValueAtTime(13.5, 720);
    triRot.setValueAtTime(16.5, 900);

    triOp.setValueAtTime(1.5, 0);
    triOp.setValueAtTime(3.0, 90);
    triOp.setValueAtTime(14.8, 90);
    triOp.setValueAtTime(16.5, 0);

    // Rejoin Phase 3 (39s - 60s)
    triPos.setValueAtTime(39.0, [960, -200]);
    triPos.setValueAtTime(42.0, [960, 360]);
    triPos.setValueAtTime(47.0, [960, 720]);
    triPos.setValueAtTime(53.0, [960, 540]);
    triPos.setValueAtTime(58.0, [960, 540]);

    triScale.setValueAtTime(39.0, [0, 0]);
    triScale.setValueAtTime(41.5, [115, 115]);
    triScale.setValueAtTime(42.0, [100, 100]);
    triScale.setValueAtTime(57.0, [100, 100]);
    triScale.setValueAtTime(59.5, [0, 0]);

    triRot.setValueAtTime(39.0, 0);
    triRot.setValueAtTime(47.0, 240);
    triRot.setValueAtTime(58.0, 360);

    triOp.setValueAtTime(39.0, 0);
    triOp.setValueAtTime(41.0, 90);
    triOp.setValueAtTime(57.0, 90);
    triOp.setValueAtTime(59.5, 0);

    applyEasyEase(triPos);
    applyEasyEase(triScale);
    applyEasyEase(triRot);
    applyEasyEase(triOp);

    // 6. Text Animation: Main Title "The Art of Motion"
    // -------------------------------------------------------------
    var titleLayer = mainComp.layers.addText("The Art of Motion");
    titleLayer.name = "05_Title_Text";
    titleLayer.motionBlur = true;

    var titleProp = titleLayer.property("ADBE Text Properties").property("ADBE Text Document");
    var titleDoc = titleProp.value;
    titleDoc.fontSize = 84;
    titleDoc.fillColor = [0.10, 0.15, 0.25]; // Slate Navy
    titleDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    titleProp.setValue(titleDoc);

    var titleTrans = titleLayer.property("ADBE Transform Group");
    var tPos = titleTrans.property("ADBE Position");
    var tScale = titleTrans.property("ADBE Scale");
    var tOp = titleTrans.property("ADBE Opacity");

    tPos.setValueAtTime(0.3, [960, 470]);
    tPos.setValueAtTime(2.0, [960, 380]);
    tPos.setValueAtTime(13.5, [960, 380]);
    tPos.setValueAtTime(15.5, [960, 300]);

    tScale.setValueAtTime(0.3, [80, 80]);
    tScale.setValueAtTime(1.8, [105, 105]);
    tScale.setValueAtTime(2.2, [100, 100]);
    tScale.setValueAtTime(13.5, [100, 100]);
    tScale.setValueAtTime(15.5, [90, 90]);

    tOp.setValueAtTime(0.3, 0);
    tOp.setValueAtTime(1.8, 100);
    tOp.setValueAtTime(14.0, 100);
    tOp.setValueAtTime(15.5, 0);

    applyEasyEase(tPos);
    applyEasyEase(tScale);
    applyEasyEase(tOp);

    // Subtitle Text: "Motion & Timing Animation Project"
    var subLayer = mainComp.layers.addText("Motion & Timing Animation Project");
    subLayer.name = "06_Subtitle_Text";
    subLayer.motionBlur = true;

    var subProp = subLayer.property("ADBE Text Properties").property("ADBE Text Document");
    var subDoc = subProp.value;
    subDoc.fontSize = 32;
    subDoc.fillColor = [0.35, 0.42, 0.52]; // Soft Slate
    subDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    subProp.setValue(subDoc);

    var subTrans = subLayer.property("ADBE Transform Group");
    var sPos = subTrans.property("ADBE Position");
    var sOp = subTrans.property("ADBE Opacity");

    sPos.setValueAtTime(1.0, [960, 460]);
    sPos.setValueAtTime(2.5, [960, 440]);
    sPos.setValueAtTime(13.5, [960, 440]);
    sPos.setValueAtTime(15.2, [960, 420]);

    sOp.setValueAtTime(1.0, 0);
    sOp.setValueAtTime(2.5, 100);
    sOp.setValueAtTime(13.8, 100);
    sOp.setValueAtTime(15.2, 0);

    applyEasyEase(sPos);
    applyEasyEase(sOp);

    // 7. Video Clip Import, Warp Stabilizer & Time Remapping
    // -------------------------------------------------------------
    var footagePath = "C:/Users/Admin/Documents/GitHub/AE/Motion & Timing Animation Project/assets/sample_footage.mp4";
    var footageFile = new File(footagePath);
    var footageLayer = null;

    if (footageFile.exists) {
        var importOptions = new ImportOptions(footageFile);
        var footageItem = project.importFile(importOptions);
        footageLayer = mainComp.layers.add(footageItem);
        footageLayer.name = "07_Footage_Stabilized_TimeRemapped";
        footageLayer.motionBlur = true;

        // Position on timeline: Start at 17.5s, active through 37.5s (20s window)
        footageLayer.startTime = 17.5;
        footageLayer.inPoint = 17.5;
        footageLayer.outPoint = 37.5;

        // Animate entrance scale and opacity
        var fTrans = footageLayer.property("ADBE Transform Group");
        var fScale = fTrans.property("ADBE Scale");
        var fOp = fTrans.property("ADBE Opacity");
        
        fScale.setValueAtTime(17.5, [85, 85]);
        fScale.setValueAtTime(19.0, [100, 100]);
        fScale.setValueAtTime(36.0, [100, 100]);
        fScale.setValueAtTime(37.5, [85, 85]);

        fOp.setValueAtTime(17.5, 0);
        fOp.setValueAtTime(18.5, 100);
        fOp.setValueAtTime(36.5, 100);
        fOp.setValueAtTime(37.5, 0);

        applyEasyEase(fScale);
        applyEasyEase(fOp);

        // Apply Warp Stabilizer (ADBE SubspaceStabilizer)
        try {
            var warpFx = footageLayer.property("ADBE Effect Parade").addProperty("ADBE SubspaceStabilizer");
            if (warpFx) {
                // Set Smoothness to 30% (Property 5 / ADBE SubspaceStabilizer-0020)
                warpFx.property("ADBE SubspaceStabilizer-0020").setValue(30.0);
            }
        } catch(errWarp) {}

        // Enable Time Remapping
        if (footageLayer.canSetTimeRemapEnabled) {
            footageLayer.timeRemapEnabled = true;
            var trProp = footageLayer.property("ADBE Time Remapping");

            // Keyframe Schedule (Clip duration is 12 seconds):
            // 1) 20.5s: Speed-up ramp (advances to clip t = 4.5s) -> Fast motion
            trProp.setValueAtTime(20.5, 4.5);
            // 2) 26.5s: Dramatic slow-motion (advances only from 4.5s to 6.0s over 6s) -> Slow-mo
            trProp.setValueAtTime(26.5, 6.0);
            // 3) 30.0s: Time reverse (plays backward from 6.0s to 3.5s over 3.5s) -> Reverse playback
            trProp.setValueAtTime(30.0, 3.5);
            // 4) 36.5s: Resumes normal forward motion to finish clip at 11.5s
            trProp.setValueAtTime(36.5, 11.5);

            applyEasyEase(trProp);
        }

        // Overlay Badge Label for the clip
        var clipLabel = mainComp.layers.addText("WARP STABILIZER (30%) • TIME REMAPPING");
        clipLabel.name = "08_Clip_Feature_Label";
        var clProp = clipLabel.property("ADBE Text Properties").property("ADBE Text Document");
        var clDoc = clProp.value;
        clDoc.fontSize = 24;
        clDoc.fillColor = [1.0, 1.0, 1.0];
        clDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
        clProp.setValue(clDoc);

        var clTrans = clipLabel.property("ADBE Transform Group");
        clTrans.property("ADBE Position").setValue([960, 980]);
        var clOp = clTrans.property("ADBE Opacity");
        clOp.setValueAtTime(18.0, 0);
        clOp.setValueAtTime(19.0, 90);
        clOp.setValueAtTime(36.0, 90);
        clOp.setValueAtTime(37.0, 0);
        applyEasyEase(clOp);
    }

    // 8. Outro Title & Summary Card (48s - 60s)
    // -------------------------------------------------------------
    var outroTitle = mainComp.layers.addText("Mastery of Timing & Motion");
    outroTitle.name = "09_Outro_Title";
    outroTitle.motionBlur = true;

    var oProp = outroTitle.property("ADBE Text Properties").property("ADBE Text Document");
    var oDoc = oProp.value;
    oDoc.fontSize = 68;
    oDoc.fillColor = [0.10, 0.15, 0.25];
    oDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    oProp.setValue(oDoc);

    var otTrans = outroTitle.property("ADBE Transform Group");
    var otPos = otTrans.property("ADBE Position");
    var otScale = otTrans.property("ADBE Scale");
    var otOp = otTrans.property("ADBE Opacity");

    otPos.setValueAtTime(48.0, [960, 460]);
    otPos.setValueAtTime(50.0, [960, 410]);
    otPos.setValueAtTime(58.0, [960, 410]);
    otPos.setValueAtTime(59.8, [960, 390]);

    otScale.setValueAtTime(48.0, [85, 85]);
    otScale.setValueAtTime(50.0, [100, 100]);
    otScale.setValueAtTime(58.0, [100, 100]);
    otScale.setValueAtTime(59.8, [95, 95]);

    otOp.setValueAtTime(48.0, 0);
    otOp.setValueAtTime(50.0, 100);
    otOp.setValueAtTime(58.0, 100);
    otOp.setValueAtTime(59.8, 0);

    applyEasyEase(otPos);
    applyEasyEase(otScale);
    applyEasyEase(otOp);

    var outroSub = mainComp.layers.addText("Keyframing • Easing • Motion Blur • Warp Stabilizer • Time Remap");
    outroSub.name = "10_Outro_Subtitle";
    outroSub.motionBlur = true;

    var osProp = outroSub.property("ADBE Text Properties").property("ADBE Text Document");
    var osDoc = osProp.value;
    osDoc.fontSize = 28;
    osDoc.fillColor = [0.35, 0.45, 0.55];
    osDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    osProp.setValue(osDoc);

    var ostTrans = outroSub.property("ADBE Transform Group");
    var ostPos = ostTrans.property("ADBE Position");
    var ostOp = ostTrans.property("ADBE Opacity");

    ostPos.setValueAtTime(49.0, [960, 480]);
    ostPos.setValueAtTime(50.5, [960, 470]);
    ostPos.setValueAtTime(58.0, [960, 470]);

    ostOp.setValueAtTime(49.0, 0);
    ostOp.setValueAtTime(50.5, 95);
    ostOp.setValueAtTime(58.0, 95);
    ostOp.setValueAtTime(59.8, 0);

    applyEasyEase(ostPos);
    applyEasyEase(ostOp);

    // 9. Save Project as Final_Motion_Project.aep
    // -------------------------------------------------------------
    var aepPath = "C:/Users/Admin/Documents/GitHub/AE/Motion & Timing Animation Project/Final_Motion_Project.aep";
    var aepFile = new File(aepPath);
    project.save(aepFile);

    app.endUndoGroup();

    return "Successfully created composition 'Final_Motion_Project' (60s, 1080p @ 30fps) and saved to " + aepPath;
})();
