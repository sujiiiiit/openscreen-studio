import Color from "color";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/ui/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useBackground,
  VIDEO_BORDER_RADIUS_VALUE,
  VIDEO_SHADOW_VALUE,
  VIDEO_BORDER_VALUE,
  VIDEO_BORDER_COLOR_VALUE,
} from "@/context/background-context";

export function VideoTabContent() {
  const {
    videoBorderRadius,
    setVideoBorderRadius,
    videoShadow,
    setVideoShadow,
    videoBorder,
    setVideoBorder,
    videoBorderColor,
    setVideoBorderColor,
  } = useBackground();

  const handleColorPickerChange = (rgba: Parameters<typeof Color.rgb>[0]) => {
    const color = Color.rgb(rgba);
    setVideoBorderColor(color.hexa());
  };

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Video Settings</h3>
      <p className="text-xs text-muted-foreground">
        Configure video appearance including border radius, shadow, and other
        visual properties.
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
              step={0.1}
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
        <div className="w-full">
          <h3 className="text-sm font-semibold">Border Width</h3>
          <div className="w-full flex gap-2 items-center justify-between">
            <Slider
              showTooltip
              value={[videoBorder]}
              onValueChange={(values) => setVideoBorder(values[0])}
              min={0}
              max={10}
            />
            <Button
              variant="link"
              size="sm"
              onClick={() => setVideoBorder(VIDEO_BORDER_VALUE)}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-sm font-semibold">Border Color</h3>
          <div className="w-full flex gap-2 items-center justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: videoBorderColor }}
                  />
                  <span className="flex-1 text-left">{videoBorderColor}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <div className="p-4">
                  <ColorPicker
                    defaultValue={videoBorderColor}
                    onChange={handleColorPickerChange}
                    className="space-y-4"
                  >
                    <ColorPickerSelection className="h-48" />
                    <div className="space-y-2">
                      <ColorPickerHue />
                      <ColorPickerAlpha />
                    </div>
                    <div className="flex items-center gap-2">
                      <ColorPickerFormat className="flex-1" />
                      <ColorPickerOutput />
                      <ColorPickerEyeDropper />
                    </div>
                  </ColorPicker>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="link"
              size="sm"
              onClick={() => setVideoBorderColor(VIDEO_BORDER_COLOR_VALUE)}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
