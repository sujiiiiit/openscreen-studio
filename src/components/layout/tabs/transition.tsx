import { Button } from "@/components/ui/button";

export function TransitionTabContent() {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Transitions</h3>
      <p className="text-xs text-muted-foreground">
        Control timing, easing, and presets across scenes.
      </p>
      <div className="grid gap-2">
        <Button variant="secondary">Browse presets</Button>
        <Button variant="ghost">Custom easing</Button>
      </div>
    </section>
  );
}
