import SquiggleLoader from "@/components/ui/squiggle-loader";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { TextLoop } from "@/components/ui/text-loop";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { LANGUAGES } from "@/types/language";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  BrainIcon,
  LanguageSquareIcon,
} from "@hugeicons/core-free-icons";
import { DownloadModel } from "@/components/layout/tabs/transcribe/generate/download";
const models = [
  {
    id: "whisper-tiny",
    name: "Whisper Tiny",
    size: "39 MB",
    speed: "very fast",
    performance: "basic",
  },
  {
    id: "whisper-base",
    name: "Whisper Base",
    size: "74 MB",
    speed: "fast",
    performance: "good",
  },
  {
    id: "whisper-small",
    name: "Whisper Small",
    size: "244 MB",
    speed: "medium",
    performance: "better",
  },
  {
    id: "whisper-medium",
    name: "Whisper Medium",
    size: "769 MB",
    speed: "slow",
    performance: "very good",
  },
  {
    id: "distil-medium.en",
    name: "Distil Whisper Medium (English)",
    size: "394 MB",
    speed: "fast",
    performance: "good",
  },
  {
    id: "distil-large-v2",
    name: "Distil Whisper Large v2",
    size: "756 MB",
    speed: "medium",
    performance: "very good",
  },
];

export function GenerateTabContent() {
  const { setActiveTab } = useTabs();
  const [activeModel, setActiveModel] = useState("whisper-base");
  const [activeLanguage, setActiveLanguage] = useState("auto");
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground h-fit has-[>svg]:px-0"
            >
              {activeModel} &middot; {activeLanguage}
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="-rotate-90 size-4"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="overflow-y-hidden">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <HugeiconsIcon icon={BrainIcon} />
                Models
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={activeModel}
                  onValueChange={setActiveModel}
                >
                  {models.map((model) => (
                    <DropdownMenuRadioItem
                      key={model.id}
                      value={model.id}
                      className="h-fit py-3"
                    >
                      <div className="flex flex-col gap-1 items-start min-w-0">
                        <span className="font-medium text-sm leading-tight">
                          {model.name}
                        </span>
                        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <span className="rounded text-xs flex items-center gap-0.5 h-fit">
                            {model.speed}
                            <span>&middot;</span>
                            {model.performance}
                            <span>&middot;</span>
                            {model.size}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <HugeiconsIcon icon={LanguageSquareIcon} />
                Language
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-72 overflow-hidden">
                <ScrollArea className="h-64">
                  <DropdownMenuRadioGroup
                    value={activeLanguage}
                    onValueChange={setActiveLanguage}
                  >
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                      <DropdownMenuRadioItem key={code} value={code}>
                        {name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </ScrollArea>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-xs text-muted-foreground px-6">
        While using it for the first time, it may take a few minutes to download
        the model.
      </p>
      <div className=" text-sm flex gap-2 items-center ">
        <SquiggleLoader strokeColor="#86837e" />
        <TextLoop loop={false}>
          <TextShimmer>Preparing</TextShimmer>
          <TextShimmer>Analyzing</TextShimmer>
          <TextShimmer>Thinking</TextShimmer>
          <TextShimmer>Generating</TextShimmer>
          <span className="text-(--shimmer-text-highlight-color)">
            Took 3 min to generate
          </span>
        </TextLoop>
      </div>
      <DownloadModel />
    </section>
  );
}
