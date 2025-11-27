import { HugeiconsIcon } from "@hugeicons/react";
import {
  AspectRatioIcon,
  RectangularIcon,
  SquareIcon,
  PlayIcon,
  PauseIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Scissor01Icon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZoomSlider } from "@/components/timeline/toolbar";

import PixiVideoPlayer, {
  type PixiVideoPlayerHandle,
} from "@/components/layout/pixi/canvas";
import ExportDialog from "@/components/layout/export-dialog";
import ExportSettingsDialog, {
  type ExportSettings,
} from "@/components/layout/export-settings-dialog";

import { useMemo, useRef, useState, useEffect } from "react";
import { usePresentation } from "@/context/presentation-context";
import { usePlayback, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX } from "@/context/playback-context";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const ASPECT_OPTIONS = [
  { id: "16-9", label: "Wide", ratioLabel: "16:9", width: 16, height: 9 },
  { id: "9-16", label: "Vertical", ratioLabel: "9:16", width: 9, height: 16 },
  { id: "4-5", label: "Portrait", ratioLabel: "4:5", width: 4, height: 5 },
  { id: "4-3", label: "Standard", ratioLabel: "4:3", width: 4, height: 3 },
  { id: "1-1", label: "Square", ratioLabel: "1:1", width: 1, height: 1 },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

export default function Main() {
  const [aspectId, setAspectId] = useState<string>(
    ASPECT_OPTIONS[0]?.id ?? "16-9",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTimeRemaining, setExportTimeRemaining] = useState<number | null>(
    null,
  );
  const pixiRef = useRef<PixiVideoPlayerHandle>(null);
  const { setIsPresenting, registerPresentationHandler, togglePresentation } =
    usePresentation();
  const { isPlaying, togglePlay, currentTime, duration, step, timelineZoom, setTimelineZoom, scissorMode, toggleScissorMode } = usePlayback();

  const handleZoomChange = (value: number) => {
    setTimelineZoom(Math.min(TIMELINE_ZOOM_MAX, Math.max(TIMELINE_ZOOM_MIN, value)));
  };



  const activeAspect = useMemo(() => {
    return (
      ASPECT_OPTIONS.find((option) => option.id === aspectId) ??
      ASPECT_OPTIONS[0]
    );
  }, [aspectId]);

  const handleStartExport = async (settings: ExportSettings) => {
    const handle = pixiRef.current;
    if (!handle) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportTimeRemaining(null);

    try {
      await handle.exportVideo(settings, (progress, remaining) => {
        setExportProgress(progress);
        setExportTimeRemaining(remaining);
      });
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const handleToggle = async () => {
      const handle = pixiRef.current;
      if (!handle) {
        return;
      }
      try {
        await handle.toggleFullscreen();
      } catch (error) {
        console.error("Failed to toggle fullscreen", error);
      }
    };

    registerPresentationHandler(handleToggle);
  }, [registerPresentationHandler]);

  return (
    <main className="flex flex-1 flex-col min-h-0 min-w-0">
      <section
        id="canvas"
        className="flex flex-1 min-h-0 min-w-0 items-center justify-center bg-background p-4"
      >
        <div className="h-full w-full min-h-0 min-w-0">
          <PixiVideoPlayer
            ref={pixiRef}
            targetAspectRatio={{
              width: activeAspect.width,
              height: activeAspect.height,
            }}
            onFullscreenChange={setIsPresenting}
          />
        </div>
      </section>
      <section id="controls" className="p-3">
        <div className="h-[var(--titlebar-height)] bg-transparent rounded-md flex flex-row items-center justify-between px-3 gap-2">
          <div className="flex gap-2 items-center">
                       <Select
              value={aspectId}
              onValueChange={(value) => {
                setAspectId(value);
              }}
            >
              <SelectTrigger className="flex flex-nowrap" variant="secondary">
                <HugeiconsIcon
                  className="text-icon size-5"
                  icon={AspectRatioIcon}
                />
                <SelectValue placeholder="Aspect ratio" />
              </SelectTrigger>
              <SelectContent position="popper">
                {ASPECT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    icon={
                      option.id === "1-1" ? (
                        <HugeiconsIcon
                          icon={SquareIcon}
                          className="text-icon fill-icon/20"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={RectangularIcon}
                          className={
                            option.id === "9-16"
                              ? "rotate-90 text-icon fill-icon/20"
                              : "text-icon fill-icon/20"
                          }
                        />
                      )
                    }
                  >
                    <span className="flex flex-row gap-2 items-center select-none">
                      <span>{option.label}</span>
                      <span className="text-muted-foreground ">
                        {option.ratioLabel}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={togglePresentation} variant={"secondary"}>
              Present
            </Button>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="secondary"
              disabled={isExporting}
            >
              Export Video
            </Button>
          </div>
           <div className="flex items-center gap-2">
            <div className="text-xs select-none tabular-nums">
              {formatTime(currentTime)}
            </div>
              <Button variant="ghost" size="icon" onClick={() => step(-5)}>
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePlay}>
                <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => step(5)}>
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>
              <Button 
                variant={scissorMode ? "default" : "ghost"} 
                size="icon" 
                onClick={toggleScissorMode}
                className={cn(scissorMode && "bg-primary text-primary-foreground")}
                title="Split Tool (click on clip to split)"
              >
                <HugeiconsIcon icon={Scissor01Icon} />
              </Button>
              
                <div className="text-xs select-none tabular-nums">
                {formatTime(duration)}
                </div>
            </div>
            <ZoomSlider
              zoom={timelineZoom}
              minZoom={TIMELINE_ZOOM_MIN}
              maxZoom={TIMELINE_ZOOM_MAX}
              onZoomChange={handleZoomChange}
            />
        </div>
      </section>
      <ExportSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onExport={handleStartExport}
      />
      <ExportDialog
        open={isExporting}
        progress={exportProgress}
        estimatedSecondsRemaining={exportTimeRemaining}
      />
    </main>
  );
}
