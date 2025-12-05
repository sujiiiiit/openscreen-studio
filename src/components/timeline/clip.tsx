import type { TimelineClip, ResizeMode } from "./types";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { TIMELINE_START_LEFT } from "./constants";

const CLIP_COLORS: Record<string, string> = {
  video: "#f59e0b",
  audio: "#6366f1",
  text: "#c084fc",
  image: "#34d399",
  effect: "#f472b6",
};

const formatSeconds = (value: number) => `${value.toFixed(1)}s`;

// Format time as MM:SS.ms for scissor mode display
const formatTimeWithMs = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

/**
 * Resize/Extend behavior modes:
 * - "resize": Changes the clip's visible duration (default for clips without original content)
 * - "trim": Trims into the clip's original content (for video/audio with originalDuration)
 */
export type ResizeBehavior = "resize" | "trim";

export interface ClipProps {
  clip: TimelineClip;
  zoom: number;
  onUpdate: (
    id: string,
    newStart: number,
    newDuration?: number,
    trimStart?: number,
    trimEnd?: number
  ) => void;
  isSelected: boolean;
  onSelect: (clipId: string, multiSelect?: boolean) => void;
  isLocked: boolean;
  snapEnabled: boolean;
  snapPoints: number[];
  onContextMenu?: (clipId: string, x: number, y: number) => void;

  // === New Control Options ===
  
  /** Whether the clip can be moved/dragged to another position (default: true) */
  isMovable?: boolean;
  
  /** Whether the clip can be extended from either side (default: true) */
  canExtend?: boolean;
  /** Override: Whether the clip can be extended from the start (left) side */
  canExtendFromStart?: boolean;
  /** Override: Whether the clip can be extended from the end (right) side */
  canExtendFromEnd?: boolean;
  
  /** Whether the clip can be shrunk from either side (default: true) */
  canShrink?: boolean;
  /** Override: Whether the clip can be shrunk from the start (left) side */
  canShrinkFromStart?: boolean;
  /** Override: Whether the clip can be shrunk from the end (right) side */
  canShrinkFromEnd?: boolean;
  
  /**
   * Behavior when shrinking the clip:
   * - "resize": The clip duration is reduced (clip content scales or cuts)
   * - "trim": The clip stays in place but the visible portion is trimmed (reveals trimStart/trimEnd)
   * Default: "resize"
   */
  shrinkBehavior?: ResizeBehavior;
  
  /**
   * Behavior when extending the clip:
   * - "resize": The clip duration increases (may stretch content)
   * - "trim": The clip reveals more of the original content (only works if there's originalDuration)
   * Default: "resize"
   */
  extendBehavior?: ResizeBehavior;
  
  /** Minimum duration the clip can be shrunk to (in seconds, default: 0.1) */
  minDuration?: number;
  
  /** Maximum duration the clip can be extended to (in seconds, optional) */
  maxDuration?: number;
  
  // Scissor mode
  /** Whether scissor/split mode is active */
  scissorMode?: boolean;
  /** Callback when clip is clicked in scissor mode - passes clipId and the exact split time */
  onScissorClick?: (clipId: string, splitTime: number) => void;
  
  /** Callback for real-time resizing (for rolling edits) */
  onResize?: (
    id: string,
    newStart: number,
    newDuration: number,
    trimStart: number,
    trimEnd: number
  ) => void;
}

