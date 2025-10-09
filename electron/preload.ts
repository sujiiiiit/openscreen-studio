import { contextBridge } from "electron";
import { createIPCRendererAPI, createElectronAPI } from "./api";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", createIPCRendererAPI());

// Expose window control APIs for custom title bar
contextBridge.exposeInMainWorld("electronAPI", createElectronAPI());
