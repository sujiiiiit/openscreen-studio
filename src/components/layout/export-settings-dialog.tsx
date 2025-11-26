import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export type ExportSettings = {
  resolution: "4k" | "1080p" | "720p" | "480p";
  format: "mp4" | "webm";
  quality: "high" | "medium" | "low";
};

type ExportSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (settings: ExportSettings) => void;
};

export default function ExportSettingsDialog({
  open,
  onOpenChange,
  onExport,
}: ExportSettingsDialogProps) {
  const [resolution, setResolution] = useState<ExportSettings["resolution"]>(
    "1080p",
  );
  const [format, setFormat] = useState<ExportSettings["format"]>("mp4");
  const [quality, setQuality] = useState<ExportSettings["quality"]>("high");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
          <DialogDescription>
            Choose your video export settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="resolution" className="text-right">
              Resolution
            </Label>
            <Select
              value={resolution}
              onValueChange={(v) =>
                setResolution(v as ExportSettings["resolution"])
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="480p">480p (SD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as ExportSettings["format"])}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                <SelectItem value="webm">WebM (VP9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quality" className="text-right">
              Quality
            </Label>
            <Select
              value={quality}
              onValueChange={(v) => setQuality(v as ExportSettings["quality"])}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (Best)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="low">Low (Smallest file)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onExport({ resolution, format, quality });
              onOpenChange(false);
            }}
          >
            Start Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
