import { useState, useEffect } from "react";
import type { WindowControlActions } from "@/types";

export function useWindowState() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Get initial window state
    window.electronAPI
      ?.getWindowState()
      .then(setIsMaximized)
      .catch(() => {});

    // Listen for window state changes
    const unsubscribe =
      window.electronAPI?.onWindowStateChange?.(setIsMaximized);

    return unsubscribe;
  }, []);

  return isMaximized;
}

export function useWindowControls(): WindowControlActions {
  const minimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const maximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const close = () => {
    window.electronAPI?.closeWindow();
  };

  return {
    minimize,
    maximize,
    close,
  };
}
