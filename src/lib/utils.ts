import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filePathToFileUrl(filePath: string): string {
  if (!filePath) {
    throw new Error("filePathToFileUrl requires a non-empty path");
  }

  const normalized = filePath.replace(/\\/g, "/");

  if (normalized.startsWith("file://")) {
    return normalized;
  }

  const needsLeadingSlash =
    !normalized.startsWith("/") && !normalized.startsWith("//");
  const prefixed = needsLeadingSlash ? `/${normalized}` : normalized;

  return encodeURI(`file://${prefixed}`);
}
