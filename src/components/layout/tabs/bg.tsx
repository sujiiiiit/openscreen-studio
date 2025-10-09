import { Button } from "@/components/ui/button";
export function BackgroundTabContent() {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Background</h3>
      <p className="text-xs text-muted-foreground">
        Adjust canvas fill, gradients, and overlays for your recording surface.
      </p>
      <div className="grid gap-2">
        <Button variant="secondary">Choose Color</Button>
        <Button variant="ghost">Upload background</Button>
      </div>
    </section>
  );
}
