import { useId } from "react";

import Tabs from "./tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  useBackground,
  BACKGROUND_BLUR_VALUE,
  BACKGROUND_PADDING_VALUE,
} from "@/context/background-context";

export function BackgroundTabContent() {
  const id = useId();
  const {
    enabled,
    setEnabled,
    blurStrength,
    setBlurStrength,
    padding,
    setPadding,
  } = useBackground();

  return (
    <section className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Background</h3>
        <Switch id={id} checked={enabled} onCheckedChange={setEnabled} />
      </div>
      <p className="text-xs text-muted-foreground">
        Adjust canvas fill, gradients, and overlays for your recording surface.
      </p>
      <div className="grid gap-2 w-full relative">
        <Tabs />
      </div>
      <div className="space-y-7">
        <div className="w-full">
          <h3 className="text-sm font-semibold">Background blur</h3>
          <div className="w-full flex gap-2 items-center justify-between">
            <Slider
              showTooltip
              value={[blurStrength]}
              onValueChange={(values) => setBlurStrength(values[0])}
              min={0}
              max={50}
            />
            <Button
              variant="link"
              size="sm"
              onClick={() => setBlurStrength(BACKGROUND_BLUR_VALUE)}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-sm font-semibold">Padding</h3>
          <div className="w-full flex gap-2 items-center justify-between">
            <Slider
              showTooltip
              value={[padding]}
              onValueChange={(values) => setPadding(values[0])}
              min={0}
              max={20}
            />
            <Button
              variant="link"
              size="sm"
              onClick={() => setPadding(BACKGROUND_PADDING_VALUE)}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