export default function Clip({
  clip,
  zoom,
  onUpdate,
  isSelected,
  onSelect,
  isLocked,
  snapEnabled,
  snapPoints,
  onContextMenu,
  // New options with defaults
  isMovable = true,
  canExtend = true,
  canExtendFromStart,
  canExtendFromEnd,
  canShrink = true,
  canShrinkFromStart,
  canShrinkFromEnd,
  shrinkBehavior = "resize",
  extendBehavior = "resize",
  minDuration = 0.1,
  maxDuration,
  // Scissor mode
  scissorMode = false,
  onScissorClick,
  onResize,
}: ClipProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeMode, setResizeMode] = useState<ResizeMode>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialStart, setInitialStart] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const [initialTrimStart, setInitialTrimStart] = useState(0);
  const [initialTrimEnd, setInitialTrimEnd] = useState(0);
  const [currentStart, setCurrentStart] = useState(clip.start);
  const [currentDuration, setCurrentDuration] = useState(clip.duration);
  const [currentTrimStart, setCurrentTrimStart] = useState(clip.trimStart ?? 0);
  const [currentTrimEnd, setCurrentTrimEnd] = useState(clip.trimEnd ?? 0);
  const [isHovered, setIsHovered] = useState(false);
  const clipRef = useRef<HTMLDivElement>(null);
  
  // Scissor mode hover state
  const [scissorHoverX, setScissorHoverX] = useState<number | null>(null);
  const [scissorTime, setScissorTime] = useState<number | null>(null);

  const SNAP_THRESHOLD = 0.2; // seconds
  const HANDLE_WIDTH = 8; // pixels

  // Computed extend/shrink permissions
  const canExtendStart = canExtendFromStart ?? canExtend;
  const canExtendEnd = canExtendFromEnd ?? canExtend;
  const canShrinkStart = canShrinkFromStart ?? canShrink;
  const canShrinkEnd = canShrinkFromEnd ?? canShrink;
  
  // Check if start/end handles should be shown
  const showStartHandle = canExtendStart || canShrinkStart;
  const showEndHandle = canExtendEnd || canShrinkEnd;

  // Calculate max extendable duration based on original content
  const originalDuration = clip.originalDuration ?? clip.duration;
  const effectiveMaxDuration = maxDuration ?? (extendBehavior === "trim" ? originalDuration : Infinity);

  useEffect(() => {
    // Don't sync props to state while user is interacting to prevent fighting
    if (isDragging || resizeMode) return;
    
    setCurrentStart(clip.start);
    setCurrentDuration(clip.duration);
    setCurrentTrimStart(clip.trimStart ?? 0);
    setCurrentTrimEnd(clip.trimEnd ?? 0);
  }, [clip.start, clip.duration, clip.trimStart, clip.trimEnd, isDragging, resizeMode]);

  const waveform = useMemo(() => clip.waveform?.slice(0, 80) ?? [], [clip.waveform]);
  const displayColor = clip.color ?? CLIP_COLORS[clip.type] ?? "#3b82f6";
  const speed = clip.speed ?? 1;
  const metadataText = clip.metadata ?? `${formatSeconds(clip.duration)} · ${speed.toFixed(1)}x`;

  const findSnapPoint = useCallback(
    (value: number): number => {
      if (!snapEnabled) return value;

      for (const point of snapPoints) {
        if (Math.abs(value - point) < SNAP_THRESHOLD) {
          return point;
        }
      }
      return value;
    },
    [snapEnabled, snapPoints]
  );

  // Handle mouse move for scissor mode preview
  const handleScissorMouseMove = (e: React.MouseEvent) => {
    if (!scissorMode || !clipRef.current) {
      setScissorHoverX(null);
      setScissorTime(null);
      return;
    }
    
    const rect = clipRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const clipWidthPx = currentDuration * zoom;
    const clickRatio = Math.max(0, Math.min(1, relativeX / clipWidthPx));
    const timeInClip = currentDuration * clickRatio;
    const absoluteTime = currentStart + timeInClip;
    
    setScissorHoverX(relativeX);
    setScissorTime(absoluteTime);
  };

  // Clear scissor hover when leaving clip
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setScissorHoverX(null);
    setScissorTime(null);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;

    e.stopPropagation();
    
    // Handle scissor mode click
    if (scissorMode && onScissorClick && clipRef.current) {
      const rect = clipRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const clipWidthPx = currentDuration * zoom;
      const clickRatio = Math.max(0, Math.min(1, relativeX / clipWidthPx));
      const timeInClip = currentDuration * clickRatio;
      const splitTime = currentStart + timeInClip;
      
      onScissorClick(clip.id, splitTime);
      return;
    }

    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;

    // Check if clicking on start handle
    if (relativeX < HANDLE_WIDTH && showStartHandle) {
      setResizeMode("start");
      setDragStartX(e.clientX);
      setInitialStart(currentStart);
      setInitialDuration(currentDuration);
      setInitialTrimStart(currentTrimStart);
      setInitialTrimEnd(currentTrimEnd);
      return;
    }

    // Check if clicking on end handle
    if (relativeX > rect.width - HANDLE_WIDTH && showEndHandle) {
      setResizeMode("end");
      setDragStartX(e.clientX);
      setInitialStart(currentStart);
      setInitialDuration(currentDuration);
      setInitialTrimStart(currentTrimStart);
      setInitialTrimEnd(currentTrimEnd);
      return;
    }

    // Regular drag (if movable)
    if (isMovable) {
      onSelect(clip.id, e.shiftKey);
      setIsDragging(true);
      setDragStartX(e.clientX);
      setInitialStart(currentStart);
    } else {
      // Just select if not movable
      onSelect(clip.id, e.shiftKey);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isLocked) return;

      if (resizeMode === "start") {
        const deltaX = e.clientX - dragStartX;
        const deltaSeconds = deltaX / zoom;
        
        // Determine if we're extending (negative delta) or shrinking (positive delta)
        const isExtending = deltaSeconds < 0;
        const isShrinking = deltaSeconds > 0;
        
        // Check permissions
        if (isExtending && !canExtendStart) return;
        if (isShrinking && !canShrinkStart) return;

        let newStart = initialStart + deltaSeconds;
        let newDuration = initialDuration - deltaSeconds;
        let newTrimStart = initialTrimStart;

        // Apply behavior based on shrink/extend mode
        if (isShrinking && shrinkBehavior === "trim") {
          // Trim mode: Start moves right, Duration decreases, TrimStart increases
          newStart = initialStart + deltaSeconds;
          newDuration = initialDuration - deltaSeconds;
          newTrimStart = initialTrimStart + deltaSeconds;
          
          // Limit trim to not exceed visible duration
          if (newDuration < minDuration) {
            const diff = minDuration - newDuration;
            newStart -= diff;
            newDuration = minDuration;
            newTrimStart -= diff;
          }
        } else if (isExtending && extendBehavior === "trim") {
          // Extend by revealing more content (reduce trimStart)
          const maxExtend = initialTrimStart; // Can only extend by what was trimmed
          const actualExtend = Math.min(-deltaSeconds, maxExtend);
          newStart = initialStart - actualExtend;
          newDuration = initialDuration + actualExtend;
          newTrimStart = initialTrimStart - actualExtend;
        } else {
          // Standard resize behavior
          // Prevent going below minimum duration
          if (newDuration < minDuration) {
            newDuration = minDuration;
            newStart = initialStart + initialDuration - minDuration;
          }
          
          // Prevent exceeding maximum duration
          if (effectiveMaxDuration && newDuration > effectiveMaxDuration) {
            newDuration = effectiveMaxDuration;
            newStart = initialStart + initialDuration - effectiveMaxDuration;
          }
          
          // Prevent negative start
          if (newStart < 0) {
            newDuration = newDuration + newStart;
            newStart = 0;
          }
          
          newStart = findSnapPoint(newStart);
        }

        setCurrentStart(newStart);
        setCurrentDuration(newDuration);
        setCurrentTrimStart(newTrimStart);
        
        if (onResize) {
          onResize(clip.id, newStart, newDuration, newTrimStart, currentTrimEnd);
        }
        
      } else if (resizeMode === "end") {
        const deltaX = e.clientX - dragStartX;
        const deltaSeconds = deltaX / zoom;
        
        // Determine if we're extending (positive delta) or shrinking (negative delta)
        const isExtending = deltaSeconds > 0;
        const isShrinking = deltaSeconds < 0;
        
        // Check permissions
        if (isExtending && !canExtendEnd) return;
        if (isShrinking && !canShrinkEnd) return;

        let newDuration = initialDuration + deltaSeconds;
        let newTrimEnd = initialTrimEnd;

        // Apply behavior based on shrink/extend mode
        if (isShrinking && shrinkBehavior === "trim") {
          // Trim mode: Duration decreases, TrimEnd increases
          // deltaSeconds is negative here
          const shrinkAmount = -deltaSeconds;
          newDuration = initialDuration - shrinkAmount;
          newTrimEnd = initialTrimEnd + shrinkAmount;
          
          if (newDuration < minDuration) {
            const diff = minDuration - newDuration;
            newDuration = minDuration;
            newTrimEnd -= diff;
          }
        } else if (isExtending && extendBehavior === "trim") {
          // Extend by revealing more content (reduce trimEnd)
          const maxExtend = initialTrimEnd; // Can only extend by what was trimmed
          const actualExtend = Math.min(deltaSeconds, maxExtend);
          newDuration = initialDuration + actualExtend;
          newTrimEnd = initialTrimEnd - actualExtend;
        } else {
          // Standard resize behavior
          // Prevent going below minimum duration
          if (newDuration < minDuration) {
            newDuration = minDuration;
          }
          
          // Prevent exceeding maximum duration
          if (effectiveMaxDuration && newDuration > effectiveMaxDuration) {
            newDuration = effectiveMaxDuration;
          }
        }

        setCurrentDuration(newDuration);
        setCurrentTrimEnd(newTrimEnd);
        
        if (onResize) {
          onResize(clip.id, currentStart, newDuration, currentTrimStart, newTrimEnd);
        }
        
      } else if (isDragging && isMovable) {
        const deltaX = e.clientX - dragStartX;
        const deltaSeconds = deltaX / zoom;
        const newStart = Math.max(0, findSnapPoint(initialStart + deltaSeconds));
        setCurrentStart(newStart);
      }
    },
    [
      isDragging,
      resizeMode,
      dragStartX,
      zoom,
      initialStart,
      initialDuration,
      initialTrimStart,
      initialTrimEnd,
      isLocked,
      isMovable,
      findSnapPoint,
      canExtendStart,
      canExtendEnd,
      canShrinkStart,
      canShrinkEnd,
      shrinkBehavior,
      extendBehavior,
      minDuration,
      effectiveMaxDuration,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onUpdate(clip.id, currentStart, currentDuration, currentTrimStart, currentTrimEnd);
    } else if (resizeMode) {
      setResizeMode(null);
      onUpdate(clip.id, currentStart, currentDuration, currentTrimStart, currentTrimEnd);
    }
  }, [isDragging, resizeMode, onUpdate, clip.id, currentStart, currentDuration, currentTrimStart, currentTrimEnd]);

  useEffect(() => {
    if (isDragging || resizeMode) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, resizeMode, handleMouseMove, handleMouseUp]);

  // Calculate visible duration (accounting for trims)
  // In the current implementation, currentDuration IS the visible duration on the timeline
  // The previous calculation subtracting trims was incorrect as duration is already the split length
  const displayWidth = Math.max(currentDuration * zoom, 40);

  // Determine cursor style
  const getCursorStyle = () => {
    if (isLocked) return "cursor-not-allowed";
    if (scissorMode) return "cursor-crosshair";
    if (resizeMode || isDragging) return "";
    if (!isMovable) return "cursor-default";
    return "cursor-move";
  };

  return (
    <div
      ref={clipRef}
      className={cn(
        "group absolute flex h-[calc(100%-8px)] select-none items-center justify-center overflow-hidden rounded-md border border-white/10 px-2 sm:px-3 text-xs   transition bg-primary-active/20",
        (isDragging || resizeMode) && !isLocked && "ring-2 ring-primary",
        isSelected && "ring-2 ring-white",
        isLocked && "opacity-70",
        getCursorStyle()
      )}
      style={{
        // Fix: Position should be based on start time only. trimStart is an internal media offset.
        left: TIMELINE_START_LEFT + currentStart * zoom,
        width: displayWidth,
        top: 4,
        
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleScissorMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
          onContextMenu(clip.id, e.clientX, e.clientY);
        }
      }}
    >
      {/* Scissor mode split preview */}
      {scissorMode && scissorHoverX !== null && scissorTime !== null && (
        <>
          {/* Vertical split line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
            style={{ left: scissorHoverX }}
          >
            {/* Triangle indicator at top */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-red-500" />
            {/* Triangle indicator at bottom */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-red-500" />
          </div>
          {/* Time indicator tooltip */}
          <div 
            className="absolute -top-8 z-30 pointer-events-none transform -translate-x-1/2 bg-red-500  text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap"
            style={{ left: scissorHoverX }}
          >
            {formatTimeWithMs(scissorTime)}
          </div>
        </>
      )}
      
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.2) 1px, transparent 1px)",
          backgroundSize: `${Math.max(zoom, 12)}px 100%`,
        }}
      />
      {waveform.length > 0 && (
        <div className="pointer-events-none absolute inset-x-1 sm:inset-x-2 inset-y-2 sm:inset-y-3 flex items-end gap-[1px] opacity-60">
          {waveform.map((value, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: waveform samples no unique identifier
              key={index}
              className="block w-[1px] sm:w-[1.5px] rounded-full"
              style={{ height: `${Math.max(6, value * 20)}px` }}
            />
          ))}
        </div>
      )}
      <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
        <div className="flex flex-col text-center min-w-0">
          <span className=" leading-tight truncate">
            {clip.name}
          </span>
        </div>
      </div>
      
      {/* Trim indicators - show when clip is trimmed */}
      {currentTrimStart > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-active/20" title={`Trimmed: ${formatSeconds(currentTrimStart)}`} />
      )}
      {currentTrimEnd > 0 && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-active/20" title={`Trimmed: ${formatSeconds(currentTrimEnd)}`} />
      )}
      
      {/* Resize Handles */}
      {!isLocked && (isHovered || isSelected) && (
        <>
          {showStartHandle && (
            <div
              className={cn(
                "absolute left-0 inset-y-0 w-4 z-20 flex items-center justify-start pl-1.5 group/handle",
                canExtendStart || canShrinkStart
                  ? "cursor-ew-resize"
                  : "cursor-not-allowed"
              )}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (!isLocked && (canExtendStart || canShrinkStart)) {
                  setResizeMode("start");
                  setDragStartX(e.clientX);
                  setInitialStart(currentStart);
                  setInitialDuration(currentDuration);
                  setInitialTrimStart(currentTrimStart);
                  setInitialTrimEnd(currentTrimEnd);
                }
              }}
            >
              <div className="w-1 h-6 bg-white rounded-full transition-all shadow-sm" />
            </div>
          )}
          {showEndHandle && (
            <div
              className={cn(
                "absolute right-0 inset-y-0 w-4 z-20 flex items-center justify-end pr-1.5 group/handle",
                canExtendEnd || canShrinkEnd
                  ? "cursor-ew-resize"
                  : "cursor-not-allowed"
              )}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (!isLocked && (canExtendEnd || canShrinkEnd)) {
                  setResizeMode("end");
                  setDragStartX(e.clientX);
                  setInitialStart(currentStart);
                  setInitialDuration(currentDuration);
                  setInitialTrimStart(currentTrimStart);
                  setInitialTrimEnd(currentTrimEnd);
                }
              }}
            >
              <div className="w-1 h-6 bg-white rounded-full transition-all shadow-sm" />
            </div>
          )}
        </>
      )}
      {/* Start and End Time Display */}
      <div className="absolute top-1 left-4 text-[9px] text-primary pointer-events-none z-10">
        {formatTimeWithMs(currentStart)}
      </div>
      <div className="absolute top-1 right-4 text-[9px] text-primary pointer-events-none z-10">
        {formatTimeWithMs(currentStart + currentDuration)}
      </div>
    </div>
  );
}
