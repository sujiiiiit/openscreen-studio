import { createContext, useContext, useState, type ReactNode } from "react";

interface BackgroundState {
  enabled: boolean;
  wallpaperUrl: string;
  blurStrength: number;
  padding: number;
  videoBorderRadius: number;
  videoShadow: number;
  backgroundColor: string;
  backgroundMode: "wallpaper" | "color" | "gradient" | "image";
}

interface BackgroundContextValue extends BackgroundState {
  setEnabled: (enabled: boolean) => void;
  setWallpaperUrl: (url: string) => void;
  setBlurStrength: (strength: number) => void;
  setPadding: (padding: number) => void;
  setVideoBorderRadius: (radius: number) => void;
  setVideoShadow: (shadow: number) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundMode: (
    mode: "wallpaper" | "color" | "gradient" | "image",
  ) => void;
}
export const BACKGROUND_BLUR_VALUE = 0;
export const BACKGROUND_PADDING_VALUE = 8;
export const VIDEO_BORDER_RADIUS_VALUE = 1.5;
export const VIDEO_SHADOW_VALUE = 30;

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
  // Background color for solid color mode
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  // Background mode: wallpaper, color, gradient, or image
  const [backgroundMode, setBackgroundMode] = useState<
    "wallpaper" | "color" | "gradient" | "image"
  >("wallpaper");

  const value: BackgroundContextValue = {
    enabled,
    wallpaperUrl,
    blurStrength,
    padding,
    videoBorderRadius,
    videoShadow,
    backgroundColor,
    backgroundMode,
    setEnabled,
    setWallpaperUrl,
    setBlurStrength,
    setPadding,
    setVideoBorderRadius,
    setVideoShadow,
    setBackgroundColor,
    setBackgroundMode,
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
