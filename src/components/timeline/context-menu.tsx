import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Delete01Icon, Copy01Icon, Scissor01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onDuplicate: () => void
  onDelete: () => void
  onSplit: () => void
  canDuplicate?: boolean
  canDelete?: boolean
  canSplit?: boolean
}

export default function ClipContextMenu({
  x,
  y,
  onClose,
  onDuplicate,
  onDelete,
  onSplit,
  canDuplicate = false,
  canDelete = false,
  canSplit = false,
}: ContextMenuProps) {
  return (
    <DropdownMenu open onOpenChange={(open) => !open && onClose()}>
      {/* Invisible trigger positioned where user right-clicked */}
      <DropdownMenuPrimitive.Trigger
        className="fixed w-0 h-0 pointer-events-none"
        style={{ left: x, top: y }}
      />
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={0}
        alignOffset={0}
        className="min-w-[180px]"
      >
        <DropdownMenuItem
          disabled={!canDuplicate}
          onClick={() => {
            onDuplicate()
            onClose()
          }}
        >
          <HugeiconsIcon icon={Copy01Icon} className="size-4" />
          <span>Duplicate</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          disabled={!canSplit}
          onClick={() => {
            onSplit()
            onClose()
          }}
        >
          <HugeiconsIcon icon={Scissor01Icon} className="size-4" />
          <span>Split at Playhead</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          variant="destructive"
          disabled={!canDelete}
          onClick={() => {
            onDelete()
            onClose()
          }}
        >
          <HugeiconsIcon icon={Delete01Icon} className="size-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
