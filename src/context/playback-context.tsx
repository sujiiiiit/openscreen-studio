import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { TimelineClip } from "@/components/timeline/types";

export const TIMELINE_ZOOM_MIN = 5; // Minimum: 5 pixels per second (fit very long videos)
export const TIMELINE_ZOOM_MAX = 200; // Maximum: 200 pixels per second (see individual seconds)
export const TIMELINE_ZOOM_DEFAULT = 50; // Default: 50 pixels per second

interface PlaybackContextValue {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  step: (deltaSeconds: number) => void;
  registerVideoElement: (video: HTMLVideoElement | null) => void;
  timelineZoom: number;
  setTimelineZoom: (zoom: number) => void;
  setDurationHint: (duration: number | null) => void;
  videoElement: HTMLVideoElement | null;
  scissorMode: boolean;
  setScissorMode: (mode: boolean) => void;
  toggleScissorMode: () => void;
  clips: TimelineClip[];
  setClips: Dispatch<SetStateAction<TimelineClip[]>>;
  subscribeToTimeUpdate: (callback: (time: number) => void) => () => void;
  subscribeToPreviewTimeUpdate: (callback: (time: number | null) => void) => () => void;
  setPreviewTime: (time: number | null) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(
  undefined,
);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineZoom, setTimelineZoomState] = useState(TIMELINE_ZOOM_DEFAULT);
  const [scissorMode, setScissorModeState] = useState(false);
  const [clips, setClips] = useState<TimelineClip[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const durationHintRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const clipsRef = useRef<TimelineClip[]>([]);
  const currentTimeRef = useRef<number>(0);
  const previewTimeRef = useRef<number | null>(null);
  const sourceDurationRef = useRef<number>(0);
  const timeListenersRef = useRef<Set<(time: number) => void>>(new Set());
  const previewTimeListenersRef = useRef<Set<(time: number | null) => void>>(new Set());

  // Sync refs
  useEffect(() => {
    clipsRef.current = clips;
    
    // Update duration based on clips if present
    if (clips.length > 0) {
      const maxEnd = clips.reduce((max, clip) => Math.max(max, clip.start + clip.duration), 0);
      setDuration(maxEnd);
    } else if (sourceDurationRef.current > 0) {
      // Fallback to source duration if no clips
      setDuration(sourceDurationRef.current);
    }
  }, [clips]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const subscribeToTimeUpdate = useCallback((callback: (time: number) => void) => {
    timeListenersRef.current.add(callback);
    return () => {
      timeListenersRef.current.delete(callback);
    };
  }, []);

  const subscribeToPreviewTimeUpdate = useCallback((callback: (time: number | null) => void) => {
    previewTimeListenersRef.current.add(callback);
    return () => {
      previewTimeListenersRef.current.delete(callback);
    };
  }, []);

  const setPreviewTime = useCallback((time: number | null) => {
    previewTimeRef.current = time;
    previewTimeListenersRef.current.forEach(listener => listener(time));
    
    // If not playing, update video immediately for preview
    // If playing, tick loop will handle it (or we might want to force it here too?)
    // Actually, if we are paused, tick loop is not running.
    if (!isPlaying && videoRef.current) {
       const targetTime = time ?? currentTimeRef.current;
       const video = videoRef.current;
       const currentClips = clipsRef.current;
       
       if (currentClips.length > 0) {
          const activeClip = currentClips.find(c => targetTime >= c.start && targetTime < c.start + c.duration);
          if (activeClip) {
             const offset = targetTime - activeClip.start;
             const videoTime = activeClip.trimStart + offset;
             video.currentTime = videoTime;
          }
       } else {
          video.currentTime = targetTime;
       }
    }
  }, [isPlaying]);

  const cancelAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = performance.now();
    const delta = (now - lastTickTimeRef.current) / 1000;
    lastTickTimeRef.current = now;

    // Update timeline time
    let nextTime = currentTimeRef.current + delta;
    
    // Check bounds
    if (nextTime >= duration) {
      nextTime = duration;
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current!);
      rafRef.current = null;
      // Ensure final state update
      setCurrentTime(nextTime);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }

    // Update ref immediately for loop
    currentTimeRef.current = nextTime;

    // Notify listeners (smooth animation)
    timeListenersRef.current.forEach(listener => listener(nextTime));

    // Throttle React state updates to avoid lag (e.g. every 100ms or so? or just don't update?)
    // Actually, if we don't update state, components relying on usePlayback().currentTime will be stale.
    // But if we update state every frame, we get lag.
    // Strategy: Only update state if not playing (handled by seek/pause) OR
    // we can update it less frequently.
    // For now, let's NOT update state during playback loop, relying on listeners for smooth UI.
    // But we must update it when stopping.
    
    // Sync video element
    const video = videoRef.current;
    const currentClips = clipsRef.current;
    
    // Determine which time to show on video
    // If previewTime is set (hovering), use that. Otherwise use playback time.
    const displayTime = previewTimeRef.current ?? nextTime;

    if (video && currentClips.length > 0) {
      // Find active clip
      const activeClip = currentClips.find(c => displayTime >= c.start && displayTime < c.start + c.duration);
      
      if (activeClip) {
         const offset = displayTime - activeClip.start;
         const videoTime = activeClip.trimStart + offset;
         
         // Only seek if difference is significant to avoid jitter
         // But for smooth playback we might need to be careful.
         // If video is playing, we might just let it play if the rate is 1.
         // But if we jumped clips, we MUST seek.
         
         // Check if we are "on track"
         const currentVideoTime = video.currentTime;
         if (Math.abs(currentVideoTime - videoTime) > 0.1 || previewTimeRef.current !== null) {
           video.currentTime = videoTime;
         }
         
         if (video.paused && previewTimeRef.current === null) {
            video.play().catch(() => {});
         }
      } else {
        // No clip at this time (gap?) - should not happen with gapless timeline
        // But if it does, pause video?
        if (!video.paused) {
          video.pause();
        }
      }
    } else if (video) {
       // Fallback for no clips (linear)
       // If we have no clips, maybe we shouldn't play? Or play linearly?
       // Let's assume linear if no clips defined yet
       if (Math.abs(video.currentTime - displayTime) > 0.5 || previewTimeRef.current !== null) {
         video.currentTime = displayTime;
       }
    }
  }, [duration, cancelAnimation]);

  const ensureAnimation = useCallback(() => {
    if (rafRef.current === null) {
      lastTickTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => () => cancelAnimation(), [cancelAnimation]);

  const handleDurationHint = useCallback((value: number | null) => {
    durationHintRef.current = value;
    if (!videoRef.current) {
      setDuration(value ?? 0);
    }
  }, []);

  const detachVideo = useCallback(() => {
    cancelAnimation();
    cleanupRef.current?.();
    cleanupRef.current = null;
    videoRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    sourceDurationRef.current = 0;
    if (durationHintRef.current !== null) {
      setDuration(durationHintRef.current);
    } else {
      setDuration(0);
    }
  }, [cancelAnimation]);

  const registerVideoElement = useCallback(
    (video: HTMLVideoElement | null) => {
      if (videoRef.current === video) {
        return;
      }

      detachVideo();

      if (!video) {
        return;
      }

      videoRef.current = video;

      // Force pause initially if we are not playing
      // PixiJS video textures often autoplay by default, so we need to enforce our state
      if (!isPlaying) {
        video.pause();
        video.currentTime = currentTimeRef.current;
      }

      // We no longer drive time from video.timeupdate
      // But we might want to listen to durationchange
      const handleDurationChange = () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          sourceDurationRef.current = video.duration;
          // Only update duration if we don't have clips yet
          if (clipsRef.current.length === 0) {
            setDuration(video.duration);
          }
        }
      };

      // We handle play/pause state ourselves mostly, but if video pauses externally (e.g. buffering), we should know?
      // Actually, we are driving the video now.
      
      video.addEventListener("durationchange", handleDurationChange);

      cleanupRef.current = () => {
        video.removeEventListener("durationchange", handleDurationChange);
        if (videoRef.current === video) {
          videoRef.current = null;
        }
      };

      handleDurationChange();
      // Don't reset currentTime here, keep timeline time
    },
    [detachVideo],
  );

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(true);
    ensureAnimation();
    
    // We don't call video.play() directly here, tick will handle it based on clips
    // But for initial start we might need to?
    // Actually tick calls video.play() if active clip found.
  }, [ensureAnimation]);

  const pause = useCallback(async () => {
    setIsPlaying(false);
    cancelAnimation();
    
    // Sync state on pause
    setCurrentTime(currentTimeRef.current);
    
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  }, [cancelAnimation]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback(
    (time: number) => {
      const next = Math.max(
        0,
        Number.isFinite(duration) && duration > 0
          ? Math.min(time, duration)
          : time,
      );
      
      setCurrentTime(next);
      currentTimeRef.current = next;
      
      // Notify listeners immediately
      timeListenersRef.current.forEach(listener => listener(next));
      
      // Sync video immediately
      const video = videoRef.current;
      const currentClips = clipsRef.current; // Use ref for latest clips

      if (video && currentClips.length > 0) {
        const activeClip = currentClips.find(c => next >= c.start && next < c.start + c.duration);
        if (activeClip) {
           const offset = next - activeClip.start;
           const videoTime = activeClip.trimStart + offset;
           video.currentTime = videoTime;
        }
      } else if (video) {
         video.currentTime = next;
      }
    },
    [duration], // Removed clips from dependency to avoid recreation, using ref
  );

  const step = useCallback(
    (deltaSeconds: number) => {
      seek(currentTime + deltaSeconds);
    },
    [currentTime, seek],
  );

  const setTimelineZoom = useCallback((value: number) => {
    const clamped = Math.min(
      TIMELINE_ZOOM_MAX,
      Math.max(TIMELINE_ZOOM_MIN, value),
    );
    setTimelineZoomState(clamped);
  }, []);

  const setScissorMode = useCallback((mode: boolean) => {
    setScissorModeState(mode);
  }, []);

  const toggleScissorMode = useCallback(() => {
    setScissorModeState((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      detachVideo();
    };
  }, [detachVideo]);

  useEffect(() => {
    if (duration > 0) {
      // Don't clamp current time automatically, let user decide
      // setCurrentTime((previous) => Math.min(previous, duration));
    }
  }, [duration]);

  const value = useMemo<PlaybackContextValue>(
    () => ({
      currentTime,
      duration,
      isPlaying,
      play,
      pause,
      togglePlay,
      seek,
      step,
      registerVideoElement,
      timelineZoom,
      setTimelineZoom,
      setDurationHint: handleDurationHint,
      videoElement: videoRef.current,
      scissorMode,
      setScissorMode,
      toggleScissorMode,
      clips,
      setClips,
      subscribeToTimeUpdate,
      subscribeToPreviewTimeUpdate,
      setPreviewTime,
    }),
    [
      currentTime,
      duration,
      isPlaying,
      play,
      pause,
      togglePlay,
      seek,
      step,
      registerVideoElement,
      timelineZoom,
      setTimelineZoom,
      handleDurationHint,
      videoRef.current,
      scissorMode,
      setScissorMode,
      toggleScissorMode,
      clips,
      setClips,
      subscribeToTimeUpdate,
      subscribeToPreviewTimeUpdate,
      setPreviewTime,
    ],
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("usePlayback must be used within a PlaybackProvider");
  }

  return context;
}
