import { usePlayback } from "@/context/playback-context";
import { useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { TIMELINE_START_LEFT } from "./constants";

interface PlayheadProps {
  zoom: number;
}

export default function Playhead({ zoom }: PlayheadProps) {
  const { currentTime, subscribeToTimeUpdate } = usePlayback();
  
  // Create a motion value for the x position
  // Initialize it with the current position
  const x = useMotionValue(TIMELINE_START_LEFT + currentTime * zoom);

  // Subscribe to smooth time updates
  useEffect(() => {
    if (!subscribeToTimeUpdate) return;
    
    const updatePosition = (time: number) => {
      // Update the motion value directly
      // This bypasses React render cycle and updates the DOM style directly
      const position = TIMELINE_START_LEFT + time * zoom;
      x.set(position);
    };
    
    // Initial position update in case zoom changed
    updatePosition(currentTime);
    
    return subscribeToTimeUpdate(updatePosition);
  }, [subscribeToTimeUpdate, zoom, currentTime, x]);

  return (
    <motion.div
      className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none will-change-transform"
      style={{
        left: 0,
        x // Bind the motion value to the x transform
      }}
    >
      <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rotate-45 rounded-sm" />
    </motion.div>
  );
}
