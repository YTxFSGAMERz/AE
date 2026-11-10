---
name: cep-ae-extension
description: Comprehensive guide for developing, debugging, and packaging Adobe Common Extensibility Platform (CEP) and UXP extension panels for After Effects. Covers HTML5/Node.js frontend architecture, CSInterface.js bridge, ExtendScript IPC, remote debugging, ZXPSignCMD packaging, and UXP migration. Use when building or debugging HTML/JS extension panels, UI tools, or migrating CEP to UXP in After Effects.
---

# Adobe CEP & UXP Extension Architecture for After Effects

This skill details how to architect, develop, debug, and package modern HTML5/Node.js extension panels and UXP plugins for Adobe After Effects.

---

## 1. The CEP Architectural Triad

A CEP extension operates across three decoupled execution environments:

```
┌────────────────────────────────────────────────────────┐
│  Panel Frontend (Chromium / CEF)                       │
│  • HTML5, CSS3, modern JavaScript (React / Vue / Svelte)│
│  • Full access to DOM, Web APIs, LocalStorage          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ CSInterface.js (evalScript / events)
                           ▼
┌────────────────────────────────────────────────────────┐
│  Host Engine (ExtendScript / AE DOM)                   │
│  • Executes inside After Effects process               │
│  • Access to app.project, comps, layers, render queue  │
│  • Returns JSON strings back to panel                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ Window.require / process
                           ▼
┌────────────────────────────────────────────────────────┐
│  Node.js Runtime                                       │
│  • Direct access to file system (fs), network (fetch)   │
│  • Child processes (child_process.spawn / exec)        │
│  • NPM modules bundled in extension directory          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Extension Directory Layout

```text
my-ae-extension/
├── .debug                  # Remote debugging port declarations
├── CSXS/
│   └── manifest.xml        # CEP Extension declaration & host compatibility
├── client/
│   ├── index.html          # Panel user interface
│   ├── js/
│   │   ├── CSInterface.js  # Adobe communication library
│   │   └── main.js         # Frontend controller
│   └── css/
│       └── style.css       # Panel styling (dark/light theme aware)
└── host/
    └── index.jsx           # ExtendScript backend routines
```

---

## 3. Extension Manifest Configuration (`CSXS/manifest.xml`)

The manifest identifies the extension to After Effects:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="7.0" ExtensionBundleId="com.motiongraphics.tools" ExtensionBundleVersion="1.0.0"
    ExtensionBundleName="Motion Tools Pro" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <ExtensionList>
        <Extension Id="com.motiongraphics.tools.panel" Version="1.0.0" />
    </ExtensionList>
    <ExecutionEnvironment>
        <HostList>
            <!-- AEFT = Adobe After Effects (2020 through 2026) -->
            <Host Name="AEFT" Version="[17.0, 99.9]" />
        </HostList>
        <LocaleList>
            <Locale Code="All" />
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="11.0" />
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
        <Extension Id="com.motiongraphics.tools.panel">
            <DispatchInfo>
                <Resources>
                    <MainPath>./client/index.html</MainPath>
                    <ScriptPath>./host/index.jsx</ScriptPath>
                    <!-- Enable Node.js environment in panel -->
                    <CEFCommandLine>
                        <Parameter>--enable-nodejs</Parameter>
                        <Parameter>--mixed-context</Parameter>
                    </CEFCommandLine>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>Motion Tools Pro</Menu>
                    <Geometry>
                        <Size>
                            <Height>450</Height>
                            <Width>320</Width>
                        </Size>
                        <MinSize>
                            <Height>200</Height>
                            <Width>200</Width>
                        </MinSize>
                    </Geometry>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
```

---

## 4. The `CSInterface.js` Bridge

### Calling ExtendScript from JavaScript
Frontend panels invoke ExtendScript via `evalScript`. Pass arguments as serialized JSON strings and receive parsed results:

```javascript
// client/js/main.js
var csInterface = new CSInterface();

function createTitleInAE(titleText, fontSize) {
    // Serialize parameters safely
    var payload = JSON.stringify({ title: titleText, size: fontSize });
    var scriptCall = "$.global.createTitleLayer(" + JSON.stringify(payload) + ")";

    csInterface.evalScript(scriptCall, function(response) {
        var result = JSON.parse(response);
        if (result.success) {
            console.log("Layer created successfully: " + result.layerName);
        } else {
            console.error("AE Error: " + result.error);
        }
    });
}
```

### Implementing Backend Handler in ExtendScript
```javascript
// host/index.jsx
$.global.createTitleLayer = function(jsonPayload) {
    try {
        var data = JSON.parse(jsonPayload);
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            return JSON.stringify({ success: false, error: "No active composition" });
        }

        var textLayer = comp.layers.addText(data.title);
        var prop = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = prop.value;
        doc.fontSize = data.size || 60;
        prop.setValue(doc);

        return JSON.stringify({ success: true, layerName: textLayer.name });
    } catch (e) {
        return JSON.stringify({ success: false, error: e.toString() });
    }
};
```

---

## 5. Debugging Handbook & Player Debug Mode

By default, unsigned CEP extensions will not load. You must enable **PlayerDebugMode**.

### Windows Registry Setup
Run in Administrator PowerShell:
```powershell
# For CEP 11 (AE 2021+)
Set-ItemProperty -Path "HKCU:\Software\Adobe\CSXS.11" -Name "PlayerDebugMode" -Value "1" -Type String
# For CEP 12 (AE 2024+)
Set-ItemProperty -Path "HKCU:\Software\Adobe\CSXS.12" -Name "PlayerDebugMode" -Value "1" -Type String
```

### Configuring `.debug` File
Place a `.debug` file in the root of the extension:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
    <Extension Id="com.motiongraphics.tools.panel">
        <HostList>
            <Host Name="AEFT" Port="8088" />
        </HostList>
    </ExtensionList>
</ExtensionList>
```
Open Google Chrome and navigate to: `http://localhost:8088` to inspect DOM, set breakpoints, and view console logs.

---

## 6. Packaging & Signing with `ZXPSignCMD`

To distribute the extension to clients without requiring debug mode:

1. **Generate a Self-Signed Certificate**:
   ```bash
   ZXPSignCMD -selfSignedCert US CA "MyStudio" "MyCertPassword" cert.p12
   ```
2. **Package into `.zxp`**:
   ```bash
   ZXPSignCMD -sign my-ae-extension build/MotionTools.zxp cert.p12 "MyCertPassword" -tsa http://timestamp.digicert.com
   ```

---

## 7. UXP Migration Roadmap

Adobe is transitioning from CEP to **UXP (Unified Extensibility Platform)**:
- **No CEF Overhead**: UXP renders native UI widgets rather than spinning up full Chromium processes, cutting memory footprint by up to 80%.
- **Manifest v5**: Uses standard `manifest.json` instead of XML.
- **Direct Async DOM**: ExtendScript is replaced with modern ES6+ asynchronous JavaScript (`require("aftereffects")`).
