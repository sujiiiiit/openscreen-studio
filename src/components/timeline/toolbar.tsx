import { Slider } from "@/components/ui/slider";
// import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomSliderProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (value: number) => void;
}

export function ZoomSlider({
  zoom,
  minZoom,
  maxZoom,
  onZoomChange,
}: ZoomSliderProps) {
  return (
    <div className="flex items-center gap-2">
      {/* <button
        onClick={() => onZoomChange(Math.max(minZoom, zoom - (zoom < 50 ? 5 : 10)))}
        className="rounded-full border border-white/10 p-1 text-muted-foreground hover:border-white/30 hover:text-foreground"
        aria-label="Zoom out"
      >
        <ZoomOut className="size-3" />
      </button> */}
      <div className="flex w-20 sm:w-28 md:w-32  gap-2 flex-nowrap">
        <Slider
          max={maxZoom}
          min={minZoom}
          step={5}
          value={[zoom]}
          onValueChange={([value]) => {
            if (typeof value === "number") {
              onZoomChange(value);
            }
          }}
        />
        <span className="text-center text-xs text-muted-foreground">
          {zoom < 100 ? Math.round(zoom) : zoom.toFixed(0)}%
        </span>
      </div>
      {/* <button
        onClick={() => onZoomChange(Math.min(maxZoom, zoom + (zoom < 50 ? 5 : 10)))}
        className="rounded-full border border-white/10 p-1 text-muted-foreground hover:border-white/30 hover:text-foreground"
        aria-label="Zoom in"
      >
        <ZoomIn className="size-3" />
      </button> */}
    </div>
  );
}
