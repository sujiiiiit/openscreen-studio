import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useBackground, VIDEO_BORDER_RADIUS_VALUE, VIDEO_SHADOW_VALUE } from "@/context/background-context";

export function VideoTabContent() {
  const { videoBorderRadius, setVideoBorderRadius, videoShadow, setVideoShadow } = useBackground();

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Video Settings</h3>
      <p className="text-xs text-muted-foreground">
        Configure video appearance including border radius, shadow, and other visual properties.
      </p>
      <div className="space-y-7 pt-4">
        <div className="w-full">
          <h3 className="text-sm font-semibold">Border Radius</h3>
          <div className="w-full flex gap-2 items-center justify-between">
            <Slider
              showTooltip
              value={[videoBorderRadius]}
              onValueChange={(values) => setVideoBorderRadius(values[0])}
              min={0}
              max={20}
              step={0.5}
            />
            <Button
              variant="link"
              size="sm"
              onClick={() => setVideoBorderRadius(VIDEO_BORDER_RADIUS_VALUE)}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-sm font-semibold">Window Shadow</h3>
          <div className="w-full flex gap-2 items-center justify-between">
            <Slider
              showTooltip
              value={[videoShadow]}
              onValueChange={(values) => setVideoShadow(values[0])}
              min={0}
              max={100}
            />
            <Button
              variant="link"
              size="sm"
              onClick={() => setVideoShadow(VIDEO_SHADOW_VALUE)}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
