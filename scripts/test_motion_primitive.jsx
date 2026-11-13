// test_motion_primitive.jsx
// Antigravity Verification Script for Motion Primitives
#include "motion_primitives.jsxinc"

(function() {
    var project = app.project;
    if (!project) {
        project = app.newProject();
    }
    
    var comp = project.items.addComp("Antigravity AI Test Comp", 1920, 1080, 1.0, 6.0, 30.0);
    
    // Create Auto-Responsive Lower Third
    var lt = MotionPrimitives.createResponsiveLowerThird(comp, {
        name: "Antigravity AI",
        title: "Autonomous Motion Designer",
        startTime: 0.5,
        duration: 5.0,
        x: 180,
        y: 880
    });
    
    // Create Kinetic Text Header
    var kt = MotionPrimitives.createKineticText(comp, {
        text: "CONNECTED & POWERED UP",
        style: "typewriter",
        startTime: 0.2,
        fontSize: 68
    });

    return "Success: Created comp '" + comp.name + "' with layers: " + lt.nameLayer + ", " + lt.bgLayer + ", " + kt;
})();
