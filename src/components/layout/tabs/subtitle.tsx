import { Button } from "@/components/ui/button";

export function SubtitleTabContent() {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Subtitle</h3>
      <p className="text-xs text-muted-foreground">
        Style captions, adjust timings, and manage language tracks.
      </p>
      <div className="grid gap-2">
        <Button variant="secondary">Import subtitles</Button>
        <Button variant="ghost">Styling options</Button>
      </div>
    </section>
  );
}
