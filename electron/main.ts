import { app, BrowserWindow } from "electron";
import { WindowManager, IPCHandlers, AppPaths } from "./core";

// Initialize app paths and configuration
const appPaths = new AppPaths();

// Initialize window manager
const windowManager = WindowManager.getInstance();

// Initialize IPC handlers
new IPCHandlers();

function createWindow() {
  windowManager.createMainWindow({
    viteDevServerUrl: appPaths.VITE_DEV_SERVER_URL,
    rendererDist: appPaths.RENDERER_DIST,
    preloadPath: appPaths.getPreloadPath(),
    iconPath: appPaths.getIconPath(),
  });
}

// App event handlers
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
});
