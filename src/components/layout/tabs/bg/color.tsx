import { useId, useState, useRef, useEffect } from "react";
import { useBackground } from "@/context/background-context";
import { Label } from "@/components/ui/label";
import { Squircle } from "@squircle-js/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/ui/color-picker";
import Color from "color";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/global-tooltip";

// Color presets for quick selection
const COLOR_PRESETS = [
  { value: "#000000", label: "Black" },
  { value: "#1a1a1a", label: "Dark Gray" },
  { value: "#ff6b6b", label: "Red" },
  { value: "#4ecdc4", label: "Teal" },
  { value: "#45b7d1", label: "Blue" },
  { value: "#BCD1CA", label: "Green" },
  { value: "#ffeaa7", label: "Yellow" },
  { value: "#CBCADB", label: "new" },
  { value: "#D97757", label: "antropic" },
];

type CustomColor = {
  value: string;
  label: string;
};

export default function ColorTabContent() {
  const id = useId();
  const {
    backgroundColor,
    setBackgroundColor,
    setBackgroundMode,
    backgroundMode,
  } = useBackground();
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(130);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [customColors, setCustomColors] = useState<CustomColor[]>([]);
  const [pickerColor, setPickerColor] = useState(backgroundColor || "#000000");

  // Update picker color when popover opens
  useEffect(() => {
    if (isPickerOpen) {
      setPickerColor(backgroundColor || "#000000");
    }
  }, [isPickerOpen, backgroundColor]);

  // Handle expandable grid height
  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        setContentHeight(130);
      }
    }
  }, [isOpen, customColors]);

  // Check if current color matches any preset or custom color
  const getSelectedPreset = () => {
    // Only show selection if we're in color mode
    if (backgroundMode !== "color") {
      return "";
    }

    // Check custom colors first
    const matchingCustom = customColors.find(
      (c) => c.value.toLowerCase() === backgroundColor.toLowerCase(),
    );
    if (matchingCustom) return matchingCustom.value;

    // Then check presets
    const matchingPreset = COLOR_PRESETS.find(
      (p) => p.value.toLowerCase() === backgroundColor.toLowerCase(),
    );
    return matchingPreset?.value || "";
  };

  const handlePresetChange = (value: string) => {
    setBackgroundColor(value);
    setBackgroundMode("color");
  };

  const handleColorPickerChange = (rgba: Parameters<typeof Color.rgb>[0]) => {
    if (Array.isArray(rgba) && rgba.length >= 3) {
      const color = Color.rgb(rgba as [number, number, number, number]);
      setPickerColor(color.hex());
    }
  };

  const handleAddColor = () => {
    const hexColor = pickerColor;

    // Check if color already exists
    const existsInPresets = COLOR_PRESETS.some(
      (p) => p.value.toLowerCase() === hexColor.toLowerCase(),
    );
    const existsInCustom = customColors.some(
      (c) => c.value.toLowerCase() === hexColor.toLowerCase(),
    );

    if (!existsInPresets && !existsInCustom) {
      // Add new custom color
      const newColor: CustomColor = {
        value: hexColor,
        label: `Custom ${customColors.length + 1}`,
      };
      setCustomColors([newColor, ...customColors]);
    }

    // Apply the color
    setBackgroundColor(hexColor);
    setBackgroundMode("color");
    setIsPickerOpen(false);
  };

  // All colors (custom + presets)
  const allColors = [...customColors, ...COLOR_PRESETS];

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
              isOpen ? "opacity-0" : "opacity-100",
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
            {/* Color Picker Button */}
            <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <PopoverTrigger asChild>
                <div className="w-full">
                  <Squircle
                    cornerRadius={15}
                    cornerSmoothing={2}
                    className={cn(
                      "relative outline-none aspect-square cursor-pointer overflow-hidden group bg-muted border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-200",
                    )}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={Add01Icon}
                        className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-200"
                      />
                    </div>
                  </Squircle>
                </div>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <div className="p-4">
                  <ColorPicker
                    defaultValue={pickerColor}
                    onChange={handleColorPickerChange}
                    className="space-y-4"
                  >
                    <ColorPickerSelection className="h-48" />
                    <div className="space-y-2">
                      <ColorPickerHue />
                      <ColorPickerAlpha />
                    </div>
                    <div className="flex items-center gap-2">
                      <ColorPickerFormat className="flex-1" />
                      <ColorPickerOutput />
                      <ColorPickerEyeDropper />
                    </div>
                  </ColorPicker>
                  <Button
                    onClick={handleAddColor}
                    className="w-full mt-4"
                    size="sm"
                  >
                    Add Color
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Render all colors (custom + presets) */}
            {allColors.map((color) => (
              <Tooltip key={color.value}>
                <TooltipTrigger>
                  <label className="w-full" key={`${id}-${color.value}`}>
                    <Squircle
                      cornerRadius={15}
                      cornerSmoothing={2}
                      className={cn(
                        "relative outline-none aspect-square cursor-pointer overflow-hidden group",
                      )}
                      style={{
                        backgroundColor: color.value,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <RadioGroupItem
                        id={`${id}-${color.value}`}
                        value={color.value}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 bg-black/20 transition-opacity duration-200 z-10",
                          getSelectedPreset() === color.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity duration-200 z-10",
                          getSelectedPreset() === color.value
                            ? "opacity-100"
                            : "opacity-0",
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
                <TooltipContent>{color.value}</TooltipContent>
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

      {/* Color Shades Gradient */}
      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          Select the color shade above to get color values below
        </p>
        <Squircle
          cornerRadius={17}
          cornerSmoothing={4}
          className={cn("w-full h-16 rounded-lg overflow-hidden flex")}
        >
          {Array.from({ length: 10 }).map((_, index) => {
            // Create shades from light to dark
            const lightness = 95 - index * 4.5; // From 95% to ~5%
            try {
              const baseColor = Color(backgroundColor);
              const [h, s] = baseColor.hsl().array();
              const shadeColor = Color.hsl(h, s, lightness);
              const shadeHex = shadeColor.hex();
              const isSelected =
                backgroundMode === "color" &&
                backgroundColor.toLowerCase() === shadeHex.toLowerCase();

              return (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <div
                      key={index}
                      className="flex-1 cursor-pointer relative"
                      onClick={() => {
                        setBackgroundColor(shadeHex);
                        setBackgroundMode("color");
                      }}
                    >
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: shadeHex }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Squircle
                            cornerRadius={8}
                            cornerSmoothing={1}
                            className="w-4 h-4 bg-white shadow-lg flex items-center justify-center"
                          >
                            <svg
                              className="w-3 h-3 text-primary"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Squircle>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{shadeHex}</TooltipContent>
                </Tooltip>
              );
            } catch {
              return null;
            }
          })}
        </Squircle>
      </div>
    </>
  );
}
