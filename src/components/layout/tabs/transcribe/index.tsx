import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AiAudioIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tabs,
  TabsContentWrapper,
  TabsContent,
  useTabs,
} from "@/components/ui/tabs";
import { GenerateTabContent } from "@/components/layout/tabs/transcribe/generate";

// Custom trigger component using the useTabs hook
function TranscribeActions() {
  const { setActiveTab } = useTabs();

  return (
    <div className="grid gap-2">
      <Button
        onClick={() => setActiveTab("generated")}
        className="bg-primary-active-bg text-primary-active hover:[&_svg]:stroke-primary-active hover:bg-primary-active-bg"
      >
        <HugeiconsIcon icon={AiAudioIcon} />
        Generate
      </Button>
      <Button variant="ghost">Import subtitles</Button>
    </div>
  );
}

// Generated transcription view

export function TranscribeTabContent() {
  return (
    <Tabs defaultValue="initial">
      <TabsContentWrapper>
        {/* Initial view - before generation */}
        <TabsContent value="initial">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Transcription</h3>
              <Switch />
            </div>
            <p className="text-xs text-muted-foreground">
              Style captions, adjust timings, and manage language tracks.
            </p>
            <TranscribeActions />
          </section>
        </TabsContent>

        {/* Generated view - after clicking generate */}
        <TabsContent value="generated">
          <GenerateTabContent />
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}
