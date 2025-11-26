import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const TIMELINE_ZOOM_MIN = 0.5;
export const TIMELINE_ZOOM_MAX = 4;
export const TIMELINE_ZOOM_DEFAULT = 1;

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
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(
  undefined,
);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineZoom, setTimelineZoomState] = useState(TIMELINE_ZOOM_DEFAULT);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const durationHintRef = useRef<number | null>(null);

  const cancelAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
    }
  }, []);

  const ensureAnimation = useCallback(() => {
    if (rafRef.current === null) {
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

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      const handleDurationChange = () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          setDuration(video.duration);
        }
      };

      const handlePlay = () => {
        setIsPlaying(true);
        ensureAnimation();
      };

      const handlePause = () => {
        setIsPlaying(false);
        cancelAnimation();
        setCurrentTime(video.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        cancelAnimation();
        if (Number.isFinite(video.duration)) {
          setCurrentTime(video.duration);
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("durationchange", handleDurationChange);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleEnded);

      cleanupRef.current = () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("durationchange", handleDurationChange);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);
        if (videoRef.current === video) {
          videoRef.current = null;
        }
      };

      handleDurationChange();
      setCurrentTime(video.currentTime ?? 0);
      if (!video.paused) {
        handlePlay();
      } else {
        handlePause();
      }
    },
    [cancelAnimation, detachVideo, ensureAnimation],
  );

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    try {
      await video.play();
    } catch (error) {
      console.warn("Failed to play video", error);
    }
  }, []);

  const pause = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      setIsPlaying(false);
      return;
    }

    video.pause();
  }, []);

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
      const video = videoRef.current;

      if (video) {
        try {
          video.currentTime = next;
        } catch (error) {
          console.warn("Failed to seek video", error);
        }
      }

      setCurrentTime(next);
    },
    [duration],
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

  useEffect(() => {
    return () => {
      detachVideo();
    };
  }, [detachVideo]);

  useEffect(() => {
    if (duration > 0) {
      setCurrentTime((previous) => Math.min(previous, duration));
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
