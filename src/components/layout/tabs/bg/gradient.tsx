import { useId, useState, useRef, useEffect } from "react";
import {
  useBackground,
  type GradientSettings,
  DEFAULT_GRADIENT_SETTINGS,
} from "@/context/background-context";
import { Squircle } from "@squircle-js/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/global-tooltip";

// Preset gradients for quick selection
const GRADIENT_PRESETS: { id: string; settings: GradientSettings }[] = [
  {
    id: "purple-blue",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#667eea", position: 0 },
        { color: "#764ba2", position: 100 },
      ],
    },
  },
  {
    id: "orange-red",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#f093fb", position: 0 },
        { color: "#f5576c", position: 100 },
      ],
    },
  },
  {
    id: "green-teal",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#4facfe", position: 0 },
        { color: "#00f2fe", position: 100 },
      ],
    },
  },
  {
    id: "sunset",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#fa709a", position: 0 },
        { color: "#fee140", position: 100 },
      ],
    },
  },
  {
    id: "ocean",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#0093E9", position: 0 },
        { color: "#80D0C7", position: 100 },
      ],
    },
  },
  {
    id: "night",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#2c3e50", position: 0 },
        { color: "#4ca1af", position: 100 },
      ],
    },
  },
  {
    id: "candy",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#ff6a88", position: 0 },
        { color: "#ff99ac", position: 50 },
        { color: "#fcb69f", position: 100 },
      ],
    },
  },
  {
    id: "aurora",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#00c6ff", position: 0 },
        { color: "#0072ff", position: 50 },
        { color: "#7c3aed", position: 100 },
      ],
    },
  },
  {
    id: "forest",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#134e5e", position: 0 },
        { color: "#71b280", position: 100 },
      ],
    },
  },
  {
    id: "flame",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#f12711", position: 0 },
        { color: "#f5af19", position: 100 },
      ],
    },
  },
  {
    id: "midnight",
    settings: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#232526", position: 0 },
        { color: "#414345", position: 100 },
      ],
    },
  },
  {
    id: "radial-sunset",
    settings: {
      type: "radial",
      angle: 0,
      stops: [
        { color: "#fee140", position: 0 },
        { color: "#fa709a", position: 100 },
      ],
    },
  },
];

// Helper to generate CSS gradient string
export function generateGradientCSS(settings: GradientSettings): string {
  const stopsCSS = settings.stops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");

  switch (settings.type) {
    case "linear":
      return `linear-gradient(${settings.angle}deg, ${stopsCSS})`;
    case "radial":
      return `radial-gradient(circle, ${stopsCSS})`;
    case "conic":
      return `conic-gradient(from ${settings.angle}deg, ${stopsCSS})`;
    default:
      return `linear-gradient(${settings.angle}deg, ${stopsCSS})`;
  }
}

type CustomGradient = {
  id: string;
  settings: GradientSettings;
};

export default function GradientTabContent() {
  const id = useId();
  const {
    gradientSettings,
    setGradientSettings,
    setBackgroundMode,
    backgroundMode,
  } = useBackground();
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(130);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle expandable grid height
  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        setContentHeight(130);
      }
    }
  }, [isOpen]);

  // Check if current gradient matches any preset or custom gradient
  const getSelectedPreset = () => {
    if (backgroundMode !== "gradient") {
      return "";
    }

    // Check presets
    const matchingPreset = GRADIENT_PRESETS.find(
      (p) => JSON.stringify(p.settings) === JSON.stringify(gradientSettings)
    );
    return matchingPreset?.id || "";
  };

  const handlePresetChange = (presetId: string) => {
    // Find in presets
    const preset = GRADIENT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setGradientSettings(preset.settings);
      setBackgroundMode("gradient");
    }
  };

  // All gradients (presets only)
  const allGradients = [...GRADIENT_PRESETS];

  return (
    <>
      <div
        className="w-full relative overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${contentHeight}px` }}
      >
        <div ref={contentRef} className="w-full">
          <div
            className={cn(
              "absolute left-0 right-0 bottom-0 h-[50px] z-10 pointer-events-none transition-opacity duration-300",
              isOpen ? "opacity-0" : "opacity-100"
            )}
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255, 0) 0%, rgba(255,255,255, 1) 100%)",
            }}
          ></div>
          <RadioGroup
            className="w-full grid grid-cols-5 gap-2 relative"
            value={getSelectedPreset()}
            onValueChange={handlePresetChange}
          >
            {/* Render all gradients (custom + presets) */}
            {allGradients.map((gradient) => (
              <Tooltip key={gradient.id}>
                <TooltipTrigger>
                  <label className="w-full" key={`${id}-${gradient.id}`}>
                    <Squircle
                      cornerRadius={15}
                      cornerSmoothing={2}
                      className={cn(
                        "relative outline-none aspect-square cursor-pointer overflow-hidden group"
                      )}
                      style={{
                        background: generateGradientCSS(gradient.settings),
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <RadioGroupItem
                        id={`${id}-${gradient.id}`}
                        value={gradient.id}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 bg-black/20 transition-opacity duration-200 z-10",
                          getSelectedPreset() === gradient.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity duration-200 z-10",
                          getSelectedPreset() === gradient.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-primary"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </Squircle>
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  {gradient.id
                    .replace(/-/g, " ")
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </TooltipContent>
              </Tooltip>
            ))}
          </RadioGroup>
        </div>
      </div>
      <Button
        variant={"ghost"}
        className="bg-transparent hover:bg-transparent w-full relative inset-0 z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HugeiconsIcon
          className={`transition-all duration-300 ${isOpen ? "-rotate-180" : null}`}
          icon={ArrowDown01Icon}
        />
      </Button>

      {/* Angle Quick Adjust */}
      {backgroundMode === "gradient" && gradientSettings.type !== "radial" && (
        <div className="my-4 space-y-2">
          <div className="w-full">
            <h3 className="text-sm font-semibold">
              Angle: {gradientSettings.angle}°
            </h3>
            <div className="w-full flex gap-2 items-center justify-between">
              <Slider
                showTooltip
                value={[gradientSettings.angle]}
                onValueChange={(values) =>
                  setGradientSettings({ ...gradientSettings, angle: values[0] })
                }
                min={0}
                max={360}
                step={1}
              />
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  setGradientSettings({
                    ...gradientSettings,
                    angle: DEFAULT_GRADIENT_SETTINGS.angle,
                  })
                }
              >
                Reset
              </Button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
