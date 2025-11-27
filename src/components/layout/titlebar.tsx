import { isMacintosh } from "@/lib/platform";
import { useWindowState, useWindowControls } from "@/hooks/use-window-state";
import { MacWindowControls, WindowsWindowControls } from "./controls";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudLoadingIcon,
  Delete02Icon,
  Folder02Icon,
  Redo03Icon,
  Undo03Icon,
  PlayIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePresentation } from "@/context/presentation-context";
import { useExport } from "@/context/export-context";

export default function TitleBar() {
  const isMaximized = useWindowState();
  const windowControls = useWindowControls();
  const { togglePresentation } = usePresentation();
  const { setIsSettingsOpen, isExporting } = useExport();

  return (
    <div
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      id="titlebar"
      className="overflow-hidden h-[var(--titlebar-height)] w-full border-b bg-background select-none flex flex-row flex-nowrap justify-between items-center;"
    >
      <div
        className="flex flex-row flex-nowrap items-center gap-2"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div
          className="flex overflow-hidden items-center gap-2 h-full flex-row justify-between"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-6">
                <HugeiconsIcon icon={Folder02Icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start" alignOffset={5}>
              <p>Open Project</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HugeiconsIcon icon={Delete02Icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Project</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex outline-0 border-0 w-px h-[calc(100%_-_1.5rem)] bg-foreground/20 grow-0 shrink-0"></div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HugeiconsIcon icon={Undo03Icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent kbd="Ctrl" kbd1="Z">
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HugeiconsIcon icon={Redo03Icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent kbd="Ctrl" kbd1="Y">
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex outline-0 border-0 w-px h-[calc(100%_-_1.5rem)] bg-foreground/20 grow-0 shrink-0"></div>
        </div>
        <div className="flex-1 min-w-0 flex justify-between items-center px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              >
                <HugeiconsIcon icon={CloudLoadingIcon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Changes are not saved</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {isMacintosh ? (
          <MacWindowControls
            isMaximized={isMaximized}
            onMinimize={windowControls.minimize}
            onMaximize={windowControls.maximize}
            onClose={windowControls.close}
          />
        ) : null}
      </div>

      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <Button
          onClick={togglePresentation}
          variant="ghost"
          size="sm"
          className="h-8 px-3"
        >
          <HugeiconsIcon icon={PlayIcon} className="mr-2 size-4" />
          Present
        </Button>
        <Button
          onClick={() => setIsSettingsOpen(true)}
          variant="ghost"
          size="sm"
          disabled={isExporting}
          className="h-8 px-3 mr-2"
        >
          <HugeiconsIcon icon={Download01Icon} className="mr-2 size-4" />
          Export
        </Button>
        {isMacintosh ? null : (
          <WindowsWindowControls
            isMaximized={isMaximized}
            onMinimize={windowControls.minimize}
            onMaximize={windowControls.maximize}
            onClose={windowControls.close}
          />
        )}
      </div>
    </div>
  );
}
