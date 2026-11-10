---
name: after-effects-sdk-plugin
description: Expert guide for native C/C++ plugin engineering using the Adobe After Effects SDK. Covers Effect plugins vs AEGP (General Plug-ins), command handling (PF_Cmd), parameter management, SmartFX 32-bpc float pixel pipeline, GPU acceleration (CUDA, OpenCL, Metal via GPUUtils), and build configurations (MSVC / Xcode). Use when creating, debugging, or building native After Effects C++ plugins or GPU acceleration shaders.
---

# After Effects C/C++ Plugin SDK Guide

This skill provides an engineering reference for developing native, high-performance After Effects plugins using the Adobe After Effects C/C++ SDK.

---

## 1. Plugin Architectures: Effect vs AEGP

After Effects supports two distinct native C/C++ plugin types:

```
After Effects Plugin Types
 ├── Effect Plug-ins (.aex / .plugin)
 │    ├── Filter / visual effect applied to a layer
 │    ├── Evaluates inputs (parameters, source pixels)
 │    ├── Outputs processed pixels (SmartFX 32-bpc / GPU)
 │    └── Examples: Blur, Color Grade, Distortion, Noise
 └── AEGP (After Effects General Plug-ins)
      ├── Application-level integration (no image rendering pipeline)
      ├── Custom UI panels, menu items, project manipulation
      ├── Interacts with comps, layers, keys, and footage via AEGP suites
      └── Examples: Importers/Exporters, Automation hooks, Project synchronizers
```

---

## 2. Effect Plugin Lifecycle & Command Dispatching

Every effect plugin exports a single C entry point `PluginMain` that receives command codes (`PF_Cmd_*`):

```cpp
#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_Macros.h"
#include "Param_Utils.h"

extern "C" DllExport PF_Err
PluginMain(
    PF_Cmd cmd,
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output,
    void *extra)
{
    PF_Err err = PF_Err_NONE;
    try {
        switch (cmd) {
            case PF_Cmd_ABOUT:
                err = About(in_data, out_data, params, output);
                break;
            case PF_Cmd_GLOBAL_SETUP:
                err = GlobalSetup(in_data, out_data, params, output);
                break;
            case PF_Cmd_PARAMS_SETUP:
                err = ParamsSetup(in_data, out_data, params, output);
                break;
            case PF_Cmd_SMART_PRE_RENDER:
                err = PreRender(in_data, out_data, (PF_PreRenderExtra*)extra);
                break;
            case PF_Cmd_SMART_RENDER:
                err = SmartRender(in_data, out_data, (PF_SmartRenderExtra*)extra);
                break;
            default:
                break;
        }
    } catch (...) {
        err = PF_Err_INTERNAL_STRUCT_DAMAGED;
    }
    return err;
}
```

---

## 3. Global Setup & Capability Flags

In `PF_Cmd_GLOBAL_SETUP`, declare the plugin's capabilities to After Effects:

```cpp
static PF_Err
GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    out_data->my_version = PF_VERSION(1, 0, 0, PF_Stage_DEVELOP, 1);
    
    // Enable modern 16-bit and 32-bit float SmartFX processing
    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE |
                          PF_OutFlag_CUSTOM_UI |
                          PF_OutFlag_I_EXPAND_BUFFER;
                          
    out_data->out_flags2 = PF_OutFlag2_FLOAT_COLOR_AWARE |
                           PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}
```

---

## 4. Parameter Definition (`PF_Cmd_PARAMS_SETUP`)

Define controls that appear in the user's Effect Controls panel using parameter macros:

