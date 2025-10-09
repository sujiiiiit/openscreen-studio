// Import and re-export ElectronAPI interface from electron module
import type { ElectronAPI as ElectronAPIType } from "@electron/api/electron-api";
import type { RecordingRendererAPI } from "@electron/api/recording-api";
import type { ExportRendererAPI } from "@electron/api/export-api";

export type ElectronAPI = ElectronAPIType;

export interface CustomIPCRendererAPI {
  on: (
    ...args: Parameters<Electron.IpcRenderer["on"]>
  ) => ReturnType<Electron.IpcRenderer["on"]>;
  off: (
    ...args: Parameters<Electron.IpcRenderer["off"]>
  ) => ReturnType<Electron.IpcRenderer["off"]>;
  send: (
    ...args: Parameters<Electron.IpcRenderer["send"]>
  ) => ReturnType<Electron.IpcRenderer["send"]>;
  invoke: (
    ...args: Parameters<Electron.IpcRenderer["invoke"]>
  ) => ReturnType<Electron.IpcRenderer["invoke"]>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    customIpcRenderer?: CustomIPCRendererAPI;
    recordingAPI?: RecordingRendererAPI;
    exportAPI?: ExportRendererAPI;
  }
}
