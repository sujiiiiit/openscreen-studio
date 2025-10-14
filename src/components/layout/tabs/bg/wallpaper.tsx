import { useId, useState, useRef, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Squircle } from "@squircle-js/react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { useBackground } from "@/context/background-context";

const wallpapers = [
  { value: "1", label: "ipad-17-dark" },
  { value: "2", label: "ipad-17-light" },
  { value: "3", label: "sequoia-blue-orange" },
  { value: "4", label: "sequoia-blue" },
  { value: "5", label: "sonoma-clouds" },
  { value: "6", label: "sonoma-dark" },
  { value: "7", label: "sonoma-evening" },
  { value: "8", label: "sonoma-from-above" },
  { value: "9", label: "sonoma-horizon" },
  { value: "10", label: "sonoma-light" },
  { value: "11", label: "sonoma-river" },
  { value: "12", label: "tahoe-dark" },
  { value: "13", label: "tahoe-light" },
  { value: "14", label: "ventura-dark" },
  { value: "15", label: "ventura-semi-dark" },
  { value: "16", label: "ventura" },
];

export default function Component() {
  const id = useId();
  const { wallpaperUrl, setWallpaperUrl } = useBackground();
  
  // Find current selected value from URL
  const getCurrentValue = () => {
    const currentWallpaper = wallpapers.find(
      (w) => wallpaperUrl === `/assets/backgrounds/${w.label}.jpg`
    );
    return currentWallpaper?.value || "1";
  };

  const [selectedValue, setSelectedValue] = useState(getCurrentValue());
  const [isOpen, setIsOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(130);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        setContentHeight(130);
      }
    }
  }, [isOpen]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    const wallpaper = wallpapers.find((w) => w.value === value);
    if (wallpaper) {
      // Use high-resolution image for canvas
      setWallpaperUrl(`/assets/backgrounds/${wallpaper.label}.jpg`);
    }
  };

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
            value={selectedValue}
            onValueChange={handleValueChange}
          >
            {wallpapers.map((item) => (
              <label className="w-full" key={`${id}-${item.value}`}>
                <Squircle
                  cornerRadius={15}
                  cornerSmoothing={2}
                  className={cn(
                    "relative outline-none aspect-square cursor-pointer overflow-hidden group"
                  )}
                  style={{
                    backgroundImage: `url(/assets/placeholder/${item.label}.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <RadioGroupItem
                    id={`${id}-${item.value}`}
                    value={item.value}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-black/20 transition-opacity duration-200 z-10",
                      selectedValue === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-opacity duration-200 z-10",
                      selectedValue === item.value ? "opacity-100" : "opacity-0"
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
    </>
  );
}
