import { BrowserWindow, Menu } from "electron";
import path from "node:path";

interface WindowConfig {
  viteDevServerUrl?: string;
  rendererDist: string;
  preloadPath: string;
  iconPath: string;
}

export class WindowManager {
  private static instance: WindowManager;
  private mainWindow: BrowserWindow | null = null;
  private recordingWindow: BrowserWindow | null = null;
  private windows: Map<number, BrowserWindow> = new Map();
  private config: WindowConfig | null = null;

  private constructor() {}

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  setConfig(config: WindowConfig): void {
    this.config = config;
  }

  createMainWindow(options: WindowConfig, route?: string): BrowserWindow {
    this.config = options;

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.focus();
      if (route) {
        this.loadContent(
          this.mainWindow,
          options.viteDevServerUrl,
          options.rendererDist,
          route,
        );
      }
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 680,
      frame: false,
      resizable: true,
      maximizable: true,
      minimizable: true,
      backgroundColor: "#111111",
      icon: options.iconPath,
      webPreferences: {
        preload: options.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    // Set CSP headers for proper PixiJS worker support
    this.mainWindow.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: file:; font-src 'self'; connect-src 'self' ws: wss: https://huggingface.co; media-src 'self' blob: data: file:;",
            ],
          },
        });
      },
    );

    this.setupWindowEvents(this.mainWindow);
    this.loadContent(
      this.mainWindow,
      options.viteDevServerUrl,
      options.rendererDist,
      route,
    );

    this.windows.set(this.mainWindow.id, this.mainWindow);

    this.mainWindow.on("closed", () => {
      if (this.mainWindow) {
        this.windows.delete(this.mainWindow.id);
        this.mainWindow = null;
      }
    });

    return this.mainWindow;
  }

  openMainWindow(route?: string): BrowserWindow | null {
    if (!this.config) {
      return null;
    }

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (route) {
        this.loadContent(
          this.mainWindow,
          this.config.viteDevServerUrl,
          this.config.rendererDist,
          route,
        );
      }

      this.mainWindow.focus();
      return this.mainWindow;
    }

    return this.createMainWindow(this.config, route);
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getRecordingWindow(): BrowserWindow | null {
    return this.recordingWindow;
  }

  getWindow(id: number): BrowserWindow | undefined {
    return this.windows.get(id);
  }

  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  getFocusedWindow(): BrowserWindow | null {
    return BrowserWindow.getFocusedWindow();
  }

  private setupWindowEvents(window: BrowserWindow): void {
    // Test active push message to Renderer-process
    window.webContents.on("did-finish-load", () => {
      window.webContents.send(
        "main-process-message",
        new Date().toLocaleString(),
      );
    });

    // Listen for window state changes
    window.on("maximize", () => {
      window.webContents.send("window-state-changed", true);
    });

    window.on("unmaximize", () => {
      window.webContents.send("window-state-changed", false);
    });

    // Enable native context menu for DevTools access
    this.enableNativeContextMenu(window);
  }

  private enableNativeContextMenu(window: BrowserWindow): void {
    // Enable the native context menu by handling the context-menu event
    window.webContents.on("context-menu", (_event, params) => {
      const template = [
        {
          label: "Inspect Element",
          click: () => {
            window.webContents.inspectElement(params.x, params.y);
          },
        },
        { type: "separator" as const },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            window.webContents.reload();
          },
        },
        {
          label: "Force Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            window.webContents.reloadIgnoringCache();
          },
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "F12",
          click: () => {
            window.webContents.toggleDevTools();
          },
        },
      ];

      const menu = Menu.buildFromTemplate(template);
      menu.popup();
    });
  }

  private loadContent(
    window: BrowserWindow,
    viteDevServerUrl?: string,
    rendererDist?: string,
    route?: string,
  ): void {
    const urlRoute = route || "";

    if (viteDevServerUrl) {
      window.loadURL(`${viteDevServerUrl}${urlRoute}`);
    } else if (rendererDist) {
      const hash = urlRoute.startsWith("#") ? urlRoute.slice(1) : undefined;
      window.loadFile(path.join(rendererDist, "index.html"), {
        hash,
      });
    }
  }
}
