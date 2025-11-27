export type TimelineClipType = "video" | "audio" | "image" | "text" | "effect";

export type ResizeMode = "start" | "end" | null;

export interface TimelineClip {
  id: string;
  start: number; // Start time in seconds
  duration: number; // Duration in seconds
  name: string;
  color?: string;
  type: TimelineClipType;
  waveform?: number[]; // Normalized 0-1 samples for visual preview
  speed?: number;
  muted?: boolean;
  metadata?: string;
  originalDuration?: number; // For trimming calculations
  trimStart?: number; // Trim offset from start
  trimEnd?: number; // Trim offset from end
}

export interface TimelineLayer {
  id: string;
  name: string;
  clips: TimelineClip[];
  isVisible: boolean;
  isLocked: boolean;
  accentColor?: string;
  kind?: "video" | "audio" | "overlay" | "effect";
}

export interface TimelineState {
  layers: TimelineLayer[];
  zoom: number; // Pixels per second
  scrollLeft: number;
}
