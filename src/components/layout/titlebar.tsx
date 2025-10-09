import { isMacintosh } from "@/lib/platform";
import { useWindowState, useWindowControls } from "@/hooks/use-window-state";
import { MacWindowControls, WindowsWindowControls } from "./controls";
export default function TitleBar() {
  const isMaximized = useWindowState();
  const windowControls = useWindowControls();

  return (
    <div
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      id="titlebar"
      className="overflow-hidden h-[var(--titlebar-height)] w-full border-b bg-background select-none flex flex-row flex-nowrap justify-between items-center;"
    >
      <div>
        {isMacintosh ? (
          <MacWindowControls
            isMaximized={isMaximized}
            onMinimize={windowControls.minimize}
            onMaximize={windowControls.maximize}
            onClose={windowControls.close}
          />
        ) : null}
      </div>

      <div>
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
