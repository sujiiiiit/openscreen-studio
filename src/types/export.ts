export type ExportResolutionOption = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export type ExportFormat = "mp4";

export interface ExportSettings {
  resolution: ExportResolutionOption;
  fps: number;
  durationSeconds: number;
  outputPath: string | null;
  includeAudio: boolean;
  format: ExportFormat;
  preset: "veryfast" | "faster" | "fast" | "medium" | "slow" | "slower";
  quality: number; // CRF value
}

export type ExportState =
  | { status: "idle" }
  | { status: "configuring"; settings: ExportSettings }
  | {
      status: "exporting";
      settings: ExportSettings;
      exportId: string;
      progress: number;
      framesEncoded: number;
      totalFrames: number;
      etaMs?: number;
    }
  | {
      status: "completed";
      settings: ExportSettings;
      outputPath: string;
    }
  | {
      status: "failed";
      settings: ExportSettings;
      error: string;
    };

export interface ExportCaptureOptions {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  totalFrames: number;
  exportId: string;
  writeFrame: (frame: Uint8Array) => Promise<void>;
  onFrame: (frameIndex: number, totalFrames: number) => void;
  signal?: AbortSignal;
}

export type ExportCaptureHandler = (
  options: ExportCaptureOptions,
) => Promise<void>;
