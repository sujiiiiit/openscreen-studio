import { Button } from "@/components/ui/button";

export function CursorTabContent() {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Cursor Effects</h3>
      <p className="text-xs text-muted-foreground">
        Highlight clicks, add ripples, or magnify your pointer for emphasis.
      </p>
      <div className="grid gap-2">
        <Button variant="secondary">Enable highlight</Button>
        <Button variant="ghost">Customize trail</Button>
      </div>
    </section>
  );
}
