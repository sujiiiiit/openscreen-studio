import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AiAudioIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tabs,
  TabsContentWrapper,
  TabsContent,
  useTabs,
} from "@/components/ui/tabs";
import SquiggleLoader from "@/components/ui/squiggle-loader";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { TextLoop } from "@/components/ui/text-loop";


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
function GeneratedTranscriptionView() {
  const { setActiveTab } = useTabs();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="link"
          size="sm"
          onClick={() => setActiveTab("initial")}
          className="text-sm font-semibold has-[>svg]:px-0 h-fit"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          Transcription
        </Button>
        <Button
          variant="link"
          size="sm"
          className="text-xs text-muted-foreground h-fit has-[>svg]:px-0"
        >
          Whisper-base &middot; auto
          <HugeiconsIcon icon={ArrowLeft01Icon} className="-rotate-90 size-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground px-6">
        While using it for the first time, it may take a few minutes to download the model.
      </p>
      <div className=" text-sm flex gap-2 items-center ">
        <SquiggleLoader strokeColor="#86837e" />
        <TextLoop loop={false}>
          <TextShimmer>Preparing</TextShimmer>
          <TextShimmer>Analyzing</TextShimmer>
          <TextShimmer>Thinking</TextShimmer>
          <TextShimmer>Generating</TextShimmer>
        </TextLoop>
      </div>
    </section>
  );
}

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
          <GeneratedTranscriptionView />
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}
