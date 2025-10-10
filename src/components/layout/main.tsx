import { HugeiconsIcon } from "@hugeicons/react";
import {
  AspectRatioIcon,
  RectangularIcon,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PixiVideoPlayer, {
  type PixiVideoPlayerHandle,
} from "@/components/layout/pixi/canvas";

import { useMemo, useRef, useState, useEffect } from "react";
import { usePresentation } from "@/context/presentation-context";
import { Button } from "../ui/button";

const ASPECT_OPTIONS = [
  { id: "16-9", label: "Wide", ratioLabel: "16:9", width: 16, height: 9 },
  { id: "9-16", label: "Vertical", ratioLabel: "9:16", width: 9, height: 16 },
  { id: "4-3", label: "Standard", ratioLabel: "4:3", width: 4, height: 3 },
  { id: "1-1", label: "Square", ratioLabel: "1:1", width: 1, height: 1 },
];

export default function Main() {
  const [aspectId, setAspectId] = useState<string>(
    ASPECT_OPTIONS[0]?.id ?? "16-9",
  );
  const pixiRef = useRef<PixiVideoPlayerHandle>(null);
  const { setIsPresenting, registerPresentationHandler, togglePresentation } =
    usePresentation();

  const activeAspect = useMemo(() => {
    return (
      ASPECT_OPTIONS.find((option) => option.id === aspectId) ??
      ASPECT_OPTIONS[0]
    );
  }, [aspectId]);

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
          <div className="flex gap-2">
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
          </div>
        </div>
      </section>
    </main>
  );
}
