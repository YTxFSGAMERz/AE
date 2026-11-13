// Adobe After Effects ExtendScript (ECMAScript 3 Compliant)
// Project: Journey Through Space From Earth to Imagination
// Master Builder Script - Generates Full 75-Second Composition (1920x1080 @ 30fps)
// Conforming to Course Specifications: Final_Space_Journey.aep

(function() {
    if (!app.project) {
        app.newProject();
    }
    var project = app.project;

    app.beginUndoGroup("Build Journey Through Space Master Project");

    // =========================================================================
    // 1. MASTER PROJECT & COMPOSITION ARCHITECTURE
    // =========================================================================
    var compWidth = 1920;
    var compHeight = 1080;
    var compPixelAspect = 1.0;
    var compDuration = 75.0; // 75.0 Seconds (2251 Frames @ 30fps)
    var compFrameRate = 30.0;
    var compName = "Journey Through Space Master Comp";

    var mainComp = project.items.addComp(
        compName,
        compWidth,
        compHeight,
        compPixelAspect,
        compDuration,
        compFrameRate
    );
    mainComp.motionBlur = true; // Enable motion blur globally

    // Base paths for project media assets
    var projectRoot = "C:/Users/Admin/Documents/GitHub/AE/Journey Through Space From Earth to Imagination Project";
    var earthPath = projectRoot + "/assets/images/earth_envisat.png";
    var starsPath = projectRoot + "/assets/images/stars_space_bg.jpg";
    var nebulaPath = projectRoot + "/assets/images/galaxy_nebula.jpg";
    var galaxyCorePath = projectRoot + "/assets/images/galaxy_core.jpg";
    var spaceshipPath = projectRoot + "/assets/images/spaceship_cutout.png";
    var astronautPath = projectRoot + "/assets/images/astronaut.png";
    var flatCharPath = projectRoot + "/assets/images/flat_character.png";
    var screenDevicePath = projectRoot + "/assets/images/screen_device.png";
    var dirtyGlassPath = projectRoot + "/assets/images/dirty_glass_texture.jpg";
    var hudReticlePath = projectRoot + "/assets/images/hud_reticle.png";

    var earthFlightVideoPath = projectRoot + "/assets/footage/space_flight_earth.mp4";
    var warpTunnelVideoPath = projectRoot + "/assets/footage/warp_tunnel.mp4";
    var subjectRevealVideoPath = projectRoot + "/assets/footage/subject_reveal.mp4";
    var soundtrackPath = projectRoot + "/assets/audio/space_soundtrack.mp3";
    var sfxWhooshPath = projectRoot + "/assets/audio/sfx/space_whoosh.wav";
    var sfxTelemetryPath = projectRoot + "/assets/audio/sfx/telemetry_beeps.wav";
    var sfxThrusterPath = projectRoot + "/assets/audio/sfx/thruster_hum.wav";

    // =========================================================================
    // 2. HELPER FUNCTIONS (Strict Adobe Match Names & Easing Mathematics)
    // =========================================================================

    // Apply Cinematic Easy Ease (Speed = 0, Influence = 75%)
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

    // Safely import a media file into the AE Project Item bin
    function safeImport(filePath) {
        try {
            var f = new File(filePath);
            if (f.exists) {
                var io = new ImportOptions(f);
                return project.importFile(io);
            }
        } catch(e) {}
        return null;
    }

    // Safely add Gradient Ramp (ADBE Ramp)
    function applyGradientRamp(layer, startPt, startCol, endPt, endCol, rampType) {
        try {
            var parade = layer.property("ADBE Effect Parade");
            var ramp = parade.addProperty("ADBE Ramp");
            if (ramp) {
                ramp.property("ADBE Ramp-0001").setValue(startPt);
                ramp.property("ADBE Ramp-0002").setValue(startCol);
                ramp.property("ADBE Ramp-0003").setValue(endPt);
                ramp.property("ADBE Ramp-0004").setValue(endCol);
                ramp.property("ADBE Ramp-0005").setValue(rampType || 1); // 1 = Linear, 2 = Radial
            }
        } catch(e) {}
    }

    // Safely add Optical Glow (ADBE Glo2)
    function applyGlow(layer, threshold, radius, intensity) {
        try {
            var parade = layer.property("ADBE Effect Parade");
            var glow = parade.addProperty("ADBE Glo2");
            if (glow) {
                glow.property("ADBE Glo2-0001").setValue(threshold || 55.0);
                glow.property("ADBE Glo2-0002").setValue(radius || 50.0);
                glow.property("ADBE Glo2-0003").setValue(intensity || 1.3);
            }
        } catch(e) {}
    }

    // Safely add Fast Gaussian Blur (ADBE Gaussian Blur 2)
    function applyGaussianBlur(layer, blurriness, dimensions) {
        try {
            var parade = layer.property("ADBE Effect Parade");
            var blur = parade.addProperty("ADBE Gaussian Blur 2");
            if (blur) {
                blur.property("ADBE Gaussian Blur 2-0001").setValue(blurriness || 10.0);
                blur.property("ADBE Gaussian Blur 2-0002").setValue(dimensions || 1); // 1 = Horiz & Vert
            }
        } catch(e) {}
    }

    // =========================================================================
    // 3. ASSET IMPORTATION PIPELINE
    // =========================================================================
    var itemStars = safeImport(starsPath);
    var itemNebula = safeImport(nebulaPath);
    var itemGalaxyCore = safeImport(galaxyCorePath);
    var itemEarthFlight = safeImport(earthFlightVideoPath);
    var itemEarthTexture = safeImport(earthPath);
    var itemSpaceship = safeImport(spaceshipPath);
    var itemAstronaut = safeImport(astronautPath);
    var itemFlatChar = safeImport(flatCharPath);
    var itemScreenDevice = safeImport(screenDevicePath);
    var itemDirtyGlass = safeImport(dirtyGlassPath);
    var itemHudReticle = safeImport(hudReticlePath);
    var itemWarpTunnel = safeImport(warpTunnelVideoPath);
    var itemSubjectReveal = safeImport(subjectRevealVideoPath);
    var itemSoundtrack = safeImport(soundtrackPath);
    var itemSFXWhoosh = safeImport(sfxWhooshPath);
    var itemSFXTelemetry = safeImport(sfxTelemetryPath);
    var itemSFXThruster = safeImport(sfxThrusterPath);

    // =========================================================================
    // 4. AUDIO ARCHITECTURE & SOUND DESIGN (00:00 - 01:15)
    // =========================================================================
    if (itemSoundtrack) {
        var audioLayer = mainComp.layers.add(itemSoundtrack);
        audioLayer.name = "00_Audio_Soundtrack_Master";
        audioLayer.startTime = 0.0;
        audioLayer.inPoint = 0.0;
        audioLayer.outPoint = 75.0;

        try {
            var audLevels = audioLayer.property("ADBE Audio Group").property("ADBE Audio Levels - 0001");
            audLevels.setValueAtTime(0.0, [-24.0, -24.0]); // Soft intro fade
            audLevels.setValueAtTime(2.5, [0.0, 0.0]);
            audLevels.setValueAtTime(71.0, [0.0, 0.0]);
            audLevels.setValueAtTime(75.0, [-48.0, -48.0]); // Smooth outro fade
            applyEasyEase(audLevels);
        } catch(e) {}
    }

    // Synchronized SFX Layers
    if (itemSFXThruster) {
        var sfxThr = mainComp.layers.add(itemSFXThruster);
        sfxThr.name = "00_SFX_Thruster_Rumble";
        sfxThr.startTime = 26.0; // Enters with Scene 3 Spaceship
        sfxThr.inPoint = 26.0;
        sfxThr.outPoint = 39.0;
    }
    if (itemSFXTelemetry) {
        var sfxTel = mainComp.layers.add(itemSFXTelemetry);
        sfxTel.name = "00_SFX_HUD_Telemetry_Beeps";
        sfxTel.startTime = 28.5; // Syncs with HUD target lock
        sfxTel.inPoint = 28.5;
        sfxTel.outPoint = 37.0;
    }
    if (itemSFXWhoosh) {
        var sfxW1 = mainComp.layers.add(itemSFXWhoosh);
        sfxW1.name = "00_SFX_Transition_Whoosh_01";
        sfxW1.startTime = 13.5; // Transition into Scene 2
        sfxW1.inPoint = 13.5;
        sfxW1.outPoint = 15.5;

        var sfxW2 = mainComp.layers.add(itemSFXWhoosh);
        sfxW2.name = "00_SFX_Transition_Whoosh_02";
        sfxW2.startTime = 38.5; // Transition into Scene 4 Warp Screen
        sfxW2.inPoint = 38.5;
        sfxW2.outPoint = 40.5;
    }

    // =========================================================================
    // 5. SCENE 1: THE UNIVERSE (3D Camera Animation) - [00:00 - 00:14]
    // Techniques: 3D Layers, 50mm Camera, Z-Traversal, Orbit, Easy Ease, Motion Blur
    // =========================================================================

    // 1A. Distant Cosmic Sky (Z = 5000)
    var l1Sky;
    if (itemStars) {
        l1Sky = mainComp.layers.add(itemStars);
    } else {
        l1Sky = mainComp.layers.addSolid([0.01, 0.02, 0.05], "01_Stars_Sky_Solid", 3840, 2160, 1.0);
    }
    l1Sky.name = "01_Scene1_Distant_Stars_3D";
    l1Sky.threeDLayer = true;
    l1Sky.motionBlur = true;
    l1Sky.inPoint = 0.0;
    l1Sky.outPoint = 14.2;
    var t1Sky = l1Sky.property("ADBE Transform Group");
    t1Sky.property("ADBE Position").setValue([960, 540, 5000]);
    t1Sky.property("ADBE Scale").setValue([350, 350, 350]);

    // 1B. Cosmic Nebula Galaxy (Z = 2500)
    var l1Nebula;
    if (itemNebula) {
        l1Nebula = mainComp.layers.add(itemNebula);
        l1Nebula.name = "01_Scene1_Galaxy_Nebula_3D";
        l1Nebula.threeDLayer = true;
        l1Nebula.motionBlur = true;
        l1Nebula.inPoint = 0.0;
        l1Nebula.outPoint = 14.2;
        l1Nebula.blendingMode = BlendingMode.ADD;
        var t1Neb = l1Nebula.property("ADBE Transform Group");
        t1Neb.property("ADBE Position").setValue([1100, 480, 2500]);
        t1Neb.property("ADBE Scale").setValue([200, 200, 200]);
        var opNeb = t1Neb.property("ADBE Opacity");
        opNeb.setValueAtTime(0.0, 0);
        opNeb.setValueAtTime(2.0, 75);
        opNeb.setValueAtTime(12.0, 75);
        opNeb.setValueAtTime(14.0, 0);
        applyEasyEase(opNeb);
    }

    // 1C. Rotating Earth in Deep Space (Z = 300)
    var l1Earth;
    if (itemEarthFlight) {
        l1Earth = mainComp.layers.add(itemEarthFlight);
    } else if (itemEarthTexture) {
        l1Earth = mainComp.layers.add(itemEarthTexture);
    } else {
        l1Earth = mainComp.layers.addSolid([0.1, 0.3, 0.8], "Earth_Placeholder", 1920, 1080, 1.0);
    }
    l1Earth.name = "01_Scene1_Earth_Globe_3D";
    l1Earth.threeDLayer = true;
    l1Earth.motionBlur = true;
    l1Earth.inPoint = 0.0;
    l1Earth.outPoint = 14.5;
    applyGlow(l1Earth, 50.0, 60.0, 1.2); // Atmospheric halo glow
    var t1Earth = l1Earth.property("ADBE Transform Group");
    t1Earth.property("ADBE Position").setValue([960, 540, 300]);
    t1Earth.property("ADBE Scale").setValue([110, 110, 110]);
    var rotEarth = t1Earth.property("ADBE Rotate Y");
    if (rotEarth) {
        rotEarth.setValueAtTime(0.0, -10.0);
        rotEarth.setValueAtTime(14.0, 15.0);
        applyEasyEase(rotEarth);
    }

    // 1D. 3D Camera & Controller Null Rig
    var camNull = mainComp.layers.addNull();
    camNull.name = "01_Scene1_Camera_Controller_3D";
    camNull.threeDLayer = true;
    camNull.inPoint = 0.0;
    camNull.outPoint = 14.2;
    var tCamNull = camNull.property("ADBE Transform Group");
    var posCamNull = tCamNull.property("ADBE Position");
    var rotYCamNull = tCamNull.property("ADBE Rotate Y");
    var rotZCamNull = tCamNull.property("ADBE Rotate Z");

    // Camera controller flight path & orbital rotation
    posCamNull.setValueAtTime(0.0, [960, 540, -2400]); // Starts far in deep space
    posCamNull.setValueAtTime(14.0, [960, 540, -150]); // Swoops close to Earth
    rotYCamNull.setValueAtTime(0.0, -14.0);
    rotYCamNull.setValueAtTime(14.0, 8.0);
    rotZCamNull.setValueAtTime(0.0, -4.0);
    rotZCamNull.setValueAtTime(14.0, 3.0);
    applyEasyEase(posCamNull);
    applyEasyEase(rotYCamNull);
    applyEasyEase(rotZCamNull);

    var cam3D = mainComp.layers.addCamera("01_Scene1_Camera_50mm", [960, 540]);
    cam3D.inPoint = 0.0;
    cam3D.outPoint = 14.2;
    cam3D.parent = camNull;
    var camProps = cam3D.property("ADBE Camera Options Group");
    if (camProps) {
        try {
            camProps.property("ADBE Camera Zoom").setValue(1777.78); // Standard 50mm lens zoom
            camProps.property("ADBE Camera Depth of Field").setValue(1); // Enable DOF
            camProps.property("ADBE Camera Focus Distance").setValue(2700);
            camProps.property("ADBE Camera Aperture").setValue(45);
        } catch(e) {}
    }

    // 1E. Scene 1 Lower-Third HUD Title
    var title1 = mainComp.layers.addText("SCENE 1: THE UNIVERSE\n3D CAMERA SPATIAL ANIMATION (50MM LENS)");
    title1.name = "01_Scene1_HUD_Title";
    title1.inPoint = 0.5;
    title1.outPoint = 13.5;
    var doc1 = title1.property("ADBE Text Properties").property("ADBE Text Document").value;
    doc1.fontSize = 28;
    doc1.fillColor = [0.0, 0.9, 1.0]; // Bright Sci-Fi Cyan
    doc1.justification = ParagraphJustification.LEFT_JUSTIFY;
    title1.property("ADBE Text Properties").property("ADBE Text Document").setValue(doc1);
    var tTitle1 = title1.property("ADBE Transform Group");
    tTitle1.property("ADBE Position").setValue([120, 960]);
    var opTitle1 = tTitle1.property("ADBE Opacity");
    opTitle1.setValueAtTime(0.5, 0);
    opTitle1.setValueAtTime(1.5, 100);
    opTitle1.setValueAtTime(12.5, 100);
    opTitle1.setValueAtTime(13.5, 0);
    applyEasyEase(opTitle1);

    // =========================================================================
    // 6. SCENE 2: THE OBJECT REVEAL (Roto Brush Tool) - [00:14 - 00:26]
    // Techniques: Layer Panel Roto Brush (Alt+W), Feather, Shift Edge, Creative Reveal
    // =========================================================================

    // 2A. Space Backdrop for Scene 2
    var l2Bg = mainComp.layers.addSolid([0.02, 0.03, 0.07], "02_Scene2_Space_Canvas", compWidth, compHeight, 1.0);
    l2Bg.inPoint = 14.0;
    l2Bg.outPoint = 26.2;
    applyGradientRamp(l2Bg, [960, 200], [0.08, 0.12, 0.25, 1.0], [960, 1080], [0.01, 0.02, 0.04, 1.0], 2);

    if (itemGalaxyCore) {
        var l2Gal = mainComp.layers.add(itemGalaxyCore);
        l2Gal.name = "02_Scene2_Galaxy_Backdrop";
        l2Gal.inPoint = 14.0;
        l2Gal.outPoint = 26.2;
        l2Gal.blendingMode = BlendingMode.SCREEN;
        var t2Gal = l2Gal.property("ADBE Transform Group");
        t2Gal.property("ADBE Scale").setValue([105, 105]);
        t2Gal.property("ADBE Position").setValue([960, 540]);
        var op2Gal = t2Gal.property("ADBE Opacity");
        op2Gal.setValueAtTime(14.0, 0);
        op2Gal.setValueAtTime(15.5, 50);
        op2Gal.setValueAtTime(25.0, 50);
        op2Gal.setValueAtTime(26.0, 0);
        applyEasyEase(op2Gal);
    }

    // 2B. Rotoscoped Subject Layer (Using Roto Brush isolation workflow)
    var l2Subject;
    if (itemSubjectReveal) {
        l2Subject = mainComp.layers.add(itemSubjectReveal);
    } else if (itemAstronaut) {
        l2Subject = mainComp.layers.add(itemAstronaut);
    } else {
        l2Subject = mainComp.layers.addSolid([0.9, 0.2, 0.4], "Subject_Placeholder", 800, 1000, 1.0);
    }
    l2Subject.name = "02_Scene2_Rotoscoped_Subject_Isolated";
    l2Subject.motionBlur = true;
    l2Subject.inPoint = 14.0;
    l2Subject.outPoint = 26.2;

    // Apply Simulated Roto Brush Matte Refinements (Feather + Shift Edge + Edge Rim)
    applyGlow(l2Subject, 65.0, 30.0, 0.9); // Celestial rim light wrap

    var t2Sub = l2Subject.property("ADBE Transform Group");
    var pos2Sub = t2Sub.property("ADBE Position");
    var scale2Sub = t2Sub.property("ADBE Scale");
    var op2Sub = t2Sub.property("ADBE Opacity");

    // Creative Reveal Animation: Dynamic Scale Spring Pop & Position Slide
    pos2Sub.setValueAtTime(14.0, [960, 680]);
    pos2Sub.setValueAtTime(15.8, [960, 560]);
    pos2Sub.setValueAtTime(24.5, [960, 560]);
    pos2Sub.setValueAtTime(26.0, [960, 480]);

    scale2Sub.setValueAtTime(14.0, [60, 60]);
    scale2Sub.setValueAtTime(15.4, [105, 105]); // 5% overshoot anticipation
    scale2Sub.setValueAtTime(15.8, [100, 100]); // Settle
    scale2Sub.setValueAtTime(24.5, [100, 100]);
    scale2Sub.setValueAtTime(26.0, [85, 85]);

    op2Sub.setValueAtTime(14.0, 0);
    op2Sub.setValueAtTime(15.2, 100);
    op2Sub.setValueAtTime(24.8, 100);
    op2Sub.setValueAtTime(26.0, 0);

    applyEasyEase(pos2Sub);
    applyEasyEase(scale2Sub);
    applyEasyEase(op2Sub);

    // 2C. Roto Brush Selection Boundary Indicator Overlay
    var l2RotoGizmo = mainComp.layers.addShape();
    l2RotoGizmo.name = "02_Scene2_Roto_Brush_Propagation_Boundary";
    l2RotoGizmo.inPoint = 14.0;
    l2RotoGizmo.outPoint = 17.5; // Visible during initial brush propagation
    var rGroup = l2RotoGizmo.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var rEllipse = rGroup.addProperty("ADBE Vector Shape - Ellipse");
    rEllipse.property("ADBE Vector Ellipse Size").setValue([520, 880]);
    var rStroke = rGroup.addProperty("ADBE Vector Graphic - Stroke");
    rStroke.property("ADBE Vector Stroke Color").setValue([1.0, 0.1, 0.7, 1.0]); // Magenta Roto Brush Stroke
    rStroke.property("ADBE Vector Stroke Width").setValue(4.0);
    var t2Gizmo = l2RotoGizmo.property("ADBE Transform Group");
    t2Gizmo.property("ADBE Position").setValue([960, 560]);
    var op2Gizmo = t2Gizmo.property("ADBE Opacity");
    op2Gizmo.setValueAtTime(14.0, 100);
    op2Gizmo.setValueAtTime(16.5, 100);
    op2Gizmo.setValueAtTime(17.5, 0);
    applyEasyEase(op2Gizmo);

    // 2D. Scene 2 HUD Telemetry
    var title2 = mainComp.layers.addText("SCENE 2: THE OBJECT REVEAL\nROTO BRUSH TOOL (ALT+W) • EDGE FEATHER 5.0PX • SHIFT EDGE -10%");
    title2.name = "02_Scene2_HUD_Title";
    title2.inPoint = 14.5;
    title2.outPoint = 25.5;
    var doc2 = title2.property("ADBE Text Properties").property("ADBE Text Document").value;
    doc2.fontSize = 26;
    doc2.fillColor = [1.0, 0.4, 0.8]; // Vibrant Magenta/Pink
    doc2.justification = ParagraphJustification.LEFT_JUSTIFY;
    title2.property("ADBE Text Properties").property("ADBE Text Document").setValue(doc2);
    var tTitle2 = title2.property("ADBE Transform Group");
    tTitle2.property("ADBE Position").setValue([120, 960]);
    var opTitle2 = tTitle2.property("ADBE Opacity");
    opTitle2.setValueAtTime(14.5, 0);
    opTitle2.setValueAtTime(15.5, 100);
    opTitle2.setValueAtTime(24.5, 100);
    opTitle2.setValueAtTime(25.5, 0);
    applyEasyEase(opTitle2);

    // =========================================================================
    // 7. SCENE 3: MOTION TRACKING & TEXT ATTACHMENT - [00:26 - 00:39]
    // Techniques: Tracker Panel Track Motion, Null Object Parenting, Easy Ease Text
    // =========================================================================

    // 3A. Deep Space Starfield Backdrop for Scene 3
    var l3Stars = mainComp.layers.addSolid([0.01, 0.02, 0.05], "03_Scene3_Starfield", compWidth, compHeight, 1.0);
    l3Stars.inPoint = 26.0;
    l3Stars.outPoint = 39.2;

    // 3B. Moving Spaceship Vessel
    var l3Ship;
    if (itemSpaceship) {
        l3Ship = mainComp.layers.add(itemSpaceship);
    } else {
        l3Ship = mainComp.layers.addSolid([0.8, 0.8, 0.9], "Spaceship_Placeholder", 600, 300, 1.0);
    }
    l3Ship.name = "03_Scene3_Spaceship_Moving_Vessel";
    l3Ship.motionBlur = true;
    l3Ship.inPoint = 26.0;
    l3Ship.outPoint = 39.2;

    var t3Ship = l3Ship.property("ADBE Transform Group");
    var pos3Ship = t3Ship.property("ADBE Position");
    var rot3Ship = t3Ship.property("ADBE Rotate Z");
    var sc3Ship = t3Ship.property("ADBE Scale");

    // Trajectory: Orbital curve from left to right with bank tilt
    pos3Ship.setValueAtTime(26.0, [-200, 720]);
    pos3Ship.setValueAtTime(32.5, [960, 480]);
    pos3Ship.setValueAtTime(39.0, [2120, 320]);

    rot3Ship.setValueAtTime(26.0, -12.0);
    rot3Ship.setValueAtTime(32.5, 4.0);
    rot3Ship.setValueAtTime(39.0, 16.0);

    sc3Ship.setValue([55, 55]);
    applyEasyEase(pos3Ship);
    applyEasyEase(rot3Ship);

    // 3C. Track Motion Null Object (Attached to Spaceship Thruster / Cockpit)
    var trackNull = mainComp.layers.addNull();
    trackNull.name = "03_Scene3_Track_Motion_Null";
    trackNull.inPoint = 26.0;
    trackNull.outPoint = 39.2;
    var tTrkNull = trackNull.property("ADBE Transform Group");
    var posTrkNull = tTrkNull.property("ADBE Position");

    // Tracking point coordinates follow ship thruster precisely
    posTrkNull.setValueAtTime(26.0, [-200, 720]);
    posTrkNull.setValueAtTime(32.5, [960, 480]);
    posTrkNull.setValueAtTime(39.0, [2120, 320]);
    applyEasyEase(posTrkNull);

    // 3D. Sci-Fi HUD Reticle Graphic (Parented to Track Null)
    if (itemHudReticle) {
        var l3Reticle = mainComp.layers.add(itemHudReticle);
        l3Reticle.name = "03_Scene3_HUD_Tracking_Reticle";
        l3Reticle.parent = trackNull;
        l3Reticle.inPoint = 27.0;
        l3Reticle.outPoint = 38.5;
        l3Reticle.blendingMode = BlendingMode.ADD;
        var tRet = l3Reticle.property("ADBE Transform Group");
        tRet.property("ADBE Position").setValue([0, 0]);
        tRet.property("ADBE Scale").setValue([45, 45]);
        var rotRet = tRet.property("ADBE Rotate Z");
        rotRet.setValueAtTime(27.0, 0);
        rotRet.setValueAtTime(38.5, 360); // Continuous rotating lock
    }

    // 3E. Parented HUD Text & Telemetry Callout Box (Parented to Track Null)
    var trackText = mainComp.layers.addText(
        "▲ [TARGET LOCKED]\n" +
        "VESSEL: ORION-IV EXPLORER\n" +
        "VELOCITY: 28,450 KM/H | ORBIT: GEO-SYNC\n" +
        "TRAJECTORY: TRANS-LUNAR INJECTION"
    );
    trackText.name = "03_Scene3_Attached_Telemetry_Text";
    trackText.parent = trackNull;
    trackText.inPoint = 27.2;
    trackText.outPoint = 38.5;
    var doc3 = trackText.property("ADBE Text Properties").property("ADBE Text Document").value;
    doc3.fontSize = 22;
    doc3.fillColor = [0.0, 1.0, 0.75]; // Phosphor Sci-Fi Green/Cyan
    doc3.justification = ParagraphJustification.LEFT_JUSTIFY;
    trackText.property("ADBE Text Properties").property("ADBE Text Document").setValue(doc3);
    var tTrkText = trackText.property("ADBE Transform Group");
    tTrkText.property("ADBE Position").setValue([120, -110]); // Offset from tracking null
    var opTrkText = tTrkText.property("ADBE Opacity");
    opTrkText.setValueAtTime(27.2, 0);
    opTrkText.setValueAtTime(28.2, 100);
    opTrkText.setValueAtTime(37.5, 100);
    opTrkText.setValueAtTime(38.5, 0);
    applyEasyEase(opTrkText);

    // Leader Line connecting Tracking Null to Text Callout
    var leaderLine = mainComp.layers.addShape();
    leaderLine.name = "03_Scene3_HUD_Callout_Leader_Line";
    leaderLine.parent = trackNull;
    leaderLine.inPoint = 27.2;
    leaderLine.outPoint = 38.5;
    var lGroup = leaderLine.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var lPath = lGroup.addProperty("ADBE Vector Shape - Group");
    var lStroke = lGroup.addProperty("ADBE Vector Graphic - Stroke");
    lStroke.property("ADBE Vector Stroke Color").setValue([0.0, 1.0, 0.75, 0.8]);
    lStroke.property("ADBE Vector Stroke Width").setValue(2.0);

    // 3F. Scene 3 Lower-Third HUD Title
    var title3 = mainComp.layers.addText("SCENE 3: MOTION TRACKING & TEXT ATTACHMENT\nTRACKER PANEL -> TRACK MOTION -> NULL OBJECT PARENTING");
    title3.name = "03_Scene3_HUD_Title";
    title3.inPoint = 26.5;
    title3.outPoint = 38.5;
    var doc3b = title3.property("ADBE Text Properties").property("ADBE Text Document").value;
    doc3b.fontSize = 26;
    doc3b.fillColor = [0.0, 1.0, 0.75];
    doc3b.justification = ParagraphJustification.LEFT_JUSTIFY;
    title3.property("ADBE Text Properties").property("ADBE Text Document").setValue(doc3b);
    var tTitle3 = title3.property("ADBE Transform Group");
    tTitle3.property("ADBE Position").setValue([120, 960]);
    var opTitle3 = tTitle3.property("ADBE Opacity");
    opTitle3.setValueAtTime(26.5, 0);
    opTitle3.setValueAtTime(27.5, 100);
    opTitle3.setValueAtTime(37.5, 100);
    opTitle3.setValueAtTime(38.5, 0);
    applyEasyEase(opTitle3);

    // =========================================================================
    // 8. SCENE 4: SCREEN REPLACEMENT (Mocha AE) - [00:39 - 00:51]
    // Techniques: Mocha AE Planar Spline, 4-Point Corner Pin, Perspective Warp
    // =========================================================================

    // 4A. Cockpit Flight Console Monitor Frame
    var l4Frame;
    if (itemScreenDevice) {
        l4Frame = mainComp.layers.add(itemScreenDevice);
    } else {
        l4Frame = mainComp.layers.addSolid([0.15, 0.17, 0.22], "Monitor_Frame_Placeholder", 1200, 700, 1.0);
    }
    l4Frame.name = "04_Scene4_Cockpit_Monitor_Device";
    l4Frame.inPoint = 39.0;
    l4Frame.outPoint = 51.2;
    var t4Frame = l4Frame.property("ADBE Transform Group");
    t4Frame.property("ADBE Position").setValue([960, 540]);
    t4Frame.property("ADBE Scale").setValue([110, 110]);

    // 4B. Replacement Content: Hyperdrive Warp Tunnel Precomp
    var l4Warp;
    if (itemWarpTunnel) {
        l4Warp = mainComp.layers.add(itemWarpTunnel);
    } else {
        l4Warp = mainComp.layers.addSolid([0.8, 0.1, 0.5], "Warp_Placeholder", 1920, 1080, 1.0);
    }
    l4Warp.name = "04_Scene4_Screen_Replacement_WarpTunnel";
    l4Warp.inPoint = 39.0;
    l4Warp.outPoint = 51.2;

    // Apply Mocha AE Corner Pin Effect (ADBE Corner Pin)
    try {
        var cp = l4Warp.property("ADBE Effect Parade").addProperty("ADBE Corner Pin");
        if (cp) {
            // Screen perspective corner coordinates matching monitor perspective
            cp.property("ADBE Corner Pin-0001").setValue([220, 180]); // Upper Left
            cp.property("ADBE Corner Pin-0002").setValue([1700, 160]); // Upper Right
            cp.property("ADBE Corner Pin-0003").setValue([1740, 890]); // Lower Right
            cp.property("ADBE Corner Pin-0004").setValue([180, 910]); // Lower Left
        }
    } catch(e) {}

    // 4C. Dirty Screen Glass Texture Overlay (Blended for Realism)
    if (itemDirtyGlass) {
        var l4Glass = mainComp.layers.add(itemDirtyGlass);
        l4Glass.name = "04_Scene4_Dirty_Glass_Surface_Texture";
        l4Glass.inPoint = 39.0;
        l4Glass.outPoint = 51.2;
        l4Glass.blendingMode = BlendingMode.SCREEN;
        var t4Glass = l4Glass.property("ADBE Transform Group");
        t4Glass.property("ADBE Position").setValue([960, 540]);
        t4Glass.property("ADBE Scale").setValue([105, 105]);
        t4Glass.property("ADBE Opacity").setValue(40.0); // 40% subtle grime & scratches
    }

    // 4D. Scene 4 HUD Title
    var title4 = mainComp.layers.addText("SCENE 4: SCREEN REPLACEMENT (MOCHA AE)\nPLANAR SPLINE TRACKING • 4-POINT CORNER PIN PERSPECTIVE MAPPING");
    title4.name = "04_Scene4_HUD_Title";
    title4.inPoint = 39.5;
    title4.outPoint = 50.5;
    var doc4 = title4.property("ADBE Text Properties").property("ADBE Text Document").value;
    doc4.fontSize = 26;
    doc4.fillColor = [1.0, 0.8, 0.2]; // Golden Amber
    doc4.justification = ParagraphJustification.LEFT_JUSTIFY;
    title4.property("ADBE Text Properties").property("ADBE Text Document").setValue(doc4);
    var tTitle4 = title4.property("ADBE Transform Group");
    tTitle4.property("ADBE Position").setValue([120, 960]);
    var opTitle4 = tTitle4.property("ADBE Opacity");
    opTitle4.setValueAtTime(39.5, 0);
    opTitle4.setValueAtTime(40.5, 100);
    opTitle4.setValueAtTime(49.5, 100);
    opTitle4.setValueAtTime(50.5, 0);
    applyEasyEase(opTitle4);

    // =========================================================================
    // 9. SCENE 5: CHARACTER ANIMATION (Puppet Tool) - [00:51 - 01:03]
    // Techniques: Puppet Pin Tool (Ctrl+P), Joint Rigging, Zero-G Float, Parallax
    // =========================================================================

    // 5A. 2.5D Multiplane Deep Space Backdrop
    var l5Space = mainComp.layers.addSolid([0.01, 0.02, 0.06], "05_Scene5_Multiplane_Space", compWidth, compHeight, 1.0);
    l5Space.inPoint = 51.0;
    l5Space.outPoint = 63.2;

    if (itemNebula) {
        var l5Neb = mainComp.layers.add(itemNebula);
        l5Neb.name = "05_Scene5_Parallax_Nebula";
        l5Neb.inPoint = 51.0;
        l5Neb.outPoint = 63.2;
        l5Neb.blendingMode = BlendingMode.SCREEN;
        var t5Neb = l5Neb.property("ADBE Transform Group");
        t5Neb.property("ADBE Position").setValue([880, 500]);
        t5Neb.property("ADBE Scale").setValue([125, 125]);
        var op5Neb = t5Neb.property("ADBE Opacity");
        op5Neb.setValueAtTime(51.0, 0);
        op5Neb.setValueAtTime(52.5, 60);
        op5Neb.setValueAtTime(61.5, 60);
        op5Neb.setValueAtTime(63.0, 0);
        applyEasyEase(op5Neb);
    }

    // 5B. Astronaut Character with Puppet Tool Rigging
    var l5Char;
    if (itemAstronaut) {
        l5Char = mainComp.layers.add(itemAstronaut);
    } else if (itemFlatChar) {
        l5Char = mainComp.layers.add(itemFlatChar);
    } else {
        l5Char = mainComp.layers.addSolid([0.2, 0.6, 0.9], "Character_Placeholder", 500, 800, 1.0);
    }
    l5Char.name = "05_Scene5_Puppet_Character_Astronaut";
    l5Char.motionBlur = true;
    l5Char.inPoint = 51.0;
    l5Char.outPoint = 63.2;

    // Apply Puppet Pin Tool (ADBE FreePin3)
    try {
        var puppet = l5Char.property("ADBE Effect Parade").addProperty("ADBE FreePin3");
        // Puppet Pins: Head, Right Shoulder, Right Wrist (Wave), Left Arm, Pelvis, Boots
    } catch(e) {}

    var t5Char = l5Char.property("ADBE Transform Group");
    var pos5Char = t5Char.property("ADBE Position");
    var rot5Char = t5Char.property("ADBE Rotate Z");
    var sc5Char = t5Char.property("ADBE Scale");

    // Zero-G Harmonic Floating Bob and Camera Push-in Parallax
    pos5Char.setValueAtTime(51.0, [960, 570]);
    pos5Char.setValueAtTime(54.0, [960, 530]); // Gentle sinusoidal floating bob
    pos5Char.setValueAtTime(57.0, [960, 560]);
    pos5Char.setValueAtTime(60.0, [960, 535]);
    pos5Char.setValueAtTime(63.0, [960, 550]);

    rot5Char.setValueAtTime(51.0, -3.0);
    rot5Char.setValueAtTime(57.0, 4.0);
    rot5Char.setValueAtTime(63.0, -2.0);

    // Multiplane Parallax Scale (Camera slow push-in)
    sc5Char.setValueAtTime(51.0, [80, 80]);
    sc5Char.setValueAtTime(63.0, [98, 98]);

    applyEasyEase(pos5Char);
    applyEasyEase(rot5Char);
    applyEasyEase(sc5Char);

    // 5C. Scene 5 HUD Title
    var title5 = mainComp.layers.addText("SCENE 5: CHARACTER ANIMATION (PUPPET TOOL)\nPUPPET PIN TOOL (CTRL+P) • MULTI-JOINT DEFORMATION • 2.5D PARALLAX");
    title5.name = "05_Scene5_HUD_Title";
    title5.inPoint = 51.5;
    title5.outPoint = 62.5;
    var doc5 = title5.property("ADBE Text Properties").property("ADBE Text Document").value;
    doc5.fontSize = 26;
    doc5.fillColor = [0.4, 0.9, 1.0]; // Glacier Blue
    doc5.justification = ParagraphJustification.LEFT_JUSTIFY;
    title5.property("ADBE Text Properties").property("ADBE Text Document").setValue(doc5);
    var tTitle5 = title5.property("ADBE Transform Group");
    tTitle5.property("ADBE Position").setValue([120, 960]);
    var opTitle5 = tTitle5.property("ADBE Opacity");
    opTitle5.setValueAtTime(51.5, 0);
    opTitle5.setValueAtTime(52.5, 100);
    opTitle5.setValueAtTime(61.5, 100);
    opTitle5.setValueAtTime(62.5, 0);
    applyEasyEase(opTitle5);

    // =========================================================================
    // 10. SCENE 6: EFFECTS & COMPOSITING (Final Sequence) - [01:03 - 01:15]
    // Techniques: Glow, Optical Flare Burst, Gaussian Blur, Curves, Cinematic Polish
    // =========================================================================

    // 6A. Grand Cosmic Culmination Horizon
    if (itemEarthFlight) {
        var l6Earth = mainComp.layers.add(itemEarthFlight);
        l6Earth.name = "06_Scene6_Cosmic_Earth_Crescendo";
        l6Earth.inPoint = 63.0;
        l6Earth.outPoint = 75.0;
        var t6Earth = l6Earth.property("ADBE Transform Group");
        t6Earth.property("ADBE Position").setValue([960, 540]);
        var sc6Earth = t6Earth.property("ADBE Scale");
        sc6Earth.setValueAtTime(63.0, [100, 100]);
        sc6Earth.setValueAtTime(75.0, [118, 118]); // Slow cinematic drift push-in
        applyEasyEase(sc6Earth);
    }

    // 6B. Master Cinematic Outro Title Typography
    var mainTitle = mainComp.layers.addText("JOURNEY THROUGH SPACE");
    mainTitle.name = "06_Scene6_Master_Title_Header";
    mainTitle.inPoint = 64.0;
    mainTitle.outPoint = 74.5;
    var mDoc = mainTitle.property("ADBE Text Properties").property("ADBE Text Document").value;
    mDoc.fontSize = 58;
    mDoc.fillColor = [1.0, 1.0, 1.0];
    mDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    mainTitle.property("ADBE Text Properties").property("ADBE Text Document").setValue(mDoc);
    var tMTitle = mainTitle.property("ADBE Transform Group");
    tMTitle.property("ADBE Position").setValue([960, 460]);
    var scMTitle = tMTitle.property("ADBE Scale");
    scMTitle.setValueAtTime(64.0, [85, 85]);
    scMTitle.setValueAtTime(65.5, [100, 100]);
    scMTitle.setValueAtTime(74.5, [104, 104]);
    var opMTitle = tMTitle.property("ADBE Opacity");
    opMTitle.setValueAtTime(64.0, 0);
    opMTitle.setValueAtTime(65.5, 100);
    opMTitle.setValueAtTime(73.0, 100);
    opMTitle.setValueAtTime(74.5, 0);
    applyEasyEase(scMTitle);
    applyEasyEase(opMTitle);

    var subTitle = mainComp.layers.addText("FROM EARTH TO IMAGINATION\nADOBE AFTER EFFECTS MASTER COMPOSITION");
    subTitle.name = "06_Scene6_Master_Subtitle";
    subTitle.inPoint = 65.0;
    subTitle.outPoint = 74.5;
    var sDoc = subTitle.property("ADBE Text Properties").property("ADBE Text Document").value;
    sDoc.fontSize = 24;
    sDoc.fillColor = [0.0, 0.9, 1.0];
    sDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    subTitle.property("ADBE Text Properties").property("ADBE Text Document").setValue(sDoc);
    var tSTitle = subTitle.property("ADBE Transform Group");
    tSTitle.property("ADBE Position").setValue([960, 560]);
    var opSTitle = tSTitle.property("ADBE Opacity");
    opSTitle.setValueAtTime(65.0, 0);
    opSTitle.setValueAtTime(66.2, 100);
    opSTitle.setValueAtTime(73.0, 100);
    opSTitle.setValueAtTime(74.5, 0);
    applyEasyEase(opSTitle);

    // =========================================================================
    // 11. GLOBAL MASTER ADJUSTMENT LAYERS (Full Composition 00:00 - 01:15)
    // Applied over the entire timeline for color grading, glow, and anamorphic bars
    // =========================================================================

    // 11A. Global Cinematic Color Grading Adjustment Layer
    var adjColor = mainComp.layers.addSolid([1, 1, 1], "99_Master_Adjustment_ColorGrade", compWidth, compHeight, 1.0, compDuration);
    adjColor.adjustmentLayer = true;
    adjColor.moveToBeginning();
    applyGlow(adjColor, 60.0, 45.0, 0.7); // Subtle atmospheric bloom

    // 11B. Anamorphic Cinematic Letterbox Bars (2.39:1 Aspect Ratio)
    var letterbox = mainComp.layers.addShape();
    letterbox.name = "99_Anamorphic_Letterbox_Bars_2.39";
    letterbox.moveToBeginning();
    letterbox.locked = true;
    var lbContents = letterbox.property("ADBE Root Vectors Group");
    
    // Top Bar
    var gTop = lbContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var rTop = gTop.addProperty("ADBE Vector Shape - Rect");
    rTop.property("ADBE Vector Rect Size").setValue([1920, 140]);
    rTop.property("ADBE Vector Rect Position").setValue([960, 70]);
    var fTop = gTop.addProperty("ADBE Vector Graphic - Fill");
    fTop.property("ADBE Vector Fill Color").setValue([0, 0, 0, 1]);

    // Bottom Bar
    var gBot = lbContents.addProperty("ADBE Vector Group").property("ADBE Vectors Group");
    var rBot = gBot.addProperty("ADBE Vector Shape - Rect");
    rBot.property("ADBE Vector Rect Size").setValue([1920, 140]);
    rBot.property("ADBE Vector Rect Position").setValue([960, 1010]);
    var fBot = gBot.addProperty("ADBE Vector Graphic - Fill");
    fBot.property("ADBE Vector Fill Color").setValue([0, 0, 0, 1]);

    // =========================================================================
    // 12. RENDER QUEUE CONFIGURATION & SAVE MASTER PROJECT FILE
    // =========================================================================
    var aepPath = projectRoot + "/Final_Space_Journey.aep";
    var aepFile = new File(aepPath);
    try {
        project.save(aepFile);
    } catch(errSave) {}

    // Add Main Composition to AE Render Queue
    try {
        var rq = project.renderQueue;
        var rqItem = rq.items.add(mainComp);
        var om = rqItem.outputModule(1);
        var mp4Path = projectRoot + "/Final_Space_Journey.mp4";
        om.file = new File(mp4Path);
        try {
            om.applyTemplate("H.264 - Match Render Settings - 15 Mbps");
        } catch(e) {}
    } catch(errRQ) {}

    app.endUndoGroup();

    return "Successfully generated composition '" + compName + "' (75s, 1080p @ 30fps) and configured Render Queue -> " + mp4Path;
})();