```cpp
enum {
    PARAM_INPUT = 0,
    PARAM_AMOUNT,
    PARAM_ANGLE,
    PARAM_COLOR,
    PARAM_CHECKBOX,
    PARAM_NUM_PARAMS
};

static PF_Err
ParamsSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;
    PF_ParamDef def;

    // Float Slider (0.0 to 100.0)
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX(
        "Intensity",
        0.0, 100.0,      // Valid Min / Max
        0.0, 100.0,      // Slider Min / Max
        25.0,            // Default Value
        PF_Precision_TENTHS,
        0, 0,
        PARAM_AMOUNT
    );

    // Color Control
    AEFX_CLR_STRUCT(def);
    PF_ADD_COLOR(
        "Tint Color",
        255, 255, 255,   // Red, Green, Blue default (8-bit)
        PARAM_COLOR
    );

    // Angle Control
    AEFX_CLR_STRUCT(def);
    PF_ADD_ANGLE(
        "Direction",
        0.0,             // Default angle in degrees
        PARAM_ANGLE
    );

    out_data->num_params = PARAM_NUM_PARAMS;
    return err;
}
```

---

## 5. SmartFX 32-bpc Float Rendering Pipeline

The SmartFX pipeline decouples checkout/prerender from actual pixel processing, enabling arbitrary pixel formats and GPU rendering.

### Step 1: PreRender (`PF_Cmd_SMART_PRE_RENDER`)
Determine which input rects are required and check out source buffers:

```cpp
static PF_Err
PreRender(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_PreRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->raw_request;
    
    // Set 32-bpc float or preserve native format
    req.channel_mask = PF_Channel_RED | PF_Channel_GREEN | PF_Channel_BLUE | PF_Channel_ALPHA;

    PF_CheckoutResult in_result;
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        PARAM_INPUT,
        PARAM_INPUT,
        &req,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &in_result
    ));

    UnionLRect(&in_result.result_rect, &extra->output->result_rect);
    return err;
}
```

### Step 2: Smart Render (`PF_Cmd_SMART_RENDER`)
Retrieve input/output pixel buffers and execute computation:

```cpp
static PF_Err
SmartRender(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_SmartRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_EffectWorld *input_world = NULL;
    PF_EffectWorld *output_world = NULL;

    ERR(extra->cb->checkout_layer_pixels(in_data->effect_ref, PARAM_INPUT, &input_world));
    ERR(extra->cb->checkout_output(in_data->effect_ref, &output_world));

    if (!err && input_world && output_world) {
        PF_PixelFormat format;
        AEFX_SuiteScoper<PF_WorldSuite2> world_suite(in_data, kPFWorldSuite, kPFWorldSuiteVersion2, out_data);
        ERR(world_suite->PF_GetPixelFormat(input_world, &format));

        if (format == PF_PixelFormat_GPU_FLOAT || format == PF_PixelFormat_ARGB128) {
            // Process 32-bit floating point pixels (PF_PixelFloat: 0.0f to 1.0f+)
            PF_PixelFloat *in_pix = (PF_PixelFloat*)input_world->data;
            PF_PixelFloat *out_pix = (PF_PixelFloat*)output_world->data;
            // Iterate over scanlines
        }
    }
    return err;
}
```

---

## 6. GPU Acceleration Pipeline (CUDA / Metal / OpenCL)

Modern After Effects effects utilize the `AEGP_GPU_Data` and `GPUUtils` suite to dispatch compute kernels directly to the GPU:
- Declare `PF_OutFlag2_SUPPORTS_SMART_RENDER_GPU` in `GlobalSetup`.
- Handle `PF_Cmd_SMART_RENDER_GPU`.
- Metal (`.metal`) for macOS, CUDA (`.cu`) for NVIDIA Windows, and OpenCL (`.cl`) as universal fallback.

---

## 7. Build Configurations & Deployment

### Windows (Visual Studio)
- Open `AfterEffectsSDK/Examples/BuildAll.sln`.
- Target: `Release | x64`.
- Output: `.aex` binary (e.g. `MyPlugin.aex`).
- Deployment folder: `C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\`.

### macOS (Xcode)
- Open `AfterEffectsSDK/Examples/Buildall.xcodeproj`.
- Target: `Universal (arm64 / x86_64)`.
- Output: `.plugin` bundle.
- Deployment folder: `/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/`.
