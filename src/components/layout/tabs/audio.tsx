import { Button } from "@/components/ui/button";

export function AudioTabContent() {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Audio Mix</h3>
      <p className="text-xs text-muted-foreground">
        Balance input devices, noise suppression, and music beds.
      </p>
      <div className="grid gap-2">
        <Button variant="secondary">Select input</Button>
        <Button variant="ghost">Open mixer</Button>
      </div>
    </section>
  );
}
