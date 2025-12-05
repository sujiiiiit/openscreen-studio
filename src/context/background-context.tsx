import { createContext, useContext, useState, type ReactNode } from "react";

// Gradient types
export type GradientType = "linear" | "radial" | "conic";

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientSettings {
  type: GradientType;
  angle: number; // 0-360 degrees for linear/conic
  stops: GradientStop[];
}

interface BackgroundState {
  enabled: boolean;
  wallpaperUrl: string;
  blurStrength: number;
  padding: number;
  videoBorderRadius: number;
  videoShadow: number;
  videoBorder: number;
  videoBorderColor: string;
  grainStrength: number;
  backgroundColor: string;
  backgroundMode: "wallpaper" | "color" | "gradient" | "image";
  gradientSettings: GradientSettings;
}

interface BackgroundContextValue extends BackgroundState {
  setEnabled: (enabled: boolean) => void;
  setWallpaperUrl: (url: string) => void;
  setBlurStrength: (strength: number) => void;
  setPadding: (padding: number) => void;
  setVideoBorderRadius: (radius: number) => void;
  setVideoShadow: (shadow: number) => void;
  setVideoBorder: (border: number) => void;
  setVideoBorderColor: (color: string) => void;
  setGrainStrength: (strength: number) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundMode: (
    mode: "wallpaper" | "color" | "gradient" | "image",
  ) => void;
  setGradientSettings: (settings: GradientSettings) => void;
}
export const BACKGROUND_BLUR_VALUE = 0;
export const BACKGROUND_PADDING_VALUE = 8;
export const VIDEO_BORDER_RADIUS_VALUE = 1.5;
export const VIDEO_SHADOW_VALUE = 30;
export const VIDEO_BORDER_VALUE = 0;
export const VIDEO_BORDER_COLOR_VALUE = "#ffffff";
export const BACKGROUND_GRAIN_VALUE = 0;

// Default gradient settings
export const DEFAULT_GRADIENT_SETTINGS: GradientSettings = {
  type: "linear",
  angle: 135,
  stops: [
    { color: "#667eea", position: 0 },
    { color: "#764ba2", position: 100 },
  ],
};

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [wallpaperUrl, setWallpaperUrl] = useState(
    "/assets/backgrounds/ipad-17-dark.jpg",
  );
  // Blur: 5-60 range, default 15 (subtle but noticeable)
  const [blurStrength, setBlurStrength] = useState(BACKGROUND_BLUR_VALUE);
  // Padding: 5-30% range, default 8% (balanced spacing)
  const [padding, setPadding] = useState(BACKGROUND_PADDING_VALUE);
  // Border radius: 0-100 range, default 0 (no rounding)
  const [videoBorderRadius, setVideoBorderRadius] = useState(
    VIDEO_BORDER_RADIUS_VALUE,
  );
  // Shadow: 0-100 range, default 30 (Mac-style shadow)
  const [videoShadow, setVideoShadow] = useState(VIDEO_SHADOW_VALUE);
  // Border: 0-20 range, default 0 (no border)
  const [videoBorder, setVideoBorder] = useState(VIDEO_BORDER_VALUE);
  // Border color: default white
  const [videoBorderColor, setVideoBorderColor] = useState(VIDEO_BORDER_COLOR_VALUE);
  // Grain: 0-100 range, default 0 (no grain)
  const [grainStrength, setGrainStrength] = useState(BACKGROUND_GRAIN_VALUE);
  // Background color for solid color mode
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  // Background mode: wallpaper, color, gradient, or image
  const [backgroundMode, setBackgroundMode] = useState<
    "wallpaper" | "color" | "gradient" | "image"
  >("wallpaper");
  // Gradient settings
  const [gradientSettings, setGradientSettings] = useState<GradientSettings>(
    DEFAULT_GRADIENT_SETTINGS,
  );

  const value: BackgroundContextValue = {
    enabled,
    wallpaperUrl,
    blurStrength,
    padding,
    videoBorderRadius,
    videoShadow,
    videoBorder,
    videoBorderColor,
    grainStrength,
    backgroundColor,
    backgroundMode,
    gradientSettings,
    setEnabled,
    setWallpaperUrl,
    setBlurStrength,
    setPadding,
    setVideoBorderRadius,
    setVideoShadow,
    setVideoBorder,
    setVideoBorderColor,
    setGrainStrength,
    setBackgroundColor,
    setBackgroundMode,
    setGradientSettings,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within BackgroundProvider");
  }
  return context;
}
