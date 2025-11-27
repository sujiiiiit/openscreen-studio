import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import type { TimelineLayer, TimelineClip } from "./types";
import Ruler from "./ruler";
import Track from "./track";
import Playhead from "./playhead";
import ClipContextMenu from "./context-menu";
import {
  usePlayback,
  TIMELINE_ZOOM_MIN,
  TIMELINE_ZOOM_MAX,
} from "@/context/playback-context";
import {
  RULER_HEIGHT,
  TIMELINE_MIN_DURATION,
  TIMELINE_PADDING,
  TIMELINE_START_LEFT,
} from "./constants";
import { cn } from "@/lib/utils";

// Generate initial clips from video element
const createInitialClips = (videoElement: HTMLVideoElement | null, duration: number): TimelineClip[] => {
  if (!videoElement || duration <= 0) return [];
  
  return [{
    id: "main-video-1",
    start: 0,
    duration: duration,
    name: "output.mp4",
    type: "video",
    color: "#fbbf24",
    metadata: "Main Video",
    originalDuration: duration,
    trimStart: 0,
    trimEnd: 0,
  }];
};

export default function Timeline() {
  const { timelineZoom, setTimelineZoom, duration, seek, togglePlay, step, videoElement, scissorMode, setScissorMode } = usePlayback();
  
  // Store clips in state for split/delete operations
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const clipIdCounterRef = useRef(1);
  
  // Initialize clips when video loads
  useEffect(() => {
    if (videoElement && duration > 0 && clips.length === 0) {
      setClips(createInitialClips(videoElement, duration));
    }
  }, [videoElement, duration, clips.length]);
  
  // Reset clips when video changes
  useEffect(() => {
    if (!videoElement) {
      setClips([]);
      clipIdCounterRef.current = 1;
    }
  }, [videoElement]);

  // Generate layers from clips state
  const layers = useMemo<TimelineLayer[]>(() => [{
    id: "video-layer-1",
    name: "Video Track",
    isVisible: true,
    isLocked: false,
    kind: "video",
    accentColor: "#eab308",
    clips: clips,
  }], [clips]);

  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(new Set());
  const snapEnabled = true; // Snap is always enabled
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    clipId: string;
  } | null>(null);
  
  // Refs for syncing scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to ensure gapless timeline
  const normalizeClips = (clipsToNormalize: TimelineClip[]): TimelineClip[] => {
    if (clipsToNormalize.length === 0) return [];
    
    // Sort by start time
    const sorted = [...clipsToNormalize].sort((a, b) => a.start - b.start);
    
    // Force first clip to start at 0
    if (sorted[0].start !== 0) {
      sorted[0] = { ...sorted[0], start: 0 };
    }
    
    // Ensure subsequent clips start exactly where previous ended
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = sorted[i-1].start + sorted[i-1].duration;
      if (Math.abs(sorted[i].start - prevEnd) > 0.0001) {
        sorted[i] = { ...sorted[i], start: prevEnd };
      }
    }
    
    return sorted;
  };

  // Handle clip updates (move, resize, trim)
  const handleClipUpdate = useCallback((
    layerId: string,
    clipId: string,
    newStart: number,
    newDuration?: number,
    trimStart?: number,
    trimEnd?: number
  ) => {
    setClips((prevClips) => {
      const clipIndex = prevClips.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return prevClips;

      const updatedClips = [...prevClips];
      const clip = updatedClips[clipIndex];
      
      // Update the target clip
      updatedClips[clipIndex] = {
        ...clip,
        start: newStart,
        duration: newDuration ?? clip.duration,
        trimStart: trimStart ?? clip.trimStart,
        trimEnd: trimEnd ?? clip.trimEnd,
      };

      // Normalize to ensure no gaps
      return normalizeClips(updatedClips);
    });
  }, []);

  // Handle real-time clip resizing (including rolling edits)
  const handleClipResize = useCallback((
    layerId: string,
    clipId: string,
    newStart: number,
    newDuration: number,
    trimStart: number,
    trimEnd: number
  ) => {
    setClips((prevClips) => {
      const clipIndex = prevClips.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return prevClips;

      const oldClip = prevClips[clipIndex];
      const updatedClips = [...prevClips];
      
      // Update the target clip
      updatedClips[clipIndex] = {
        ...oldClip,
        start: newStart,
        duration: newDuration,
        trimStart: trimStart,
        trimEnd: trimEnd,
      };

      // Rolling Edit Logic
      // Check if we are modifying the END of the clip (start didn't change)
      const isModifyingEnd = Math.abs(newStart - oldClip.start) < 0.001;
      
      if (isModifyingEnd) {
        const oldEnd = oldClip.start + oldClip.duration;
        const newEnd = newStart + newDuration;
        const delta = newEnd - oldEnd;
        
        // Find a clip that started exactly where this one ended (within tolerance)
        const nextClipIndex = prevClips.findIndex(c => Math.abs(c.start - oldEnd) < 0.01 && c.id !== clipId);
        
        if (nextClipIndex !== -1) {
          const nextClip = prevClips[nextClipIndex];
          // Adjust next clip: start moves by delta, duration shrinks by delta, trimStart increases by delta
          // This creates the "rolling" effect where the cut point moves but total duration is constant
          
          const nextClipNewStart = nextClip.start + delta;
          const nextClipNewDuration = nextClip.duration - delta;
          const nextClipNewTrimStart = (nextClip.trimStart ?? 0) + delta;
          
          // Only apply if valid
          if (nextClipNewDuration >= TIMELINE_MIN_DURATION && nextClipNewTrimStart >= 0) {
             updatedClips[nextClipIndex] = {
               ...nextClip,
               start: nextClipNewStart,
               duration: nextClipNewDuration,
               trimStart: nextClipNewTrimStart,
             };
          }
        }
      }
      
      // Check if we are modifying the START of the clip (end didn't change roughly)
      // Note: When resizing start, duration also changes, so end stays roughly same
      const oldEnd = oldClip.start + oldClip.duration;
      const newEnd = newStart + newDuration;
      const isModifyingStart = Math.abs(newEnd - oldEnd) < 0.001;
      
      if (isModifyingStart) {
        // Special case: If modifying the start of the FIRST clip
        // We want to trim the start (increase trimStart, decrease duration) but keep start at 0
        // And shift all subsequent clips left (Ripple)
        if (clipIndex === 0) {
           // Force start to 0
           updatedClips[clipIndex].start = 0;
           // Duration and trimStart are already updated by Clip.tsx logic based on delta
           // But Clip.tsx calculated newStart > 0. We reset it to 0.
           // This means the clip effectively ends earlier than Clip.tsx thought?
           // No, Clip.tsx: newStart = initialStart + delta, newDuration = initialDuration - delta.
           // If we force start=0, end = duration.
           // Original end = initialStart + initialDuration.
           // New end = 0 + (initialDuration - delta) = initialDuration - delta.
           // So the end moved left by delta.
           // This is correct for a ripple trim.
        } else {
          const oldStart = oldClip.start;
          const delta = newStart - oldStart; // Positive if moving right (shrinking), Negative if moving left (extending)
          
          // Find a clip that ended exactly where this one started
          const prevClipIndex = prevClips.findIndex(c => Math.abs((c.start + c.duration) - oldStart) < 0.01 && c.id !== clipId);
          
          if (prevClipIndex !== -1) {
            const prevClip = prevClips[prevClipIndex];
            // Adjust prev clip: duration changes by delta
            // If current clip moves right (delta > 0), prev clip extends (duration + delta)
            // If current clip moves left (delta < 0), prev clip shrinks (duration + delta)
            
            const prevClipNewDuration = prevClip.duration + delta;
            const prevClipNewTrimEnd = (prevClip.trimEnd ?? 0) - delta;
            
            // Only apply if valid (duration > min and we have enough trim handle to extend if needed)
            if (prevClipNewDuration >= TIMELINE_MIN_DURATION && prevClipNewTrimEnd >= 0) {
              updatedClips[prevClipIndex] = {
                ...prevClip,
                duration: prevClipNewDuration,
                trimEnd: prevClipNewTrimEnd,
              };
            }
          }
        }
      }

      // Normalize to ensure no gaps (handles ripple effects automatically)
      return normalizeClips(updatedClips);
    });
  }, []);

  const handleSelectClip = (clipId: string, multiSelect = false) => {
    setSelectedClipIds((prev) => {
      const next = new Set(multiSelect ? prev : []);
      if (next.has(clipId)) {
        next.delete(clipId);
      } else {
        next.add(clipId);
      }
      return next;
    });
  };

  const handleDeselect = () => setSelectedClipIds(new Set());

  // Delete clip and shift subsequent clips left to fill gap
  const handleDeleteClip = useCallback((clipId: string) => {
    setClips((prevClips) => {
      const clipToDelete = prevClips.find(c => c.id === clipId);
      if (!clipToDelete) return prevClips;
      
      const deletedEnd = clipToDelete.start + clipToDelete.duration;
      const gapToFill = clipToDelete.duration;
      
      // Remove the clip and shift all clips that start after it
      const remainingClips = prevClips
        .filter(c => c.id !== clipId)
        .map(c => {
          if (c.start >= deletedEnd) {
            // Shift this clip left by the gap amount
            return { ...c, start: c.start - gapToFill };
          }
          return c;
        });
        
      return normalizeClips(remainingClips);
    });
    setSelectedClipIds((prev) => {
      const next = new Set(prev);
      next.delete(clipId);
      return next;
    });
    setContextMenu(null);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedClipIds.size === 0) return;
    
    // Delete clips one by one, starting from the end to maintain proper gap filling
    const sortedSelectedIds = [...selectedClipIds].sort((a, b) => {
      const clipA = clips.find(c => c.id === a);
      const clipB = clips.find(c => c.id === b);
      return (clipB?.start ?? 0) - (clipA?.start ?? 0); // Sort descending by start time
    });
    
    for (const clipId of sortedSelectedIds) {
      handleDeleteClip(clipId);
    }
    setSelectedClipIds(new Set());
  }, [selectedClipIds, clips, handleDeleteClip]);

  // Duplication feature removed as requested
  const handleDuplicateSelected = () => {
    console.log("Duplicate feature not available");
  };

  // Context menu handlers
  const handleContextMenu = (clipId: string, x: number, y: number) => {
    setContextMenu({ clipId, x, y });
  };

  // Duplication feature removed
  const handleDuplicateClip = (_clipId: string) => {
    console.log("Duplicate feature not available");
    setContextMenu(null);
  };

  // Split clip at a specific time position
  const handleSplitClipAtTime = useCallback((clipId: string, splitTime: number) => {
    setClips((prevClips) => {
      const clipIndex = prevClips.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return prevClips;
      
      const clip = prevClips[clipIndex];
      const clipStart = clip.start;
      const clipEnd = clip.start + clip.duration;
      
      // Validate split time is within clip bounds (with some margin)
      if (splitTime <= clipStart + 0.1 || splitTime >= clipEnd - 0.1) {
        console.log("Split time must be within clip bounds");
        return prevClips;
      }
      
      clipIdCounterRef.current += 1;
      const newId1 = `main-video-${clipIdCounterRef.current}`;
      clipIdCounterRef.current += 1;
      const newId2 = `main-video-${clipIdCounterRef.current}`;
      
      // Calculate the original video time offset for each new clip
      const originalTrimStart = clip.trimStart ?? 0;
      const relativeTimeInClip = splitTime - clipStart;
      
      // First clip: from original start to split point
      const clip1: TimelineClip = {
        ...clip,
        id: newId1,
        start: clipStart,
        duration: relativeTimeInClip,
        trimStart: originalTrimStart,
        trimEnd: (clip.originalDuration ?? clip.duration) - originalTrimStart - relativeTimeInClip,
      };
      
      // Second clip: from split point to original end
      const clip2: TimelineClip = {
        ...clip,
        id: newId2,
        start: splitTime,
        duration: clipEnd - splitTime,
        trimStart: originalTrimStart + relativeTimeInClip,
        trimEnd: clip.trimEnd ?? 0,
      };
      
      // Replace original clip with the two new clips
      const newClips = [...prevClips];
      newClips.splice(clipIndex, 1, clip1, clip2);
      
      return newClips.sort((a, b) => a.start - b.start);
    });
    
    // Exit scissor mode after split
    setScissorMode(false);
  }, [setScissorMode]);

  // Handler for when clip is clicked in scissor mode - receives exact split time
  const handleScissorClick = useCallback((clipId: string, splitTime: number) => {
    if (!scissorMode) return;
    handleSplitClipAtTime(clipId, splitTime);
  }, [scissorMode, handleSplitClipAtTime]);

  // Split at playhead position (for context menu)
  const handleSplitClip = useCallback((_clipId: string) => {
    console.log("Use the scissor tool to split clips");
    setContextMenu(null);
  }, []);

  // Calculate the actual timeline duration based on all clips
  const maxClipEnd = useMemo(() => {
    let max = 0;
    layers.forEach((layer) => {
      layer.clips.forEach((clip) => {
        const end = clip.start + clip.duration;
        if (end > max) max = end;
      });
    });
    return max;
  }, [layers]);

  const effectiveDuration = Math.max(duration, maxClipEnd, TIMELINE_MIN_DURATION);
  const totalWidth = (effectiveDuration + TIMELINE_PADDING) * timelineZoom + TIMELINE_START_LEFT;

  // Calculate snap points from all clip edges and playhead
  const snapPoints = useMemo(() => {
    const points = new Set<number>();
    points.add(0); // Timeline start
    layers.forEach((layer) => {
      layer.clips.forEach((clip) => {
        points.add(clip.start);
        points.add(clip.start + clip.duration);
      });
    });
    return Array.from(points).sort((a, b) => a - b);
  }, [layers]);

  const handleRulerClick = (e: React.MouseEvent) => {
      // Calculate time from click position
      // We need to account for scroll position and start left offset
      if (!scrollContainerRef.current) return;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft - TIMELINE_START_LEFT;
      const time = Math.max(0, x / timelineZoom);
      seek(time);
  }

  const handleTimelineAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't deselect or seek if in scissor mode (clicks are handled by clips)
    if (scissorMode) return;
    
    handleDeselect();
    handleRulerClick(e);
  };

  const handleAutoFit = useCallback(() => {
    if (!scrollContainerRef.current) {
      setTimelineZoom(50); // Default fallback
      return;
    }
    const viewportWidth = scrollContainerRef.current.clientWidth;
    const targetDuration = Math.max(effectiveDuration, 1);
    
    // Professional algorithm: Calculate optimal zoom for readable timeline
    // Target: Show appropriate number of major ticks based on video duration
    let optimalZoom: number;
    
    if (targetDuration < 10) {
      // Very short videos: aim for 100-150 px/sec (show 1-2s intervals)
      optimalZoom = viewportWidth / targetDuration;
      optimalZoom = Math.min(150, Math.max(100, optimalZoom));
    } else if (targetDuration < 60) {
      // Short videos (< 1 min): aim for 50-100 px/sec (show 5-10s intervals)
      optimalZoom = viewportWidth / targetDuration;
      optimalZoom = Math.min(100, Math.max(50, optimalZoom));
    } else if (targetDuration < 300) {
      // Medium videos (1-5 min): aim for 30-60 px/sec (show 10-30s intervals)
      optimalZoom = viewportWidth / targetDuration;
      optimalZoom = Math.min(60, Math.max(30, optimalZoom));
    } else if (targetDuration < 900) {
      // Longer videos (5-15 min): aim for 20-40 px/sec (show 30-60s intervals)
      optimalZoom = viewportWidth / targetDuration;
      optimalZoom = Math.min(40, Math.max(20, optimalZoom));
    } else {
      // Very long videos (15+ min): aim for 10-25 px/sec (show 1-5 min intervals)
      optimalZoom = viewportWidth / targetDuration;
      optimalZoom = Math.min(25, Math.max(10, optimalZoom));
    }
    
    // Clamp to global min/max and round to nice number
    const finalZoom = Math.round(
      Math.min(TIMELINE_ZOOM_MAX, Math.max(TIMELINE_ZOOM_MIN, optimalZoom))
    );
    
    setTimelineZoom(finalZoom);
  }, [effectiveDuration, setTimelineZoom]);

  const handleZoomChange = (value: number) => {
    setTimelineZoom(Math.min(TIMELINE_ZOOM_MAX, Math.max(TIMELINE_ZOOM_MIN, value)));
  };

  // Auto-fit timeline when video loads or duration changes
  useEffect(() => {
    if (duration > 0 && scrollContainerRef.current) {
      // Auto-fit on initial load
      handleAutoFit();
    }
  }, [duration, handleAutoFit]); // Run when duration changes


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case " ": // Space - play/pause
          e.preventDefault();
          togglePlay();
          break;
        case "Escape": // Exit scissor mode
          if (scissorMode) {
            e.preventDefault();
            setScissorMode(false);
          }
          break;
        case "Delete":
        case "Backspace":
          if (selectedClipIds.size > 0) {
            e.preventDefault();
            handleDeleteSelected();
          }
          break;
        case "d":
        case "D":
          if ((e.ctrlKey || e.metaKey) && selectedClipIds.size > 0) {
            e.preventDefault();
            handleDuplicateSelected();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          step(e.shiftKey ? -1 : -0.1);
          break;
        case "ArrowRight":
          e.preventDefault();
          step(e.shiftKey ? 1 : 0.1);
          break;
        case "=":
        case "+":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomChange(timelineZoom + (timelineZoom < 50 ? 5 : 10));
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomChange(timelineZoom - (timelineZoom < 50 ? 5 : 10));
          }
          break;
        case "a":
        case "A":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Select all clips
            const allClipIds = new Set<string>();
            layers.forEach((layer) => {
              layer.clips.forEach((clip) => allClipIds.add(clip.id));
            });
            setSelectedClipIds(allClipIds);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    step,
    selectedClipIds,
    handleDeleteSelected,
    handleDuplicateSelected,
    timelineZoom,
    handleZoomChange,
    layers,
    scissorMode,
    setScissorMode,
  ]);

  return (
    <div className={cn(
      "flex flex-col h-full w-full bg-background text-foreground select-none",
      scissorMode && "cursor-crosshair"
    )}>
      {/* Single scroll container for both ruler and tracks */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto "
        onClick={handleTimelineAreaClick}
      >
        <div 
          className="relative min-h-full"
          style={{ width: totalWidth, minWidth: "100%" }}
        >
          {/* Sticky Ruler */}
          <div 
            className={cn(
              "sticky top-0 z-10",
              !scissorMode && "cursor-pointer"
            )}
            style={{ height: RULER_HEIGHT }}
            onClick={(e) => {
              if (scissorMode) return;
              e.stopPropagation();
              handleRulerClick(e);
            }}
          >
            <Ruler zoom={timelineZoom} maxDuration={maxClipEnd} />
          </div>

          {/* Tracks Area - fills remaining height */}
          <div 
            className="relative"
            style={{ minHeight: `calc(100% - ${RULER_HEIGHT}px)` }}
          >
            {layers.map((layer) => (
              <Track
                key={layer.id}
                layer={layer}
                zoom={timelineZoom}
                onClipUpdate={handleClipUpdate}
                selectedClipIds={selectedClipIds}
                onSelectClip={handleSelectClip}
                snapEnabled={snapEnabled}
                snapPoints={snapPoints}
                onContextMenu={handleContextMenu}
                onDuplicateClip={handleDuplicateClip}
                onDeleteClip={handleDeleteClip}
                onSplitClip={handleSplitClip}
                onClipResize={handleClipResize}
                // Main video clip options
                isMovable={false}
                canExtend={true}
                canShrink={true}
                shrinkBehavior="trim"
                extendBehavior="trim"
                minDuration={0.1}
                // Scissor mode
                scissorMode={scissorMode}
                onScissorClick={handleScissorClick}
              />
            ))}
            
            <Playhead zoom={timelineZoom} />
          </div>
        </div>
      </div>

      {contextMenu && (
        <ClipContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDuplicate={() => handleDuplicateClip(contextMenu.clipId)}
          onDelete={() => handleDeleteClip(contextMenu.clipId)}
          onSplit={() => handleSplitClip(contextMenu.clipId)}
          canDelete={clips.length > 1}
        />
      )}
    </div>
  );
}
