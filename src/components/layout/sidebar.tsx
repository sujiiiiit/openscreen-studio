"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BackgroundIcon,
  EaseInOutIcon,
  Video01Icon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CursorIcon, SubtitleIcon } from "@/components/ui/icons";
import { useSidebarTabs } from "@/hooks/use-sidebar-tabs";
import {
  AudioTabContent,
  BackgroundTabContent,
  CursorTabContent,
  SubtitleTabContent,
  TransitionTabContent,
  VideoTabContent,
} from "./tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { type TabItem, type TabId } from "@/types";

const TAB_ITEMS: TabItem[] = [
  {
    id: "background",
    label: "Background",
    icon: <HugeiconsIcon icon={BackgroundIcon} className="size-5" />,
    content: <BackgroundTabContent />,
  },
  {
    id: "cursor",
    label: "Cursor",
    icon: <CursorIcon />,
    content: <CursorTabContent />,
  },
  {
    id: "video",
    label: "Video",
    icon: <HugeiconsIcon icon={Video01Icon} className="size-5" />,
    content: <VideoTabContent />,
  },
  {
    id: "subtitle",
    label: "Subtitle",
    icon: <SubtitleIcon />,
    content: <SubtitleTabContent />,
  },
  {
    id: "audio",
    label: "Audio",
    icon: <HugeiconsIcon icon={VolumeHighIcon} className="size-5" />,
    content: <AudioTabContent />,
  },
  {
    id: "transition",
    label: "Transition",
    icon: <HugeiconsIcon icon={EaseInOutIcon} className="size-5" />,
    content: <TransitionTabContent />,
  },
];

export default function Sidebar() {
  const tabs = useMemo(() => TAB_ITEMS, []);
  const { activeTab, selectTab, toggle, isOpen } = useSidebarTabs<TabId>(
    tabs[0].id,
  );
  const activeIndex = tabs.findIndex((item) => item.id === activeTab);
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <aside className="h-full border-r relative bg-background">
      <div className="flex h-full flex-row">
        <ScrollArea className="h-full p-2">
          <div className="flex flex-col items-center gap-4">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;

              return (
                <div
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  className="flex w-full flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-tab-indicator"
                        className="absolute inset-0 z-[1] rounded-md bg-background shadow-md dark:bg-muted"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "group relative text-foreground transition",
                        "hover:bg-background",
                        isActive ? "z-[2]" : "",
                      )}
                    >
                      <span
                        className={`relative flex size-6 items-center justify-center text-lg ${isActive ? "[&_svg]:text-primary-active" : ""}`}
                      >
                        {tab.icon}
                      </span>
                    </Button>
                  </span>
                  <motion.span
                    layout
                    className={"text-xs transition-colors select-none"}
                  >
                    {tab.label}
                  </motion.span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <motion.div
          className="relative h-full flex-shrink-0"
          animate={{ width: isOpen ? 360 : 0 }}
          initial={false}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          style={{ overflow: "hidden" }}
        >
          <motion.div
            className="absolute inset-0 h-full w-[360px]"
            animate={{
              opacity: isOpen ? 1 : 0,
              x: isOpen ? 0 : 24,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
          >
            <div className="relative h-full overflow-hidden">
              {tabs.map((tab, index) => {
                const offset = index - safeActiveIndex;
                const isActive = offset === 0;

                return (
                  <motion.div
                    key={tab.id}
                    initial={false}
                    animate="animate"
                    variants={{
                      animate: (value: number) => ({
                        opacity: value === 0 ? 1 : 0,
                        y: value * 36,
                        scale: value === 0 ? 1 : 0.98,
                      }),
                    }}
                    custom={offset}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 30,
                    }}
                    className="absolute inset-0"
                    style={{
                      pointerEvents: isActive && isOpen ? "auto" : "none",
                    }}
                  >
                    <ScrollArea className="h-full">
                      <div className="space-y-6 p-4">{tab.content}</div>
                    </ScrollArea>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>




        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggle}
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="absolute top-1/2 -right-3 z-10 -translate-y-1/2 cursor-pointer  py-4 bg-background border rounded-full outline-0"
            >
              {isOpen ? (
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              ) : (
                <HugeiconsIcon icon={ArrowRight01Icon} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isOpen ? "Collapse" : "Expand"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
