import { usePlayback } from "@/context/playback-context";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { TIMELINE_START_LEFT } from "./constants";

interface HoverPlayheadProps {
  zoom: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};

export default function HoverPlayhead({ zoom }: HoverPlayheadProps) {
  const { subscribeToPreviewTimeUpdate } = usePlayback();
  const [isVisible, setIsVisible] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  
  // Create a motion value for the x position
  const x = useMotionValue(TIMELINE_START_LEFT);

  // Subscribe to preview time updates
  useEffect(() => {
    if (!subscribeToPreviewTimeUpdate) return;
    
    const updatePosition = (time: number | null) => {
      if (time === null) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
        const position = TIMELINE_START_LEFT + time * zoom;
        x.set(position);
        
        if (labelRef.current) {
          labelRef.current.innerText = formatTime(time);
        }
      }
    };
    
    return subscribeToPreviewTimeUpdate(updatePosition);
  }, [subscribeToPreviewTimeUpdate, zoom, x]);

  return (
    <motion.div
      className="absolute top-0 bottom-0 z-40 pointer-events-none will-change-transform flex flex-col items-center"
      style={{
        left: 0,
        x,
        opacity: isVisible ? 1 : 0,
        display: isVisible ? "flex" : "none",
        width: 0,
      }}
    >
      {/* Time Label - Positioned above the track area (over the ruler) */}
      <div 
        ref={labelRef}
        className="absolute top-10 bg-zinc-900/90 text-white text-[10px]  px-1.5 py-0.5 rounded-full border border-white/10 shadow-sm whitespace-nowrap backdrop-blur-sm z-50"
      >
        0:00.00
      </div>

      {/* Head/Indicator */}
      <div className="absolute top-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-black" />

      {/* Line */}
      <div className="w-px h-full border-l border-dashed border-black" />
    </motion.div>
  );
}
