import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class AppPaths {
  public readonly APP_ROOT: string;
  public readonly VITE_DEV_SERVER_URL: string | undefined;
  public readonly MAIN_DIST: string;
  public readonly RENDERER_DIST: string;
  public readonly VITE_PUBLIC: string;

  constructor() {
    this.APP_ROOT = path.join(__dirname, "..");
    this.VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
    this.MAIN_DIST = path.join(this.APP_ROOT, "dist-electron");
    this.RENDERER_DIST = path.join(this.APP_ROOT, "dist");

    this.VITE_PUBLIC = this.VITE_DEV_SERVER_URL
      ? path.join(this.APP_ROOT, "public")
      : this.RENDERER_DIST;

    // Set environment variables
    process.env.APP_ROOT = this.APP_ROOT;
    process.env.VITE_PUBLIC = this.VITE_PUBLIC;
  }

  getIconPath(): string {
    return path.join(this.VITE_PUBLIC, "electron-vite.svg");
  }

  getPreloadPath(): string {
    return path.join(__dirname, "preload.mjs");
  }
}
