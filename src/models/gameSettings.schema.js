import mongoose from "mongoose";

const gameSettingsSchema = new mongoose.Schema(
  {
    // Mouse Settings
    dpi: {
      type: Number,
      min: [100, "DPI must be at least 100"],
      max: [20000, "DPI must be at most 20000"],
      default: null,
    },
    pollingRate: {
      type: Number,
      min: [100, "Polling rate must be at least 100"],
      max: [8000, "Polling rate must be at most 8000"],
      default: null,
    },
    sensitivity: {
      type: Number,
      min: [0.1, "Sensitivity must be at least 0.01"],
      max: [8, "Sensitivity must be at most 8"],
      default: null,
    },
    zoomSensitivity: {
      type: Number,
      min: [0.1, "Zoom sensitivity must be at least 0.1"],
      max: [3, "Zoom sensitivity must be at most 3"],
      default: null,
    },
    windowsSensitivity: {
      type: Number,
      min: [1, "Windows sensitivity must be at least 1"],
      max: [11, "Windows sensitivity must be at most 11"],
      default: null,
    },

    // Crosshair
    crosshairCode: {
      type: String,
      default: null,
    },
    crosshairStyle: {
      type: String,
      enum: {
        values: ["Classic", "Classic Static", "Legacy"],
      },
      default: "Classic",
    },
    friendlyFireWarning: {
      type: String,
      enum: ["Always On", "Always Off"],
      default: "Always On",
    },
    followRecoil: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    centerDot: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
    },
    length: {
      type: Number,
      min: [0, "Length must be at least 0"],
      max: [10, "Length must be at most 10"],
      default: null,
    },
    thickness: {
      type: Number,
      min: [0.1, "Thickness must be at least 0.1"],
      max: [6, "Thickness must be at most 6"],
      default: null,
    },
    gap: {
      type: Number,
      min: [-5, "Gap must be at least -5"],
      max: [5, "Gap must be at most 5"],
      default: null,
    },
    outline: {
      type: Number,
      min: [0, "Outline must be at least 0"],
      max: [3, "Outline must be at most 3"],
      default: null,
    },
    red: {
      type: Number,
      min: [0, "Red must be at least 0"],
      max: [255, "Red must be at most 255"],
      default: null,
    },
    green: {
      type: Number,
      min: [0, "Green must be at least 0"],
      max: [255, "Green must be at most 255"],
      default: null,
    },
    blue: {
      type: Number,
      min: [0, "Blue must be at least 0"],
      max: [255, "Blue must be at most 255"],
      default: null,
    },
    alpha: {
      type: Number,
      min: [0, "Alpha must be at least 0"],
      max: [255, "Alpha must be at most 255"],
      default: null,
    },
    tStyle: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },

    // Viewmodel
    fov: {
      type: Number,
      min: [54, "FOV must be at least 54"],
      max: [68, "FOV must be at most 68"],
      default: null,
    },
    offsetX: {
      type: Number,
      min: [-2.5, "Offset X must be at least -2.5"],
      max: [2.5, "Offset X must be at most 2.5"],
      default: null,
    },
    offsetY: {
      type: Number,
      min: [-2, "Offset Y must be at least -2"],
      max: [2, "Offset Y must be at most 2"],
      default: null,
    },
    offsetZ: {
      type: Number,
      min: [-2, "Offset Z must be at least -2"],
      max: [2, "Offset Z must be at most 2"],
      default: null,
    },
    handPosition: {
      type: String,
      enum: ["Left", "Right"],
      default: "Right",
    },

    // Display Settings
    displayMode: {
      type: String,
      enum: ["Windowed", "Fullscreen", "Fullscreen Windowed"],
      default: "Fullscreen Windowed",
    },
    aspectRatio: {
      type: String,
      enum: ["Normal 3:4", "Widescreen 16:9", "Widescreen 16:10"],
      default: "Widescreen 16:9",
    },
    resolution: {
      type: String,
      default: null,
    },
    refreshRate: {
      type: Number,
      min: [60, "Refresh rate must be at least 60Hz"],
      max: [540, "Refresh rate must be at most 540Hz"],
      default: null,
    },
    luminosity: {
      type: Number,
      min: [33, "Luminosity must be at least 33%"],
      max: [133, "Luminosity must be at most 133%"],
      default: null,
    },

    // Video Settings
    vsync: {
      type: String,
      enum: ["Enabled", "Disabled"],
      default: "Disabled",
    },
    nvidiaReflex: {
      type: String,
      enum: ["Enabled", "Disabled", "Enabled + Boost"],
      default: "Disabled",
    },
    boostPlayerContrast: {
      type: String,
      enum: ["Enabled", "Disabled"],
      default: "Disabled",
    },
    antiAliasing: {
      type: String,
      enum: ["None", "CMAA2", "2x MSAA", "4x MSAA", "8x MSAA"],
      default: "None",
    },
    dynamicShadows: {
      type: String,
      enum: ["Sun Only", "All"],
      default: "Sun Only",
    },
    textureDetails: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    textureFiltering: {
      type: String,
      enum: [
        "Bilinear",
        "Trilinear",
        "Anisotropic 2x",
        "Anisotropic 4x",
        "Anisotropic 8x",
        "Anisotropic 16x",
      ],
      default: "Bilinear",
    },
    shaderDetail: {
      type: String,
      enum: ["Low", "High"],
      default: "Low",
    },
    particleDetail: {
      type: String,
      enum: ["Low", "Medium", "High", "Very High"],
      default: "Low",
    },
    ambiantOcclusion: {
      type: String,
      enum: ["Disabled", "Medium", "High"],
      default: "Disabled",
    },
    hdr: {
      type: String,
      enum: ["Performance", "Quality"],
      default: "Performance",
    },
    fidelityFX: {
      type: String,
      enum: ["Performance", "Balanced", "Quality", "Ultra Quality", "Disabled"],
      default: "Disabled",
    },

    // HUD
    hudScale: {
      type: Number,
      min: [0.5, "HUD scale must be at least 0.5"],
      max: [0.95, "HUD scale must be at most 0.95"],
      default: null,
    },
    hudColor: {
      type: String,
      enum: [
        "Team",
        "Teammate",
        "White",
        "Bright White",
        "Light Blue",
        "Blue",
        "Purple",
        "Red",
        "Orange",
        "Yellow",
        "Green",
        "Aqua",
        "Pink",
      ],
      default: "White",
    },

    // Radar
    playerCentered: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
    },
    radarRotating: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
    },
    radarOpacity: {
      type: Number,
      min: [0, "Radar opacity must be at least 0"],
      max: [1, "Radar opacity must be at most 1"],
      default: null,
    },
    hudSize: {
      type: Number,
      min: [0.8, "HUD size must be at least 0.8"],
      max: [1.3, "HUD size must be at most 1.3"],
      default: null,
    },
    mapZoom: {
      type: Number,
      min: [0.25, "Map zoom must be at least 0.25"],
      max: [1, "Map zoom must be at most 1"],
      default: null,
    },
    mapAlternateZoom: {
      type: Number,
      min: [0.25, "Map alternate zoom must be at least 0.25"],
      max: [1, "Map alternate zoom must be at most 1"],
      default: null,
    },
    dynamicZoom: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
    },
  },
  {
    _id: false,
    timestamps: false,
  }
);

export default gameSettingsSchema;
