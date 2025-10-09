import type { WindowControlsProps } from "@/types";

export function MacWindowControls({
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
}: WindowControlsProps) {
  return (
    <div
      className="flex items-center gap-2 pl-4"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <button
        className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center group"
        onClick={onClose}
        title="Close"
      >
        <svg
          className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 8 8"
        >
          <path d="M1 1l6 6M7 1l-6 6" />
        </svg>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center group"
        onClick={onMinimize}
        title="Minimize"
      >
        <svg
          className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 8 8"
        >
          <path d="M1 4h6" />
        </svg>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center group"
        onClick={onMaximize}
        title={isMaximized ? "Restore" : "Maximize"}
      >
        <svg
          className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 8 8"
        >
          {isMaximized ? (
            <path d="M2 2v4h4V2H2zM1 1v2h1V2h2V1H1z" />
          ) : (
            <path d="M1 1v6h6V1H1z" />
          )}
        </svg>
      </button>
    </div>
  );
}
