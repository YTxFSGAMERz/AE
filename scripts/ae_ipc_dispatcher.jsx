// ae_ipc_dispatcher.jsx
// Antigravity After Effects IPC Host Dispatcher
// Executes inside Adobe After Effects via AfterFX.exe -r

#include "motion_primitives.jsxinc"

(function() {
    // -------------------------------------------------------------------------
    // 1. ECMAScript 3 Minimal JSON Serializer & Parser
    // -------------------------------------------------------------------------
    var JSON3 = {
        stringify: function(val) {
            if (val === null || val === undefined) return "null";
            var type = typeof val;
            if (type === "number") return isFinite(val) ? String(val) : "null";
            if (type === "boolean") return String(val);
            if (type === "string") {
                return '"' + val.replace(/\\/g, '\\\\')
                                .replace(/"/g, '\\"')
                                .replace(/\n/g, '\\n')
                                .replace(/\r/g, '\\r')
                                .replace(/\t/g, '\\t') + '"';
            }
            if (val instanceof Array) {
                var items = [];
                for (var i = 0; i < val.length; i++) {
                    items.push(JSON3.stringify(val[i]));
                }
                return "[" + items.join(",") + "]";
            }
            if (type === "object") {
                var props = [];
                for (var k in val) {
                    if (val.hasOwnProperty(k)) {
                        props.push(JSON3.stringify(k) + ":" + JSON3.stringify(val[k]));
                    }
                }
                return "{" + props.join(",") + "}";
            }
            return '"' + String(val) + '"';
        },
        parse: function(str) {
            return eval("(" + str + ")");
        }
    };

    // -------------------------------------------------------------------------
    // 2. Mailbox Discovery
    // -------------------------------------------------------------------------
    var scriptFolder = new File($.fileName).parent;
    var ipcDir = new Folder(scriptFolder.fsName + "/.ipc");
    if (!ipcDir.exists) {
        ipcDir.create();
    }

    var pointerFile = new File(ipcDir.fsName + "/current_request.txt");
    if (!pointerFile.exists) {
        return; // No active request to process
    }

    pointerFile.open("r");
    var reqFileName = pointerFile.read();
    pointerFile.close();
    reqFileName = reqFileName.replace(/^\s+|\s+$/g, '');

    var reqFile = new File(ipcDir.fsName + "/" + reqFileName);
    if (!reqFile.exists) {
        return;
    }

    reqFile.open("r");
    var reqContent = reqFile.read();
    reqFile.close();

    var request = null;
    try {
        request = JSON3.parse(reqContent);
    } catch(err) {
        writeResponse(ipcDir, "unknown", "error", null, "Failed to parse request JSON: " + err.toString());
        return;
    }

    var reqId = request.id || "req_default";
    var startTime = new Date().getTime();

    // -------------------------------------------------------------------------
    // 3. Command Execution
    // -------------------------------------------------------------------------
    try {
        var resultData = null;
        var action = request.action || "eval";

        if (action === "status") {
            resultData = {
                version: app.version,
                appName: app.appName,
                isProjectOpen: (app.project !== null),
                projectFile: (app.project && app.project.file) ? app.project.file.fsName : null,
                activeComp: (app.project && app.project.activeItem instanceof CompItem) ? app.project.activeItem.name : null
            };
        } else if (action === "project_info") {
            resultData = collectProjectInfo();
        } else if (action === "snapshot") {
            resultData = captureSnapshot(request.time, request.output_path);
        } else if (action === "run_file") {
            app.beginUndoGroup(request.undo_name || "Antigravity AI");
            var scriptFile = new File(request.file);
            if (!scriptFile.exists) {
                throw new Error("Script file not found: " + request.file);
            }
            resultData = $.evalFile(scriptFile);
            app.endUndoGroup();
        } else if (action === "eval") {
            app.beginUndoGroup(request.undo_name || "Antigravity AI");
            resultData = eval(request.code);
            app.endUndoGroup();
        } else {
            throw new Error("Unsupported action: " + action);
        }

        var executionTime = new Date().getTime() - startTime;
        writeResponse(ipcDir, reqId, "success", resultData, null, executionTime);

    } catch (exc) {
        try { app.endUndoGroup(); } catch(e) {}
        var executionTime = new Date().getTime() - startTime;
        var errInfo = {
            message: exc.message || exc.toString(),
            line: exc.line || null,
            fileName: exc.fileName || null
        };
        writeResponse(ipcDir, reqId, "error", null, errInfo, executionTime);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function collectProjectInfo() {
        if (!app.project) {
            return { hasProject: false };
        }

        var info = {
            hasProject: true,
            projectFile: app.project.file ? app.project.file.fsName : "Untitled Project",
            numItems: app.project.numItems,
            activeComp: null
        };

        var comp = app.project.activeItem;
        if (comp instanceof CompItem) {
            info.activeComp = {
                id: comp.id,
                name: comp.name,
                width: comp.width,
                height: comp.height,
                pixelAspect: comp.pixelAspect,
                duration: comp.duration,
                frameRate: comp.frameRate,
                currentTime: comp.time,
                numLayers: comp.numLayers,
                layers: []
            };

            for (var l = 1; l <= comp.numLayers; l++) {
                var layer = comp.layer(l);
                info.activeComp.layers.push({
                    index: layer.index,
                    name: layer.name,
                    enabled: layer.enabled,
                    locked: layer.locked,
                    inPoint: layer.inPoint,
                    outPoint: layer.outPoint,
                    nullLayer: layer.nullLayer,
                    shy: layer.shy
                });
            }
        }
        return info;
    }

    function captureSnapshot(snapTime, outputPath) {
        if (!app.project) throw new Error("No active project");
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            throw new Error("No active composition open for snapshot");
        }
        var t = (snapTime !== undefined && snapTime !== null) ? parseFloat(snapTime) : comp.time;
        var outFile = new File(outputPath);
        comp.saveFrameToPng(t, outFile);
        return {
            snapshotFile: outFile.fsName,
            time: t,
            compName: comp.name
        };
    }

    function writeResponse(ipcDir, id, status, result, error, execMs) {
        var respObj = {
            id: id,
            status: status,
            result: result,
            error: error,
            execution_time_ms: execMs || 0
        };
        var respFile = new File(ipcDir.fsName + "/response_" + id + ".json");
        respFile.open("w");
        respFile.write(JSON3.stringify(respObj));
        respFile.close();
    }
})();
