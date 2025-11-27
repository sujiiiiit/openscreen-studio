import { usePlayback } from "@/context/playback-context";
import { useRef } from "react";
import { TIMELINE_START_LEFT } from "./constants";

interface PlayheadProps {
  zoom: number;
}

export default function Playhead({ zoom }: PlayheadProps) {
  const { currentTime } = usePlayback();
  const ref = useRef<HTMLDivElement>(null);

  // Use ref for smoother updates if possible, but React state is fine for now
  // If performance is an issue, we can use requestAnimationFrame to update the style directly
  
  return (
    <div
      ref={ref}
      className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none"
      style={{
        left: TIMELINE_START_LEFT + currentTime * zoom,
      }}
    >
      <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rotate-45 rounded-sm" />
    </div>
  );
}
