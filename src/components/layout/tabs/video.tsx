import { Button } from "@/components/ui/button";

export function VideoTabContent() {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Video Settings</h3>
      <p className="text-xs text-muted-foreground">
        Configure resolution, frame rate, and background blur levels.
      </p>
      <div className="grid gap-2">
        <Button variant="secondary">Resolution</Button>
        <Button variant="ghost">Advanced settings</Button>
      </div>
    </section>
  );
}
