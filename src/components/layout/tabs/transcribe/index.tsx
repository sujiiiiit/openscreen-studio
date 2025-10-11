import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AiAudioIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function TranscribeTabContent() {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Transcription</h3>
        <Switch />
      </div>
      <p className="text-xs text-muted-foreground">
        Style captions, adjust timings, and manage language tracks.
      </p>
      <div className="grid gap-2">
        <Button className="bg-primary-active hover:bg-primary-active-bg hover:text-primary-active hover:[&_svg]:stroke-primary-active">
          <HugeiconsIcon icon={AiAudioIcon} />
          Generate
        </Button>
        <Button variant="secondary">Import subtitles</Button>
      </div>
    </section>
  );
}
