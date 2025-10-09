import { ipcRenderer } from "electron";

export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  restoreWindow: () => void;
  closeWindow: () => void;
  openDevTools: () => void;
  getWindowState: () => Promise<boolean>;
  onWindowStateChange: (callback: (isMaximized: boolean) => void) => () => void;
  openRecordingWindow: (mode?: string) => void;
}

export function createElectronAPI(): ElectronAPI {
  return {
    minimizeWindow: () => ipcRenderer.send("window-minimize"),
    maximizeWindow: () => ipcRenderer.send("window-maximize"),
    restoreWindow: () => ipcRenderer.send("window-restore"),
    closeWindow: () => ipcRenderer.send("window-close"),
    openDevTools: () => ipcRenderer.send("open-devtools"),
    getWindowState: () => ipcRenderer.invoke("get-window-state"),
    onWindowStateChange: (callback: (isMaximized: boolean) => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        isMaximized: boolean,
      ) => callback(isMaximized);
      ipcRenderer.on("window-state-changed", listener);
      return () => ipcRenderer.removeListener("window-state-changed", listener);
    },
    openRecordingWindow: (mode?: string) =>
      ipcRenderer.send("open-recording-window", mode),
  };
}
