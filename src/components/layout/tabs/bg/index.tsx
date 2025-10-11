import { useId } from "react";

import Tabs from "./tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
export function BackgroundTabContent() {
  const id = useId();

  return (
    <section className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Background</h3>
        <Switch id={id} defaultChecked />
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
          <Slider showTooltip defaultValue={[10]} max={100} step={1} />
          <Button variant="link" size="sm">
            Reset
          </Button>
        </div>
      </div>
      <div className="w-full">
        <h3 className="text-sm font-semibold">Padding</h3>
        <div className="w-full flex gap-2 items-center justify-between">
          <Slider showTooltip defaultValue={[10]} max={100} step={1} />
          <Button variant="link" size="sm">
            Reset
          </Button>
        </div>
      </div>
      </div>
    </section>
  );
}
