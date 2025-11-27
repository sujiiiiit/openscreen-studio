import type { TimelineLayer } from "./types";
import Clip, { type ClipProps, type ResizeBehavior } from "./clip";
import { TRACK_HEIGHT } from "./constants";

interface TrackProps {
  layer: TimelineLayer;
  zoom: number;
  onClipUpdate: (
    layerId: string,
    clipId: string,
    newStart: number,
    newDuration?: number,
    trimStart?: number,
    trimEnd?: number
  ) => void;
  selectedClipIds: Set<string>;
  onSelectClip: (clipId: string, multiSelect?: boolean) => void;
  snapEnabled: boolean;
  snapPoints: number[];
  onContextMenu?: (clipId: string, x: number, y: number) => void;
  onDuplicateClip?: (clipId: string) => void;
  onDeleteClip?: (clipId: string) => void;
  onSplitClip?: (clipId: string) => void;
  
  // Clip behavior options (applied to all clips in the track)
  /** Whether clips can be moved/dragged */
  isMovable?: boolean;
  /** Whether clips can be extended from either side */
  canExtend?: boolean;
  /** Whether clips can be extended from the start */
  canExtendFromStart?: boolean;
  /** Whether clips can be extended from the end */
  canExtendFromEnd?: boolean;
  /** Whether clips can be shrunk from either side */
  canShrink?: boolean;
  /** Whether clips can be shrunk from the start */
  canShrinkFromStart?: boolean;
  /** Whether clips can be shrunk from the end */
  canShrinkFromEnd?: boolean;
  /** Behavior when shrinking: "resize" or "trim" */
  shrinkBehavior?: ResizeBehavior;
  /** Behavior when extending: "resize" or "trim" */
  extendBehavior?: ResizeBehavior;
  /** Minimum clip duration */
  minDuration?: number;
  /** Maximum clip duration */
  maxDuration?: number;
  
  // Scissor mode
  scissorMode?: boolean;
  onScissorClick?: (clipId: string, splitTime: number) => void;
  
  // Real-time resize
  onClipResize?: (
    layerId: string,
    clipId: string,
    newStart: number,
    newDuration: number,
    trimStart: number,
    trimEnd: number
  ) => void;
}

export default function Track({
  layer,
  zoom,
  onClipUpdate,
  selectedClipIds,
  onSelectClip,
  snapEnabled,
  snapPoints,
  onContextMenu,
  // Clip behavior options
  isMovable,
  canExtend,
  canExtendFromStart,
  canExtendFromEnd,
  canShrink,
  canShrinkFromStart,
  canShrinkFromEnd,
  shrinkBehavior,
  extendBehavior,
  minDuration,
  maxDuration,
  // Scissor mode
  scissorMode,
  onScissorClick,
  onClipResize,
}: TrackProps) {
  return (
    <div
      className="relative border-b border-white/5"
      style={{
        height: TRACK_HEIGHT,
        width: "100%",
        opacity: layer.isVisible ? 1 : 0.35,
      }}
    >
      {layer.clips.map((clip) => (
        <Clip
          key={clip.id}
          clip={clip}
          zoom={zoom}
          isSelected={selectedClipIds.has(clip.id)}
          isLocked={layer.isLocked}
          snapEnabled={snapEnabled}
          snapPoints={snapPoints}
          onSelect={onSelectClip}
          onContextMenu={onContextMenu}
          onUpdate={(clipId, newStart, newDuration, trimStart, trimEnd) =>
            onClipUpdate(layer.id, clipId, newStart, newDuration, trimStart, trimEnd)
          }
          onResize={(clipId, newStart, newDuration, trimStart, trimEnd) => 
            onClipResize?.(layer.id, clipId, newStart, newDuration, trimStart, trimEnd)
          }
          // Pass through clip behavior options
          isMovable={isMovable}
          canExtend={canExtend}
          canExtendFromStart={canExtendFromStart}
          canExtendFromEnd={canExtendFromEnd}
          canShrink={canShrink}
          canShrinkFromStart={canShrinkFromStart}
          canShrinkFromEnd={canShrinkFromEnd}
          shrinkBehavior={shrinkBehavior}
          extendBehavior={extendBehavior}
          minDuration={minDuration}
          maxDuration={maxDuration}
          // Scissor mode
          scissorMode={scissorMode}
          onScissorClick={onScissorClick}
        />
      ))}
    </div>
  );
}
