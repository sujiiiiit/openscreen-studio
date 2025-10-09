export type Platform = "mac" | "windows" | "linux" | "web";

export interface PlatformInfo {
  isMacintosh: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isWeb: boolean;
  platform: Platform;
}
