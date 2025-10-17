import { Application, extend } from "@pixi/react";
import {
  Container,
  Graphics,
  Sprite,
  type Application as PixiApplication,
} from "pixi.js";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
} from "react";

import CompositeScene from "./composite";

extend({ Container, Graphics, Sprite });

type Dimensions = {
  width: number;
  height: number;
};

type AspectRatio = {
  width: number;
  height: number;
};

const DEFAULT_VIDEO_DIMENSIONS: Dimensions = {
  width: 1920,
  height: 1080,
};
const toResolution = () =>
  typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
console.log("toResolution", toResolution());
function computeViewportSize(
  container: Dimensions,
  aspectRatio: number,
): Dimensions {
  const { width: availableWidth, height: availableHeight } = container;

  if (!availableWidth || !availableHeight || !Number.isFinite(aspectRatio)) {
    return { width: 0, height: 0 };
  }

  let width = availableWidth;
  let height = availableWidth / aspectRatio;

  if (height > availableHeight) {
    height = availableHeight;
    width = availableHeight * aspectRatio;
  }

  return { width, height };
}

async function requestFullscreen(element: HTMLDivElement) {
  const el = element as HTMLDivElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    mozRequestFullScreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };

  if (el.requestFullscreen) {
    await el.requestFullscreen();
    return;
  }

  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen();
    return;
  }

  if (el.mozRequestFullScreen) {
    await el.mozRequestFullScreen();
    return;
  }

  if (el.msRequestFullscreen) {
    await el.msRequestFullscreen();
  }
}

async function exitFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    mozCancelFullScreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };

  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }

  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
    return;
  }

  if (doc.mozCancelFullScreen) {
    await doc.mozCancelFullScreen();
    return;
  }

  if (doc.msExitFullscreen) {
    await doc.msExitFullscreen();
  }
}

export type PixiVideoPlayerHandle = {
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  isFullscreen: () => boolean;
  getContainer: () => HTMLDivElement | null;
};

type PixiVideoPlayerProps = {
  targetAspectRatio?: AspectRatio;
  onFullscreenChange?: (fullscreen: boolean) => void;
};

export const PixiApp = forwardRef(function PixiVideoPlayer(
  { targetAspectRatio, onFullscreenChange }: PixiVideoPlayerProps,
  ref: ForwardedRef<PixiVideoPlayerHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PixiApplication | null>(null);
  const [containerSize, setContainerSize] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [videoDimensions, setVideoDimensions] = useState<Dimensions>(
    DEFAULT_VIDEO_DIMENSIONS,
  );
  const [resolution, setResolution] = useState(toResolution);
  const isFullscreen = useCallback(() => {
    if (typeof document === "undefined") {
      return false;
    }

    const element = containerRef.current;

    return Boolean(element && document.fullscreenElement === element);
  }, []);

  const updateContainerSize = useCallback(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();

    setContainerSize((previous) => {
      if (previous.width === rect.width && previous.height === rect.height) {
        return previous;
      }

      return { width: rect.width, height: rect.height };
    });
  }, []);

  useEffect(() => {
    updateContainerSize();

    const element = containerRef.current;

    if (!element) {
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      if (typeof window !== "undefined") {
        const handler = () => updateContainerSize();

        window.addEventListener("resize", handler);

        return () => window.removeEventListener("resize", handler);
      }

      return;
    }

    const observer = new ResizeObserver(() => updateContainerSize());

    observer.observe(element);

    return () => observer.disconnect();
  }, [updateContainerSize]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateResolution = () => setResolution(toResolution());

    window.addEventListener("resize", updateResolution);
    window.addEventListener("orientationchange", updateResolution);

    return () => {
      window.removeEventListener("resize", updateResolution);
      window.removeEventListener("orientationchange", updateResolution);
    };
  }, []);

  const aspectRatio = useMemo(() => {
    if (targetAspectRatio?.width && targetAspectRatio.height) {
      return targetAspectRatio.width / targetAspectRatio.height;
    }

    const { width, height } = videoDimensions;

    if (!width || !height) {
      return DEFAULT_VIDEO_DIMENSIONS.width / DEFAULT_VIDEO_DIMENSIONS.height;
    }

    return width / height;
  }, [targetAspectRatio, videoDimensions.height, videoDimensions.width]);

  const viewportSize = useMemo(
    () => computeViewportSize(containerSize, aspectRatio),
    [containerSize, aspectRatio],
  );
  const viewportStyle = useMemo<CSSProperties>(() => {
    if (!viewportSize.width || !viewportSize.height) {
      return { width: "100%", height: "100%" };
    }

    return viewportSize;
  }, [viewportSize]);
  const handleVideoDimensions = useCallback((dimensions: Dimensions) => {
    setVideoDimensions((previous) => {
      if (
        previous.width === dimensions.width &&
        previous.height === dimensions.height
      ) {
        return previous;
      }

      return dimensions;
    });
  }, []);

  useEffect(() => {
    const app = appRef.current;

    if (!app) {
      return;
    }

    const { width, height } = viewportSize;

    if (!width || !height) {
      return;
    }

    if (app.renderer.resolution !== resolution) {
      app.renderer.resolution = resolution;
    }

    app.renderer.resize(width, height);
  }, [resolution, viewportSize]);

  useImperativeHandle(
    ref,
    () => ({
      enterFullscreen: async () => {
        if (typeof document === "undefined") {
          return;
        }

        const element = containerRef.current;

        if (!element || isFullscreen()) {
          return;
        }

        await requestFullscreen(element);
      },
      exitFullscreen: async () => {
        if (typeof document === "undefined") {
          return;
        }

        if (!isFullscreen()) {
          return;
        }

        await exitFullscreen();
      },
      toggleFullscreen: async () => {
        if (isFullscreen()) {
          await exitFullscreen();
        } else {
          const element = containerRef.current;

          if (element) {
            await requestFullscreen(element);
          }
        }
      },
      isFullscreen,
      getContainer: () => containerRef.current,
    }),
    [isFullscreen],
  );
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleFullscreenChange = () => {
      onFullscreenChange?.(isFullscreen());
      updateContainerSize();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen, onFullscreenChange, updateContainerSize]);
  const shouldRenderStage = viewportSize.width > 0 && viewportSize.height > 0;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden"
    >
      <div
        ref={stageWrapperRef}
        className="relative flex items-center justify-center overflow-hidden rounded"
        style={viewportStyle}
      >
        {shouldRenderStage && (
          <Application
            resizeTo={stageWrapperRef.current ?? undefined}
            width={viewportSize.width}
            height={viewportSize.height}
            resolution={resolution}
            autoDensity
            backgroundAlpha={0}
            antialias={true}
            onInit={(app) => {
              appRef.current = app;
              app.renderer.resolution = resolution;
            }}
          >
            <CompositeScene
              onVideoDimensions={handleVideoDimensions}
              viewportSize={viewportSize}
            />
          </Application>
        )}
      </div>
    </div>
  );
});

export default PixiApp;
