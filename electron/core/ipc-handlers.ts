import { ipcMain } from "electron";
import { WindowManager } from "./window-manager";

export class IPCHandlers {
  private windowManager: WindowManager;

  constructor() {
    this.windowManager = WindowManager.getInstance();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Window control handlers
    ipcMain.on("window-minimize", this.handleMinimize.bind(this));
    ipcMain.on("window-maximize", this.handleMaximize.bind(this));
    ipcMain.on("window-restore", this.handleRestore.bind(this));
    ipcMain.on("window-close", this.handleClose.bind(this));

    // Window state handler
    ipcMain.handle("get-window-state", this.handleGetWindowState.bind(this));

    // DevTools handler
    ipcMain.on("open-devtools", this.handleOpenDevTools.bind(this));
  }

  private handleMinimize(): void {
    const window = this.windowManager.getMainWindow();
    window?.minimize();
  }

  private handleMaximize(): void {
    const window = this.windowManager.getMainWindow();
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  }

  private handleRestore(): void {
    const window = this.windowManager.getMainWindow();
    window?.unmaximize();
  }

  private handleClose(): void {
    const window = this.windowManager.getMainWindow();
    window?.close();
  }

  private handleGetWindowState(): boolean {
    const window = this.windowManager.getMainWindow();
    return window?.isMaximized() || false;
  }

  private handleOpenDevTools(): void {
    const window = this.windowManager.getMainWindow();
    window?.webContents.openDevTools();
  }
}
