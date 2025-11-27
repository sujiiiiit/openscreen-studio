import { usePlayback } from "@/context/playback-context";
import React, { useMemo } from "react";
import { RULER_HEIGHT, TIMELINE_MIN_DURATION, TIMELINE_PADDING, TIMELINE_START_LEFT } from "./constants";

/**
 * Format time based on the scale level
 * - For seconds: "0", "5", "10"
 * - For minutes: "1:00", "2:00"
 * - For hours: "1:00:00", "2:00:00"
 */
const formatTime = (seconds: number, format: "seconds" | "minutes" | "hours"): string => {
  if (format === "seconds") {
    return Math.round(seconds).toString();
  }
  
  if (format === "minutes") {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  
  // Hours format
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Timeline scale configuration
 * - scale: Time range for each major tick (in seconds)
 * - scaleSplitCount: Number of subdivisions between major ticks
 * - format: How to display the time labels
 * - minPixelsPerMajor: Minimum pixels between major ticks for readability
 */
interface ScaleConfig {
  scale: number;
  scaleSplitCount: number;
  format: "seconds" | "minutes" | "hours";
  minPixelsPerMajor: number;
}

/**
 * Scale presets for different time ranges
 * Ordered from finest to coarsest granularity
 */
const SCALE_PRESETS: ScaleConfig[] = [
  // Ultra-fine scales (for very short videos or high zoom)
  { scale: 1, scaleSplitCount: 2, format: "seconds", minPixelsPerMajor: 40 },      // 1s major, 0.5s minor
  { scale: 1, scaleSplitCount: 4, format: "seconds", minPixelsPerMajor: 60 },      // 1s major, 0.25s minor
  { scale: 2, scaleSplitCount: 4, format: "seconds", minPixelsPerMajor: 50 },      // 2s major, 0.5s minor
  { scale: 5, scaleSplitCount: 5, format: "seconds", minPixelsPerMajor: 60 },      // 5s major, 1s minor
  { scale: 10, scaleSplitCount: 5, format: "seconds", minPixelsPerMajor: 70 },     // 10s major, 2s minor
  { scale: 10, scaleSplitCount: 10, format: "seconds", minPixelsPerMajor: 100 },   // 10s major, 1s minor
  
  // Medium scales (for videos up to ~10 minutes)
  { scale: 30, scaleSplitCount: 6, format: "minutes", minPixelsPerMajor: 80 },     // 30s major, 5s minor
  { scale: 60, scaleSplitCount: 6, format: "minutes", minPixelsPerMajor: 80 },     // 1min major, 10s minor
  { scale: 60, scaleSplitCount: 12, format: "minutes", minPixelsPerMajor: 120 },   // 1min major, 5s minor
  { scale: 120, scaleSplitCount: 4, format: "minutes", minPixelsPerMajor: 80 },    // 2min major, 30s minor
  { scale: 300, scaleSplitCount: 5, format: "minutes", minPixelsPerMajor: 80 },    // 5min major, 1min minor
  
  // Coarse scales (for videos up to ~1 hour)
  { scale: 600, scaleSplitCount: 5, format: "minutes", minPixelsPerMajor: 80 },    // 10min major, 2min minor
  { scale: 600, scaleSplitCount: 10, format: "minutes", minPixelsPerMajor: 120 },  // 10min major, 1min minor
  { scale: 1800, scaleSplitCount: 6, format: "minutes", minPixelsPerMajor: 80 },   // 30min major, 5min minor
  { scale: 3600, scaleSplitCount: 6, format: "hours", minPixelsPerMajor: 80 },     // 1hr major, 10min minor
  
  // Very coarse scales (for multi-hour videos)
  { scale: 3600, scaleSplitCount: 12, format: "hours", minPixelsPerMajor: 120 },   // 1hr major, 5min minor
  { scale: 7200, scaleSplitCount: 4, format: "hours", minPixelsPerMajor: 80 },     // 2hr major, 30min minor
  { scale: 14400, scaleSplitCount: 4, format: "hours", minPixelsPerMajor: 80 },    // 4hr major, 1hr minor
  { scale: 36000, scaleSplitCount: 5, format: "hours", minPixelsPerMajor: 80 },    // 10hr major, 2hr minor
];

/**
 * Get optimal scale configuration based on zoom level (pixels per second)
 * The goal is to find a scale where major ticks are readable (not too close, not too far apart)
 */
const getOptimalScaleConfig = (zoom: number): ScaleConfig => {
  // Find the first scale preset where the major tick spacing is readable
  for (const preset of SCALE_PRESETS) {
    const pixelsPerMajor = preset.scale * zoom;
    if (pixelsPerMajor >= preset.minPixelsPerMajor) {
      return preset;
    }
  }
  // Fallback to coarsest scale
  return SCALE_PRESETS[SCALE_PRESETS.length - 1];
};

/** Default left padding for the ruler start */
const DEFAULT_START_LEFT = TIMELINE_START_LEFT;

export interface RulerProps {
  /** Pixels per second - controls the zoom level */
  zoom: number;
  /** Optional max duration from clips (in seconds) */
  maxDuration?: number;
  /** Override: Time range for each major scale mark (in seconds, >0) */
  scale?: number;
  /** Override: Number of subdivision units between major marks (>0 integer) */
  scaleSplitCount?: number;
  /** Override: Display width of a single scale unit (pixels, >0) - alternative to zoom */
  scaleWidth?: number;
  /** Distance from the start of the timeline to the left edge (>=0, pixels) */
  startLeft?: number;
}

export default function Ruler({
  zoom,
  maxDuration,
  scale: scaleOverride,
  scaleSplitCount: splitCountOverride,
  scaleWidth: scaleWidthOverride,
  startLeft = DEFAULT_START_LEFT,
}: RulerProps) {
  const { duration } = usePlayback();

  // Ensure we have at least some duration to show
  const displayDuration = Math.max(duration, maxDuration || 0, TIMELINE_MIN_DURATION);

  // Calculate effective zoom - if scaleWidth is provided, derive zoom from it
  const effectiveZoom = useMemo(() => {
    if (scaleWidthOverride && scaleOverride) {
      // scaleWidth is pixels per scale unit, so zoom = scaleWidth / scale
      return scaleWidthOverride / scaleOverride;
    }
    return zoom;
  }, [zoom, scaleWidthOverride, scaleOverride]);

  // Get optimal scale configuration or use overrides
  const scaleConfig = useMemo(() => {
    const autoConfig = getOptimalScaleConfig(effectiveZoom);
    
    return {
      scale: scaleOverride ?? autoConfig.scale,
      scaleSplitCount: splitCountOverride ?? autoConfig.scaleSplitCount,
      format: autoConfig.format,
    };
  }, [effectiveZoom, scaleOverride, splitCountOverride]);

  const { scale, scaleSplitCount, format } = scaleConfig;

  // Calculate total width
  const width = (displayDuration + TIMELINE_PADDING) * effectiveZoom + startLeft;

  // Calculate minor interval (time between subdivision ticks)
  const minorInterval = scale / scaleSplitCount;

  const ticks = useMemo(() => {
    const items: React.ReactNode[] = [];
    const totalTime = displayDuration + TIMELINE_PADDING;
    
    // Generate all ticks
    for (let t = 0; t <= totalTime; t += minorInterval) {
      // Round to avoid floating point errors
      const roundedT = Math.round(t * 1000) / 1000;
      const isMajor = Math.abs(roundedT % scale) < 0.001;
      const position = startLeft + roundedT * effectiveZoom;

      if (isMajor) {
        // Major tick - taller line with label
        items.push(
          <div
            key={`major-${roundedT}`}
            className="absolute bottom-0 w-px bg-neutral-500/70 pointer-events-none"
            style={{ left: position, height: 10 }}
          />
        );

        // Label for major tick - centered on the tick
        const label = formatTime(roundedT, format);
        items.push(
          <span
            key={`label-${roundedT}`}
            className="absolute top-1.5 text-[11px] font-medium text-neutral-400 select-none pointer-events-none tracking-wide translate-x-[-50%]"
            style={{ left: position }}
          >
            {label}
          </span>
        );
      } else {
        // Minor tick - shorter line
        items.push(
          <div
            key={`minor-${roundedT}`}
            className="absolute bottom-0 w-px bg-neutral-600/40 pointer-events-none"
            style={{ left: position, height: 6 }}
          />
        );
      }
    }

    return items;
  }, [displayDuration, effectiveZoom, scale, minorInterval, startLeft, format]);

  return (
    <div
      className="relative h-full"
      style={{ height: RULER_HEIGHT, width: width, minWidth: "100%" }}
    >
      {ticks}
    </div>
  );
}
