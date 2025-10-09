import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

type TooltipContentProps = React.ComponentProps<
  typeof TooltipPrimitive.Content
> & {
  kbd?: React.ReactNode;
  [key: `kbd${number}`]: React.ReactNode | undefined;
};

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...restProps
}: TooltipContentProps) {
  const tooltipProps = { ...restProps } as Record<string, unknown>;
  const kbdValues: React.ReactNode[] = [];

  const baseKbd = tooltipProps.kbd as React.ReactNode | undefined;
  if (baseKbd !== undefined && baseKbd !== null && baseKbd !== "") {
    kbdValues.push(baseKbd);
  }
  delete tooltipProps.kbd;

  const additionalKbdKeys = Object.keys(tooltipProps).filter((key) =>
    /^kbd\d+$/.test(key),
  );

  additionalKbdKeys
    .sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)))
    .forEach((key) => {
      const value = tooltipProps[key] as React.ReactNode | undefined;
      if (value !== undefined && value !== null && value !== "") {
        kbdValues.push(value);
      }
      delete tooltipProps[key];
    });

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          `bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance ${kbdValues.length > 0 ? "flex gap-2" : ""}`,
          className,
        )}
        {...(tooltipProps as React.ComponentProps<
          typeof TooltipPrimitive.Content
        >)}
      >
        {children}
        <div className="flex gap-1">
          {kbdValues.length > 0 &&
            kbdValues.map((value, index) => (
              <kbd
                key={`tooltip-kbd-${index}`}
                className={cn(
                  "bg-[rgb(255,255,255,.2)] dark:bg-[rgb(0,0,0,.2)] font-mono  rounded px-1",
                )}
              >
                {value}
              </kbd>
            ))}
        </div>
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
